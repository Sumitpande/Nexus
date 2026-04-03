import { NextFunction, Request, Response } from "express";

import {
  addReaction,
  createConversation,
  createMessage,
  getConversationListForUser,
  getMessages,
  removeReaction,
} from "./chat.service";
import {
  createConversationSchema,
  getMessagesQuerySchema,
  getMessagesSchema,
  reactionSchema,
  sendMessageSchema,
} from "./chat.validation";
import { getIO } from "../../sockets/socket.instance";
import { BadRequestError } from "@nexus/errors";

export async function getMessagesHandler(req: Request, res: Response, next: NextFunction) {

  try {
    const paramsParsed = getMessagesSchema.safeParse(req.params);
    const queryParsed = getMessagesQuerySchema.safeParse(req.query);

    if (!paramsParsed.success || !queryParsed.success) throw new BadRequestError("Invalid payload")
    const { conversationId } = paramsParsed.data;
    const { cursor, limit } = queryParsed.data;
    // @ts-ignore
    const userId = req.userId!;

    const messages = await getMessages(conversationId, userId, cursor, limit);
    return res.json(messages);
  } catch (error) {
    next(error)
  }

}

export async function createConversationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError("Invalid payload")

    const { userIds } = parsed.data;
    //  @ts-ignore
    const creatorId = req.userId!;

    const result = await createConversation(creatorId, userIds);

    return res.status(201).json(result);
  } catch (error) {
    next(error)
  }
}

export async function getConversationListHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    const userId = req.userId!;
    const conversations = await getConversationListForUser(userId);
    return res.json(conversations);
  } catch (error) {
    next(error)
  }
}

export async function sendMessageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError("Invalid payload")

    const { conversationId, content, replyTo, type } = parsed.data;
    // @ts-ignore
    const senderId = req.userId!;

    const message = await createMessage(
      conversationId,
      senderId,
      content,
      replyTo,
      type,
    );
    // Emit message to conversation via Socket.IO
    const io = getIO();
    io.to(conversationId).emit("message:new", message);

    return res.status(201).json(message);
  } catch (error) {
    next(error)
  }
}

export async function addReactionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Implementation for adding reaction to a message
    const parsed = reactionSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError("Invalid payload")
    const { messageId, emoji } = parsed.data;
    // @ts-ignore
    const userId = req.userId!;

    const reaction = await addReaction(messageId, userId, emoji);
    if (!reaction) {
      return res.sendStatus(200);
    }

    const io = getIO();

    io.to(reaction.conversation_id).emit("reaction:added", {
      conversationId: reaction.conversation_id,
      messageId: reaction.message_id,
      emoji: reaction.emoji,
      userId: reaction.user_id,
      action: "add"
    });
    return res.sendStatus(200);
  } catch (error) {
    next(error)
  }
}

export async function removeReactionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Implementation for removing reaction from a message
    const parsed = reactionSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError("Invalid payload")
    const { messageId, emoji } = parsed.data;
    // @ts-ignore
    const userId = req.userId!;

    const reaction = await removeReaction(messageId, userId, emoji);
    if (!reaction) {
      return res.sendStatus(200);
    }

    const io = getIO();

    io.to(reaction.conversation_id).emit("reaction:removed", {
      conversationId: reaction.conversation_id,
      messageId: reaction.message_id,
      emoji: reaction.emoji,
      userId: reaction.user_id,
      action: "remove"
    });

    return res.sendStatus(200);
  } catch (error) {
    next(error)
  }
}

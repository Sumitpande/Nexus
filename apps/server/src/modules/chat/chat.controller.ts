import { Request, Response } from "express";
import pool from "../../db/postgres";
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

export async function getMessagesHandler(req: Request, res: Response) {
  const paramsParsed = getMessagesSchema.safeParse(req.params);
  const queryParsed = getMessagesQuerySchema.safeParse(req.query);

  if (!paramsParsed.success || !queryParsed.success) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const { conversationId } = paramsParsed.data;
  const { cursor, limit } = queryParsed.data;
  // @ts-ignore
  const userId = req.userId!;

  const messages = await getMessages(conversationId, userId, cursor, limit);
  return res.json(messages);
}

export async function createConversationHandler(req: Request, res: Response) {
  const parsed = createConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { userIds } = parsed.data;
  //  @ts-ignore
  const creatorId = req.userId!;

  const result = await createConversation(creatorId, userIds);

  return res.status(201).json(result);
}

export async function getConversationListHandler(req: Request, res: Response) {
  // @ts-ignore
  const userId = req.userId!;
  const conversations = await getConversationListForUser(userId);
  return res.json(conversations);
}

export async function sendMessageHandler(req: Request, res: Response) {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

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
}

export async function addReactionHandler(req: Request, res: Response) {
  // Implementation for adding reaction to a message
  const parsed = reactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  const { messageId, emoji } = parsed.data;
  // @ts-ignore
  const userId = req.userId!;

  await addReaction(messageId, userId, emoji);

  return res.sendStatus(200);
}

export async function removeReactionHandler(req: Request, res: Response) {
  // Implementation for removing reaction from a message
  const parsed = reactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }
  const { messageId, emoji } = parsed.data;
  // @ts-ignore
  const userId = req.userId!;

  await removeReaction(messageId, userId, emoji);

  return res.sendStatus(200);
}

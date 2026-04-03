import { Message } from "./chat.types";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@nexus/errors";
import { addMessageReaction, addNewMessage, createNewConversation, createNewMessage, getConversationByIdForUser, getConversationFromMessageId, getConversationMessages, getDirectConversation, getMessageById, getUserConversationList, isReplyValid, isUserInConversation, removeMessageReaction } from "./chat.repository";

const { v4: uuid } = require("uuid");

export async function saveMessage({
  conversationId,
  senderId,
  content,
}: {
  conversationId: string;
  senderId: string;
  content: string;
}): Promise<Message> {
  // Verify user is part of conversation
  const isMemberOfConversation = await isUserInConversation(senderId, conversationId);
  if (!isMemberOfConversation) throw new BadRequestError("Not a member of conversation");
  const id = uuid();
  const res = await addNewMessage(id, conversationId, senderId, content);

  return {
    id: res.id,
    conversationId: res.conversation_id,
    senderId: res.sender_id,
    content: res.content,
    createdAt: res.created_at,
    type: "text",
  };
}

export async function createConversation(creatorId: string, userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds)).filter(
    (id) => id !== creatorId,
  );

  if (uniqueUserIds.length === 0) throw new BadRequestError("Cannot create conversation with yourself")

  let conversationId: string;

  // DIRECT CONVERSATION
  if (uniqueUserIds.length === 1) {
    const otherUserId = uniqueUserIds[0];

    // Check if direct conversation already exists
    const existing = await getDirectConversation(creatorId, otherUserId)

    if (existing.rowCount && existing.rowCount > 0) {
      conversationId = existing.rows[0].id;
    } else {
      // Create new direct conversation
      const created = await createNewConversation("direct", creatorId, [
        creatorId,
        otherUserId,
      ]);
      conversationId = created.conversationId;
    }
  } else {
    // GROUP CONVERSATION
    const created = await createNewConversation("group", creatorId, [
      creatorId,
      ...uniqueUserIds,
    ]);
    conversationId = created.conversationId;
  }

  const result = await getConversationByIdForUser(
    conversationId,
    creatorId,
  );
  if (result.rowCount === 0) return null;
  return normalizeConversationRow(result.rows[0], creatorId);
}


export const getConversationListForUser = async (userId: string) => {

  const result = await getUserConversationList(userId)


  return result.rows.map((row) => {
    const participants = row.participants ?? [];

    let title =
      row.group_name ?? participants.map((p: any) => p.name).join(", ");
    let avatar = row.group_avatar ?? "";
    if (row.type === "direct") {
      const otherUser = participants.find((p: any) => p.id !== userId);
      title = otherUser?.name ?? "Unknown User";
    }
    return {
      id: row.conversation_id,
      type: row.type,
      title,
      avatar,
      lastMessage: row.last_message,
      lastMessageTime: row.last_message_time,
      participants,
    };
  });
};




function normalizeConversationRow(row: any, userId: string) {
  const participants = row.participants ?? [];

  let title = row.group_name ?? participants.map((p: any) => p.name).join(", ");
  let avatar = row.group_avatar ?? "";

  if (row.type === "direct") {
    const otherUser = participants.find((p: any) => p.id !== userId);
    title = otherUser?.name ?? "Unknown User";
  }

  return {
    id: row.conversation_id,
    type: row.type,
    title,
    avatar,
    lastMessage: row.last_message,
    lastMessageTime: row.last_message_time,
    participants,
  };
}

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string,
  replyTo: string | null = null,
  type: "text" | "system" = "text",
) {
  if (replyTo) {
    const isValid = await isReplyValid(conversationId, replyTo);
    if (!isValid) {
      throw new NotFoundError("Reply to message not found")
    }
  }
  // Verify user is part of conversation
  if (!await isUserInConversation(senderId, conversationId)) throw new UnauthorizedError("Not a member of conversation")

  // Save message
  const result = await createNewMessage(conversationId, senderId, content, replyTo, type)
  const messageId = result.rows[0].id;
  // Fetch full message with joins
  const fullMessage = await getMessageById(messageId)


  return mapMessages(fullMessage.rows)[0];
}

export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {

  const result = await addMessageReaction(messageId, userId, emoji)
  return result // may be undefined if conflict
}

export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {
  const result = await removeMessageReaction(messageId, userId, emoji)

  if (result.rowCount === 0) return null;

  const conversation = await getConversationFromMessageId(messageId)

  return {
    conversation_id: conversation.rows[0].conversation_id,
    message_id: messageId,
    user_id: userId,
    emoji,
  };
}

export async function getMessages(
  conversationId: string,
  userId: string,
  cursor: string | undefined,
  limit: number,
) {
  // Verify user is part of conversation
  const isValidConversation = await isUserInConversation(userId, conversationId)

  if (!isValidConversation) {
    throw new UnauthorizedError("Not a member of conversation");
  }

  const result = await getConversationMessages(conversationId, cursor, limit);

  return mapMessages(result.rows).reverse(); // ASC for UI
}

function mapMessages(rows: any[]) {
  const map = new Map<string, any>();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        content: row.content,
        timestamp: row.created_at,
        type: row.type,
        replyTo: row.reply_id
          ? {
            id: row.reply_id,
            content: row.reply_content,
            senderId: row.reply_sender,
          }
          : null,
        reactions: {},
      });
    }

    if (row.emoji && row.user_ids) {
      map.get(row.id).reactions[row.emoji] = row.user_ids
    }
  }

  return Array.from(map.values());
}

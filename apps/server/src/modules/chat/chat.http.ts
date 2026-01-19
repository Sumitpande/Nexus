import { Request, Response } from "express";
import pool from "../../db/postgres";
import { createConversation, getConversationListForUser } from "./chat.service";
import { createConversationSchema } from "./chat.validation";

export async function getMessages(req: Request, res: Response) {
  const { conversationId } = req.params;
  // @ts-ignore
  const userId = req.userId;

  const member = await pool.query(
    `
    SELECT 1 FROM conversation_members
    WHERE conversation_id = $1 AND user_id = $2
    `,
    [conversationId, userId],
  );

  if (member.rowCount === 0) {
    return res.sendStatus(403);
  }

  const messages = await pool.query(
    `
    SELECT id, conversation_id, sender_id, content, created_at
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at DESC
    LIMIT 50
    `,
    [conversationId],
  );

  return res.json(messages.rows);
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

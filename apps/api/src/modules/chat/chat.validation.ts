import { z } from "zod";

export const getMessagesSchema = z.object({
  conversationId: z.string().uuid(),
});

export const getMessagesQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  type: z.enum(["text", "system"]).default("text"),
  replyTo: z.string().uuid().optional().nullable(),
});

export const reactionSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
});

export const createConversationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(50),
});

export const replyPreviewSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  senderId: z.string().uuid(),
});

export const reactionDTO = z.object({
  emoji: z.string(),
  userIds: z.array(z.string().uuid()),
});

export const messageDTOSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string(),
  timestamp: z.string(),
  type: z.enum(["text", "system"]),
  replyTo: replyPreviewSchema.nullable().optional(),
  reactions: z.array(reactionDTO),
});

export type MessageDTO = z.infer<typeof messageDTOSchema>;

export type ReactionPayload = z.infer<typeof reactionSchema>;

export type SendMessagePayload = z.infer<typeof sendMessageSchema>;

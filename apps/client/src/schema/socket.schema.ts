import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
});

export const receiveMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

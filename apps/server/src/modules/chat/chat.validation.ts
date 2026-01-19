import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  clientMessageId: z.string().uuid(),
});

export type SendMessagePayload = z.infer<typeof sendMessageSchema>;

export const createConversationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(50),
});

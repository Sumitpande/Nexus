import { z } from "zod";

export const searchUserSchema = z.object({
  q: z.string().min(2).max(50),
});

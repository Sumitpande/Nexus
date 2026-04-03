import { type Request, Response } from "express";
import { searchUserSchema } from "./user.validation";
import { queryUsers } from "./user.repository";

export async function searchUsers(req: Request, res: Response) {
  const parsed = searchUserSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid search query" });
  }

  const { q } = parsed.data;
  // @ts-ignore
  const userId: string = req.userId; // from auth middleware
  const result = await queryUsers(userId, q)

  return res.json(result.rows);
}

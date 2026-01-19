import { type Request, Response } from "express";
import pool from "../../db/postgres";
import { searchUserSchema } from "./user.validation";

export async function searchUsers(req: Request, res: Response) {
  const parsed = searchUserSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid search query" });
  }

  const { q } = parsed.data;
  // @ts-ignore
  const userId = req.userId; // from auth middleware

  const result = await pool.query(
    `
    SELECT id, name, email
    FROM users
    WHERE
      is_disabled = false
      AND id <> $1
      AND (
        LOWER(name) LIKE LOWER($2)
        OR LOWER(email) LIKE LOWER($2)
      )
    ORDER BY name
    LIMIT 10
    `,
    [userId, `%${q}%`],
  );

  return res.json(result.rows);
}

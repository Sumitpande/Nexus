import pool from "../../db/postgres";
const { v4: uuid } = require("uuid");
export async function findUserByEmail(email: string) {
  const res = await pool.query(
    "SELECT id, email, name, password, is_disabled FROM users WHERE email = $1",
    [email]
  );
  return res.rows[0] || null;
}
export async function getUserById(userId: string) {
  const res = await pool.query(
    "SELECT id, email, name, is_disabled, created_at, last_login FROM users WHERE id = $1",
    [userId]
  );
  return res.rows[0] || null;
}

export async function createUser(
  email: string,
  name: string,
  passwordHash: string
) {
  // Wrap in a transaction if you will do more complex setup (roles etc)
  const userId = uuid();
  const res = await pool.query(
    "INSERT INTO users (id, email, name, password) VALUES ($1, $2, $3, $4) RETURNING id, email, name, created_at",
    [userId, email, name, passwordHash]
  );
  return res.rows[0];
}

export async function setLastLogin(userId: string) {
  await pool.query("UPDATE users SET last_login = now() WHERE id = $1", [
    userId,
  ]);
}

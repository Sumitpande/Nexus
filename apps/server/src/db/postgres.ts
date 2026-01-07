import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function connectPostgres() {
  await pool.query("SELECT 1");
  console.info("➡️  PostgreSQL connected");
}

export default pool;

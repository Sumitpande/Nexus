import Redis from "ioredis";

export async function connectRedis() {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
  });

  redis.on("connect", () => {
    console.info("➡️  Redis connected");
  });

  redis.on("error", (err) => {
    console.error("❌  Redis error", err);
  });

  return redis;
}

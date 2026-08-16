import http from "http";
import app from "./app";
import { initSocket } from "./sockets";
import { connectPostgres } from "@nexus/db";
import { connectRedis } from "@nexus/redis";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await connectPostgres();
    const redisClient = await connectRedis();

    const server = http.createServer(app);

    initSocket(server, redisClient);

    server.listen(PORT, () => {
      console.log(`➡️  API Gateway running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌  API Gateway startup failed", err);
    process.exit(1);
  }
}

bootstrap();

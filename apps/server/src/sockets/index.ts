import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { socketAuthMiddleware } from "./auth.middleware";
import { registerChatSocket } from "../modules/chat/chat.socket";
import { setIO } from "./socket.instance";

export function initSocket(httpServer: any, redisClient: any) {
  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  const pubClient = redisClient;
  const subClient = pubClient.duplicate();
  io.use(socketAuthMiddleware);
  io.adapter(createAdapter(pubClient, subClient));

  registerChatSocket(io);

  io.on("connection", (socket) => {
    console.log("➡️  Socket connected", socket.id);

    socket.on("disconnect", () => {
      console.log("❌  Socket disconnected", socket.id);
    });
  });
  setIO(io);
  return io;
}

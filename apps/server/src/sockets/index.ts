import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

export function initSocket(httpServer: any, redisClient: any) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  const pubClient = redisClient;
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    console.log("➡️  Socket connected", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send_message", async (payload) => {
      io.to(payload.roomId).emit("message_received", payload);
    });

    socket.on("disconnect", () => {
      console.log("❌  Socket disconnected", socket.id);
    });
  });
}

import { Server, Socket } from "socket.io";
import { isUserInConversation, saveMessage } from "./chat.service";

export function registerChatSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    console.log("💬 Chat socket connected:", userId);

    socket.on("conversation:join", async (conversationId: string) => {
      const allowed = await isUserInConversation(userId, conversationId);
      if (!allowed) return;

      socket.join(conversationId);
    });

    socket.on(
      "message:send",
      async ({ conversationId, content, clientMessageId }) => {
        try {
          const message = await saveMessage({
            conversationId,
            senderId: userId,
            content,
          });

          // ACK sender
          socket.emit("message:ack", {
            clientMessageId,
            message,
          });

          // Broadcast to room
          socket.to(conversationId).emit("message:new", message);
        } catch {
          socket.emit("message:error", { clientMessageId });
        }
      },
    );

    socket.on("typing:start", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:start", {
        conversationId,
        userId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:stop", {
        conversationId,
        userId,
      });
    });
  });
}

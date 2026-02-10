import { useEffect } from "react";
import { getSocket } from "@/socket/socket";

import { useChatUtility } from "@/hooks/useChatUtiliy";
import { useChatStore } from "@/store/chatStore";

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { onSocketRecieveMessage, onSocketAckMessage, onSocketMessageFailed } =
    useChatUtility();
  const { conversations } = useChatStore();
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      return;
    }
    socket.on("message:new", onSocketRecieveMessage);
    socket.on("message:ack", onSocketAckMessage);
    socket.on("message:error", onSocketMessageFailed);

    socket.on("connect", () => {
      console.log("Socket connected, joining rooms...");

      conversations.forEach((id) => {
        socket.emit("conversation:join", id);
      });
    });

    return () => {
      socket.off("message:new", onSocketRecieveMessage);
      socket.off("message:ack", onSocketAckMessage);
      socket.off("message:error", onSocketMessageFailed);
      socket.off("connect");
    };
  }, []);

  return <>{children}</>;
}

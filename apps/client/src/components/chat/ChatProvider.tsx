import { useEffect } from "react";
import { getSocket } from "@/socket/socket";

import { useChatUtility } from "@/hooks/useChatUtility";
import { useChatStore } from "@/store/chatStore";
// import { useAuthStore } from "@/store/auth.store";

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { onSocketReceiveMessage, onSocketAckMessage, onSocketMessageFailed, onSocketReactionUpdate } =
    useChatUtility();
  const { conversations } = useChatStore();
  // const { user, accessToken } = useAuthStore();
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      return;
    }
    socket.on("message:new", onSocketReceiveMessage);
    socket.on("message:ack", onSocketAckMessage);
    socket.on("message:error", onSocketMessageFailed);
    socket.on("reaction:added", onSocketReactionUpdate);
    socket.on("reaction:removed", onSocketReactionUpdate);
    socket.on("connect", () => {
      console.log("Socket connected.");

      conversations.forEach((conversation) => {
        console.log("joining rooms...");
        socket.emit("conversation:join", conversation.id);
      });
    });

    return () => {
      socket.off("message:new", onSocketReceiveMessage);
      socket.off("message:ack", onSocketAckMessage);
      socket.off("message:error", onSocketMessageFailed);
      socket.off("reaction:added", onSocketReactionUpdate);
      socket.off("reaction:removed", onSocketReactionUpdate);
      socket.off("connect");
    };
  }, [conversations]);

  return <>{children}</>;
}

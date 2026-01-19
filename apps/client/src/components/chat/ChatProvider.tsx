import { useEffect } from "react";
import { getSocket, connectSocket } from "@/socket/socket";
import { useChatStore } from "@/store/chatStore";

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const ackMessage = useChatStore((s) => s.ackMessage);
  const markMessageFailed = useChatStore((s) => s.markMessageFailed);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    socket.on("message:new", receiveMessage);
    socket.on("message:ack", ackMessage);
    socket.on("message:error", markMessageFailed);

    return () => {
      socket.off("message:new", receiveMessage);
      socket.off("message:ack", ackMessage);
      socket.off("message:error", markMessageFailed);
    };
  }, []);

  return <>{children}</>;
}

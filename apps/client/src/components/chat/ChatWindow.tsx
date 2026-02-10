import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "@/store/chatStore";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useChatUtility } from "@/hooks/useChatUtiliy";

export function ChatWindow() {
  const { activeConversationId } = useChatStore();
  const { loadInitialMessages } = useChatUtility();
  const { conversationId } = useParams();

  useEffect(() => {
    if (!conversationId) return;

    loadInitialMessages(conversationId);
  }, [conversationId]);

  return (
    <div className="flex flex-1 flex-col bg-background h-full border rounded-xl">
      {activeConversationId ? (
        <>
          <ChatHeader />
          <ChatMessages />
          <ChatInput />
        </>
      ) : (
        <ChatMessages />
      )}
    </div>
  );
}

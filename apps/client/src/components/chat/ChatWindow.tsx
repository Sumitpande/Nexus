import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "@/store/chatStore";
import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useChatUtility } from "@/hooks/useChatUtility";

export function ChatWindow() {
  const { activeConversationId, conversations } = useChatStore();
  const { loadInitialMessages } = useChatUtility();
  const { conversationId } = useParams();

  useEffect(() => {
    if (!conversationId) return;

    loadInitialMessages(conversationId);
  }, [conversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const participantMap = useMemo(() => {
    const map: Record<string, string> = {};
    activeConversation?.participants.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [activeConversation?.participants]);

  return (
    <div className="flex flex-1 flex-col bg-background h-full border rounded-xl">
      {activeConversationId ? (
        <>
          <ChatHeader />
          <ChatMessages />
          <ChatInput members={participantMap} />
        </>
      ) : (
        <ChatMessages />
      )}
    </div>
  );
}

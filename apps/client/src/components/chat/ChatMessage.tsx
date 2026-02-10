import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/chatStore";
import { MessageBubble } from "./MessageBubble";
import { useChatUtility } from "@/hooks/useChatUtiliy";

export function ChatMessages() {
  const { activeConversationId, messagesByConversation, conversations } =
    useChatStore();
  const { loadOlderMessages } = useChatUtility();
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversationState = activeConversationId
    ? messagesByConversation[activeConversationId]
    : null;

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const isGroupChat = activeConversation?.type === "group";

  const handleScroll = () => {
    if (!scrollRef.current || !activeConversationId) return;
    if (scrollRef.current.scrollTop === 0) {
      loadOlderMessages(activeConversationId);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationState?.messages.length]);

  if (!activeConversationId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="h-12 w-12 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Welcome to Chat
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Select a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  // Determine if we should show sender info (different sender from previous message)
  const shouldShowSenderInfo = (index: number) => {
    if (index === 0) return true;
    const currentMessage = conversationState?.messages[index];
    const previousMessage = conversationState?.messages[index - 1];
    return (
      currentMessage?.senderId !== previousMessage?.senderId ||
      previousMessage?.type === "system"
    );
  };

  return (
    <ScrollArea
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 bg-linear-to-b from-muted/20 to-muted/40 h-[calc(100vh-155px)] overflow-auto"
    >
      <div className="py-4 space-y-1">
        {conversationState?.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isGroupChat={isGroupChat || false}
            showSenderInfo={shouldShowSenderInfo(index)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

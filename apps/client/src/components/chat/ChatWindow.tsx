import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "@/store/chatStore";

export function ChatWindow() {
  const { activeConversationId } = useChatStore();

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

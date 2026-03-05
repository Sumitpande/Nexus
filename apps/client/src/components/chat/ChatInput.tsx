import { useState, useRef, type KeyboardEvent } from "react";
import { Smile, Paperclip, Mic, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/chatStore";
import { EmojiPicker } from "./EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useChatUtility } from "@/hooks/useChatUtility";

export function ChatInput({ members }: { members: Record<string, string> }) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { activeConversationId, replyingTo, setReplyingTo } = useChatStore();
  const { sendMessage } = useChatUtility();

  if (!activeConversationId) return null;

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(activeConversationId, message.trim(), "text", replyingTo?.id);
      setMessage("");
      setReplyingTo(null);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-border bg-card p-4 rounded-b-xl">
      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-muted px-3 py-2">
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium">Replying to {members[replyingTo?.senderId]}</span>
            <span className="text-xs truncate text-muted-foreground">{replyingTo.content}</span>
          </div>

          <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        {/* Emoji picker */}
        <Popover open={showEmoji} onOpenChange={setShowEmoji}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0" side="top" align="start">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </PopoverContent>
        </Popover>

        {/* Attachment button */}
        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-11 max-h-32 resize-none bg-muted/50 border-0 focus-visible:ring-1 pr-4"
            rows={1}
          />
        </div>

        {/* Send or voice button */}
        {message.trim() ? (
          <Button onClick={handleSend} size="icon" className="h-10 w-10 shrink-0 rounded-full">
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
            <Mic className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}

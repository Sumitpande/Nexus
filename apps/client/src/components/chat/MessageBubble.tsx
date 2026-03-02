import { useMemo, useState } from "react";
import { Check, CheckCheck, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Message } from "@/store/chatStore";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthStore } from "@/store/auth.store";
import type { Conversation } from "../types";
import { formatMessageDate } from "@/utils";
import { useChatUtility } from "@/hooks/useChatUtility";

interface MessageBubbleProps {
  message: Message;
  isGroupChat: boolean;
  activeConversation: Conversation;
  showSenderInfo: boolean;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

// Color palette for group chat sender names
const SENDER_COLORS = [
  "text-rose-500",
  "text-blue-500",
  "text-green-500",
  "text-purple-500",
  "text-orange-500",
  "text-cyan-500",
  "text-pink-500",
  "text-indigo-500",
];

export function MessageBubble({ message, isGroupChat, activeConversation, showSenderInfo }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const [showReactions, setShowReactions] = useState(false);
  const { toggleReaction } = useChatUtility();
  const sender = activeConversation.participants.find((u) => u.id === message.senderId);
  const isOwnMessage = message.senderId === user?.id;
  const isSystemMessage = message.type === "system";

  const participantMap = useMemo(() => {
    const map: Record<string, string> = {};
    activeConversation.participants.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [activeConversation.participants]);

  // Get consistent color for sender
  const getSenderColor = (userId: string) => {
    const index = activeConversation.participants.findIndex((u) => u.id === userId);
    return SENDER_COLORS[index % SENDER_COLORS.length];
  };

  const handleReaction = (emoji: string) => {
    toggleReaction(activeConversation.id, message.id, emoji);
    setShowReactions(false);
  };

  const getReactionUsers = (emoji: string) => {
    return (message.reactions?.[emoji] ?? []).map((id) => participantMap[id] ?? "Unknown").join(", ");
  };

  const hasReacted = (emoji: string) => !!message.reactions?.[emoji]?.includes(user?.id ?? "");

  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-lg bg-muted/80 px-3 py-1 text-xs text-muted-foreground">{message.content}</span>
      </div>
    );
  }
  return (
    <div className={cn("group flex gap-2 px-4 py-1", isOwnMessage ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar for group chats */}
      {isGroupChat && !isOwnMessage && showSenderInfo && (
        <Avatar className="h-8 w-8 shrink-0 mt-5">
          <AvatarImage src={"A"} alt={sender?.name} />
          <AvatarFallback className="text-xs">{sender?.name?.[0]}</AvatarFallback>
        </Avatar>
      )}
      {isGroupChat && !isOwnMessage && !showSenderInfo && <div className="w-8 shrink-0" />}

      {/* Message content */}
      <div className={cn("max-w-[70%]", isOwnMessage ? "items-end" : "items-start")}>
        {/* Sender name for group chats */}
        {isGroupChat && !isOwnMessage && showSenderInfo && (
          <p className={cn("text-xs font-medium mb-1 ml-3", getSenderColor(message.senderId))}>{sender?.name}</p>
        )}

        <div className="relative">
          {/* Message bubble */}
          <div
            className={cn(
              "relative rounded-2xl px-4 py-2 shadow-sm",
              isOwnMessage
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md",
            )}
          >
            <p className="text-sm whitespace-pre-wrap wrap-break-words">{message.content}</p>

            {/* Timestamp and status */}
            <div className={cn("flex items-center gap-1 mt-1", isOwnMessage ? "justify-end" : "justify-start")}>
              <span
                className={cn("text-[10px]", isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground")}
              >
                {formatMessageDate(message.timestamp)}
              </span>
              {isOwnMessage && (
                <span className={cn(message.status === "read" ? "text-blue-400" : "text-primary-foreground/70")}>
                  {message.status === "sent" ? <Check className="h-3 w-3" /> : <CheckCheck className="h-3 w-3" />}
                </span>
              )}
            </div>
          </div>

          {/* Reaction button */}
          <Popover open={showReactions} onOpenChange={setShowReactions}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                  "h-7 w-7 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted",
                  isOwnMessage ? "-left-9" : "-right-9",
                )}
              >
                <Smile className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex gap-1">
                {REACTION_EMOJIS.map((emoji) => {
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className={cn(
                        "h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-lg transition-transform hover:scale-110",
                        hasReacted(emoji) && "bg-muted",
                      )}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reactions display */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className={cn("absolute -bottom-3 flex gap-1", isOwnMessage ? "right-2" : "left-2")}>
              {Object.entries(message.reactions).map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="flex items-center gap-0.5 rounded-full bg-card border border-border px-1.5 py-0.5 text-xs shadow-sm hover:bg-muted"
                  title={getReactionUsers(emoji)}
                >
                  <span>{emoji}</span>
                  {userIds.length > 1 && <span className="text-muted-foreground">{userIds.length}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

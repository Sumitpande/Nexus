import { Phone, Video, Search, MoreVertical, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/store/chatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatHeader() {
  const {
    conversations,

    activeConversationId,

    toggleProfilePanel,
    setActiveConversation,
  } = useChatStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  console.log(
    "Active conversation in header:",
    conversations,
    activeConversationId,
    activeConversation,
  );
  if (!activeConversation) return null;

  const isGroup = activeConversation.type === "group";

  // const getConversationName = () => {
  //   if (isGroup && activeConversation.groupInfo) {
  //     return activeConversation.groupInfo.name;
  //   }
  //   const otherParticipant = activeConversation.participants.find(
  //     (p) => p.userId !== currentUser.id,
  //   );
  //   const user = users.find((u) => u.id === otherParticipant?.userId);
  //   return user?.name || "Unknown";
  // };

  // const getConversationAvatar = () => {
  //   if (isGroup && activeConversation.groupInfo) {
  //     return activeConversation.groupInfo.avatar;
  //   }
  //   const otherParticipant = activeConversation.participants.find(
  //     (p) => p.userId !== currentUser.id,
  //   );
  //   const user = users.find((u) => u.id === otherParticipant?.userId);
  //   return user?.avatar || "";
  // };

  // const getStatusText = () => {
  //   if (isGroup) {
  //     const memberCount = activeConversation.participants.length;
  //     const onlineCount = activeConversation.participants.filter((p) => {
  //       const user = users.find((u) => u.id === p.userId);
  //       return user?.status === "online";
  //     }).length;
  //     return `${memberCount} members, ${onlineCount} online`;
  //   }
  //   const otherParticipant = activeConversation.participants.find(
  //     (p) => p.userId !== currentUser.id,
  //   );
  //   const user = users.find((u) => u.id === otherParticipant?.userId);
  //   if (user?.status === "online") return "online";
  //   if (user?.lastSeen) return `last seen ${user.lastSeen}`;
  //   return "offline";
  // };

  // const groupAvatars = isGroup
  //   ? activeConversation.participants
  //       .slice(0, 3)
  //       .map((p) => users.find((u) => u.id === p.userId))
  //       .filter(Boolean)
  //   : [];

  return (
    <div className="flex items-center justify-between border-b border-border rounded-t-xl bg-card px-4 py-3">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={() => setActiveConversation(null)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <button
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={toggleProfilePanel}
        >
          {/* {isGroup ? (
            <div className="relative h-10 w-10">
              {groupAvatars.slice(0, 2).map((user, index) => (
                <Avatar
                  key={user?.id || index}
                  className={`absolute h-7 w-7 border-2 border-card ${
                    index === 0 ? "left-0 top-0 z-10" : "bottom-0 right-0"
                  }`}
                >
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : ( */}
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={activeConversation.avatar as string}
              alt={activeConversation.title}
            />
            <AvatarFallback>
              {activeConversation.title[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* )} */}

          <div className="text-left">
            <h2 className="font-semibold text-foreground">
              {activeConversation.title}
            </h2>
            <p className="text-xs text-muted-foreground">online</p>
          </div>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Search className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={toggleProfilePanel}>
              {isGroup ? "Group info" : "Contact info"}
            </DropdownMenuItem>
            <DropdownMenuItem>Select messages</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Clear messages</DropdownMenuItem>
            <DropdownMenuSeparator />
            {isGroup ? (
              <DropdownMenuItem className="text-destructive">
                Exit group
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-destructive">
                Block
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

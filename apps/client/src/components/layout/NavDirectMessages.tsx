import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  //   useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/store/chatStore";
import { PlusCircle } from "lucide-react";
import { useStore } from "@/store/store";
import type { Conversation } from "../types";
import { useNavigate } from "react-router-dom";

export function NavDirectMessages({
  conversations,
  loading,
}: {
  conversations: Conversation[];
  loading: boolean;
}) {
  //   const { isMobile } = useSidebar();
  const { setIsSearchOpen } = useStore();
  const navigate = useNavigate();
  const { setActiveConversation, activeConversationId } = useChatStore();

  const onSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    navigate(`/home/${conversationId}`);
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        <SidebarMenuItem className="">
          <SidebarMenuButton
            onClick={() => setIsSearchOpen(true)}
            tooltip="New Conversation"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          >
            <PlusCircle />
            <span>New Conversation</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
      <SidebarMenu>
        {loading && <div className="p-2 text-sm">Loading...</div>}
        {conversations.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              size="lg"
              isActive={activeConversationId === item.id}
              onClick={() => onSelectConversation(item.id)}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={item.avatar as string} alt={item.title} />
                <AvatarFallback className="rounded-lg">
                  {item.title[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{item.title}</span>
                <span className="truncate text-xs">{item.lastMessage}</span>
              </div>
              <div className="ml-auto size-4 text-xs font-light">
                {item.lastMessageTime}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  title: string;
  avatar: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  participants: {
    id: string;
    name: string;
    email: string;
    role: "creator" | "admin" | "member";
  }[];
}

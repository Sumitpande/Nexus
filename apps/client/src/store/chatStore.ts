import type { Conversation } from "@/components/types";

import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
  phone?: string;
  about?: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "failed";
  reactions: Reaction[];
  replyTo?: string;
  type: "text" | "system";
}

export interface GroupInfo {
  name: string;
  avatar: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Participant {
  userId: string;
  role: "admin" | "member" | "creator";
  joinedAt: string;
}

// export interface Conversation {
//   id: string;
//   type: "direct" | "group";
//   participants: Participant[];
//   groupInfo?: GroupInfo;
//   lastMessage?: string;
//   lastMessageTime?: string;
//   unreadCount: number;
//   isPinned: boolean;
//   isMuted: boolean;
// }

type ConversationMessages = {
  messages: Message[];
  oldestCursor: string | null;
  hasMore: boolean;
};

interface ChatState {
  currentUser: User;
  users: User[];
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  profilePanelOpen: boolean;
  typingUsers: { conversationId: string; userId: string }[];
  messagesByConversation: Record<string, ConversationMessages>;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  toggleProfilePanel: () => void;
  // sendMessage: (conversationId: string, content: string) => void;
  // receiveMessage: (message: Message) => void;
  // ackMessage: (data: { clientMessageId: string; message: Message }) => void;
  // markMessageFailed: (data: { clientMessageId: string }) => void;
  // addReaction: (messageId: string, emoji: string) => void;
  // removeReaction: (messageId: string, emoji: string) => void;
  markAsRead: (conversationId: string) => void;
  // addMember: (conversationId: string, userId: string) => void;
  // removeMember: (conversationId: string, userId: string) => void;
  // makeAdmin: (conversationId: string, userId: string) => void;
  // removeAdmin: (conversationId: string, userId: string) => void;
  // leaveGroup: (conversationId: string) => void;
  // updateGroupInfo: (conversationId: string, info: Partial<GroupInfo>) => void;
  setInitialMessages: (conversationId: string, messages: Message[]) => void;
  prependMessages: (conversationId: string, messages: Message[]) => void;
  appendMessage: (message: Message) => void;
}

// Mock users
const mockUsers: User[] = [
  {
    id: "user-1",
    name: "You",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    status: "online",
    phone: "+1 234 567 8900",
    about: "Available",
  },
  {
    id: "user-2",
    name: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "online",
    phone: "+1 234 567 8901",
    about: "Hey there! I am using WhatsApp",
  },
  {
    id: "user-3",
    name: "Mike Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    status: "offline",
    lastSeen: "2 hours ago",
    phone: "+1 234 567 8902",
    about: "Busy",
  },
  {
    id: "user-4",
    name: "Emily Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    status: "online",
    phone: "+1 234 567 8903",
    about: "At work",
  },
  {
    id: "user-5",
    name: "Alex Turner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    status: "away",
    lastSeen: "30 minutes ago",
    phone: "+1 234 567 8904",
    about: "In a meeting",
  },
  {
    id: "user-6",
    name: "Jessica Lee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    status: "online",
    phone: "+1 234 567 8905",
    about: "Coffee lover ☕",
  },
  {
    id: "user-7",
    name: "David Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    status: "offline",
    lastSeen: "1 day ago",
    phone: "+1 234 567 8906",
    about: "Traveling 🌍",
  },
];

// Mock conversations
// const mockConversations: Conversation[] = [
//   {
//     id: "conv-1",
//     type: "direct",
//     participants: [
//       { userId: "user-1", role: "member", joinedAt: "" },
//       { userId: "user-2", role: "member", joinedAt: "" },
//     ],
//     lastMessage: "Sure, let me check that for you!",
//     lastMessageTime: "10:30 AM",
//     unreadCount: 2,
//     isPinned: true,
//     isMuted: false,
//   },
//   {
//     id: "conv-2",
//     type: "group",
//     participants: [
//       { userId: "user-1", role: "creator", joinedAt: "2024-01-01" },
//       { userId: "user-2", role: "admin", joinedAt: "2024-01-01" },
//       { userId: "user-3", role: "member", joinedAt: "2024-01-02" },
//       { userId: "user-4", role: "member", joinedAt: "2024-01-02" },
//       { userId: "user-5", role: "member", joinedAt: "2024-01-03" },
//     ],
//     groupInfo: {
//       name: "Project Team",
//       avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=ProjectTeam",
//       description: "Team collaboration for Q1 project deliverables",
//       createdBy: "user-1",
//       createdAt: "2024-01-01",
//     },
//     lastMessage: "Emily: The designs look great!",
//     lastMessageTime: "9:45 AM",
//     unreadCount: 5,
//     isPinned: true,
//     isMuted: false,
//   },
//   {
//     id: "conv-3",
//     type: "direct",
//     participants: [
//       { userId: "user-1", role: "member", joinedAt: "" },
//       { userId: "user-3", role: "member", joinedAt: "" },
//     ],
//     lastMessage: "Thanks for the update!",
//     lastMessageTime: "Yesterday",
//     unreadCount: 0,
//     isPinned: false,
//     isMuted: false,
//   },
//   {
//     id: "conv-4",
//     type: "group",
//     participants: [
//       { userId: "user-1", role: "member", joinedAt: "2024-02-01" },
//       { userId: "user-6", role: "creator", joinedAt: "2024-02-01" },
//       { userId: "user-7", role: "admin", joinedAt: "2024-02-01" },
//       { userId: "user-2", role: "member", joinedAt: "2024-02-02" },
//     ],
//     groupInfo: {
//       name: "Weekend Hangout",
//       avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Weekend",
//       description: "Planning weekend activities 🎉",
//       createdBy: "user-6",
//       createdAt: "2024-02-01",
//     },
//     lastMessage: "David: Who's in for Saturday?",
//     lastMessageTime: "Monday",
//     unreadCount: 0,
//     isPinned: false,
//     isMuted: true,
//   },
//   {
//     id: "conv-5",
//     type: "direct",
//     participants: [
//       { userId: "user-1", role: "member", joinedAt: "" },
//       { userId: "user-4", role: "member", joinedAt: "" },
//     ],
//     lastMessage: "See you tomorrow!",
//     lastMessageTime: "Tuesday",
//     unreadCount: 0,
//     isPinned: false,
//     isMuted: false,
//   },
// ];

// Mock messages
const mockMessages: Message[] = [
  // Direct conversation with Sarah
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-2",
    content: "Hey! How are you doing?",
    timestamp: "10:00 AM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "user-1",
    content: "I'm good! Just finished the morning meeting. How about you?",
    timestamp: "10:05 AM",
    status: "read",
    reactions: [{ emoji: "👍", userId: "user-2" }],
    type: "text",
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "user-2",
    content:
      "Great! I wanted to ask about the project timeline. Do you have a moment?",
    timestamp: "10:15 AM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-4",
    conversationId: "conv-1",
    senderId: "user-1",
    content: "Of course! What do you need to know?",
    timestamp: "10:20 AM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-5",
    conversationId: "conv-1",
    senderId: "user-2",
    content: "When is the deadline for the first milestone?",
    timestamp: "10:25 AM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-6",
    conversationId: "conv-1",
    senderId: "user-2",
    content: "Sure, let me check that for you!",
    timestamp: "10:30 AM",
    status: "delivered",
    reactions: [],
    type: "text",
  },

  // Group conversation - Project Team
  {
    id: "msg-7",
    conversationId: "conv-2",
    senderId: "user-1",
    content: "Good morning team! 👋",
    timestamp: "9:00 AM",
    status: "read",
    reactions: [
      { emoji: "👋", userId: "user-2" },
      { emoji: "👋", userId: "user-3" },
    ],
    type: "text",
  },
  {
    id: "msg-8",
    conversationId: "conv-2",
    senderId: "user-2",
    content: "Morning! Ready for today's standup?",
    timestamp: "9:05 AM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-9",
    conversationId: "conv-2",
    senderId: "user-3",
    content: "Yes! I've completed the backend API endpoints.",
    timestamp: "9:10 AM",
    status: "read",
    reactions: [
      { emoji: "🎉", userId: "user-1" },
      { emoji: "👏", userId: "user-4" },
    ],
    type: "text",
  },
  {
    id: "msg-10",
    conversationId: "conv-2",
    senderId: "user-1",
    content: "Awesome work Mike! Can you share the documentation?",
    timestamp: "9:15 AM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-11",
    conversationId: "conv-2",
    senderId: "user-3",
    content: "Will do! Sending it over now.",
    timestamp: "9:20 AM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-12",
    conversationId: "conv-2",
    senderId: "system",
    content: "Alex joined the group",
    timestamp: "9:30 AM",
    status: "read",
    reactions: [],
    type: "system",
  },
  {
    id: "msg-13",
    conversationId: "conv-2",
    senderId: "user-5",
    content: "Hey everyone! Excited to join the team!",
    timestamp: "9:35 AM",
    status: "read",
    reactions: [{ emoji: "❤️", userId: "user-2" }],
    type: "text",
  },
  {
    id: "msg-14",
    conversationId: "conv-2",
    senderId: "user-4",
    content: "The designs look great!",
    timestamp: "9:45 AM",
    status: "delivered",
    reactions: [],
    type: "text",
  },

  // Direct conversation with Mike
  {
    id: "msg-15",
    conversationId: "conv-3",
    senderId: "user-3",
    content: "Hey, quick question about the API",
    timestamp: "Yesterday 3:00 PM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-16",
    conversationId: "conv-3",
    senderId: "user-1",
    content: "Sure, what's up?",
    timestamp: "Yesterday 3:05 PM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-17",
    conversationId: "conv-3",
    senderId: "user-3",
    content: "I've pushed the changes to the repo",
    timestamp: "Yesterday 3:30 PM",
    status: "read",
    reactions: [],
    type: "text",
  },
  {
    id: "msg-18",
    conversationId: "conv-3",
    senderId: "user-1",
    content: "Thanks for the update!",
    timestamp: "Yesterday 3:35 PM",
    status: "read",
    reactions: [{ emoji: "👍", userId: "user-3" }],
    type: "text",
  },
];

export const useChatStore = create<ChatState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  conversations: [],
  messages: mockMessages,
  activeConversationId: null,
  profilePanelOpen: false,
  typingUsers: [],
  messagesByConversation: {},

  // Actions
  setInitialMessages: (conversationId, messages) => {
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: {
          messages,
          oldestCursor: messages[0]?.timestamp ?? null,
          hasMore: messages.length === 50, // Assuming page size of 50
        },
      },
    }));
  },

  prependMessages: (conversationId, messages) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId];

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: {
            messages: [...messages, ...existing.messages],
            oldestCursor: messages[0]?.timestamp ?? existing.oldestCursor,
            hasMore: messages.length === 50,
          },
        },
      };
    }),

  appendMessage: (message) =>
    set((state) => {
      const convo = state.messagesByConversation[message.conversationId];
      if (!convo) return state;

      // prevent duplicates
      if (convo.messages.find((m) => m.id === message.id)) return state;

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: {
            ...convo,
            messages: [...convo.messages, message],
          },
        },
      };
    }),

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => {
    set({ activeConversationId: id, profilePanelOpen: false });
    if (id) {
      get().markAsRead(id);
    }
  },

  toggleProfilePanel: () =>
    set((state) => ({ profilePanelOpen: !state.profilePanelOpen })),

  // sendMessage: (conversationId, content) => {
  //   const clientMessageId = crypto.randomUUID();
  //   const socket = getSocket();
  //   const newMessage: Message = {
  //     id: clientMessageId,
  //     conversationId,
  //     senderId: "user-1",
  //     content,
  //     timestamp: new Date().toISOString(),
  //     status: "sent",
  //     reactions: [],
  //     type: "text",
  //   };

  //   set((state) => ({
  //     messages: [...state.messages, newMessage],
  //     // conversations: state.conversations.map((conv) =>
  //     //   conv.id === conversationId
  //     //     ? { ...conv, lastMessage: content, lastMessageTime: "Just now" }
  //     //     : conv,
  //     // ),
  //   }));

  //   socket.emit("message:send", {
  //     conversationId,
  //     content,
  //     clientMessageId,
  //   });

  //   // Simulate message delivery
  //   // setTimeout(() => {
  //   //   set((state) => ({
  //   //     messages: state.messages.map((msg) =>
  //   //       msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
  //   //     ),
  //   //   }));
  //   // }, 1000);
  // },

  // receiveMessage: (message) => {
  //   set((state) => ({
  //     messages: [...state.messages, message],
  //   }));
  // },

  // ackMessage: ({ clientMessageId, message }) => {
  //   set((state) => ({
  //     messages: state.messages.map((m) =>
  //       m.id === clientMessageId ? message : m,
  //     ),
  //   }));
  // },

  // markMessageFailed: ({ clientMessageId }) => {
  //   set((state) => ({
  //     messages: state.messages.map((m) =>
  //       m.id === clientMessageId ? { ...m, status: "failed" } : m,
  //     ),
  //   }));
  // },

  // addReaction: (messageId, emoji) => {
  //   set((state) => ({
  //     messages: state.messages.map((msg) =>
  //       msg.id === messageId
  //         ? {
  //             ...msg,
  //             reactions: [...msg.reactions, { emoji, userId: "user-1" }],
  //           }
  //         : msg,
  //     ),
  //   }));
  // },

  // removeReaction: (messageId, emoji) => {
  //   set((state) => ({
  //     messages: state.messages.map((msg) =>
  //       msg.id === messageId
  //         ? {
  //             ...msg,
  //             reactions: msg.reactions.filter(
  //               (r) => !(r.emoji === emoji && r.userId === "user-1"),
  //             ),
  //           }
  //         : msg,
  //     ),
  //   }));
  // },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
      ),
      messages: state.messages.map((msg) =>
        msg.conversationId === conversationId
          ? { ...msg, status: "read" }
          : msg,
      ),
    }));
  },

  // addMember: (conversationId, userId) => {
  //   console.log("Adding member:", userId, "to conversation:", conversationId);
  //   // const newParticipant: Participant = {
  //   //   userId,
  //   //   role: "member",
  //   //   joinedAt: new Date().toISOString(),
  //   // };
  //   // const user = get().users.find((u) => u.id === userId);
  //   // const systemMessage: Message = {
  //   //   id: `msg-${Date.now()}`,
  //   //   conversationId,
  //   //   senderId: "system",
  //   //   content: `${user?.name} joined the group`,
  //   //   timestamp: new Date().toLocaleTimeString([], {
  //   //     hour: "2-digit",
  //   //     minute: "2-digit",
  //   //   }),
  //   //   status: "read",
  //   //   reactions: [],
  //   //   type: "system",
  //   // };
  //   // set((state) => ({
  //   //   conversations: state.conversations.map((conv) =>
  //   //     conv.id === conversationId
  //   //       ? { ...conv, participants: [...conv.participants, newParticipant] }
  //   //       : conv,
  //   //   ),
  //   //   messages: [...state.messages, systemMessage],
  //   // }));
  // },

  // removeMember: (conversationId, userId) => {
  //   const user = get().users.find((u) => u.id === userId);
  //   const systemMessage: Message = {
  //     id: `msg-${Date.now()}`,
  //     conversationId,
  //     senderId: "system",
  //     content: `${user?.name} was removed from the group`,
  //     timestamp: new Date().toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     }),
  //     status: "read",
  //     reactions: [],
  //     type: "system",
  //   };

  //   set((state) => ({
  //     conversations: state.conversations.map((conv) =>
  //       conv.id === conversationId
  //         ? {
  //             ...conv,
  //             participants: conv.participants.filter(
  //               (p) => p.userId !== userId,
  //             ),
  //           }
  //         : conv,
  //     ),
  //     messages: [...state.messages, systemMessage],
  //   }));
  // },

  // makeAdmin: (conversationId, userId) => {
  //   set((state) => ({
  //     conversations: state.conversations.map((conv) =>
  //       conv.id === conversationId
  //         ? {
  //             ...conv,
  //             participants: conv.participants.map((p) =>
  //               p.userId === userId ? { ...p, role: "admin" } : p,
  //             ),
  //           }
  //         : conv,
  //     ),
  //   }));
  // },

  // removeAdmin: (conversationId, userId) => {
  //   set((state) => ({
  //     conversations: state.conversations.map((conv) =>
  //       conv.id === conversationId
  //         ? {
  //             ...conv,
  //             participants: conv.participants.map((p) =>
  //               p.userId === userId ? { ...p, role: "member" } : p,
  //             ),
  //           }
  //         : conv,
  //     ),
  //   }));
  // },

  // leaveGroup: (conversationId) => {
  //   const systemMessage: Message = {
  //     id: `msg-${Date.now()}`,
  //     conversationId,
  //     senderId: "system",
  //     content: "You left the group",
  //     timestamp: new Date().toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     }),
  //     status: "read",
  //     reactions: [],
  //     type: "system",
  //   };

  //   set((state) => ({
  //     conversations: state.conversations.map((conv) =>
  //       conv.id === conversationId
  //         ? {
  //             ...conv,
  //             participants: conv.participants.filter(
  //               (p) => p.userId !== "user-1",
  //             ),
  //           }
  //         : conv,
  //     ),
  //     messages: [...state.messages, systemMessage],
  //     activeConversationId: null,
  //   }));
  // },

  // updateGroupInfo: (conversationId, info) => {
  //   set((state) => ({
  //     conversations: state.conversations.map((conv) =>
  //       conv.id === conversationId && conv.groupInfo
  //         ? { ...conv, groupInfo: { ...conv.groupInfo, ...info } }
  //         : conv,
  //     ),
  //   }));
  // },
}));

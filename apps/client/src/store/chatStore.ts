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
  currentUser: User | null;
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


export const useChatStore = create<ChatState>((set, get) => ({
  currentUser: null,
  users: [],
  conversations: [],
  messages: [],
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

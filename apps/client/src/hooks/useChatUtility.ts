import { addReactionApi, getMessagesApi, removeReactionApi, sendMessageApi } from "@/api/chat.api";
import { getSocket } from "@/socket/socket";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore, type Message } from "@/store/chatStore";


export const useChatUtility = () => {
  const {
    setInitialMessages,
    messagesByConversation,
    prependMessages,
    appendMessage,
    removeReaction,
    addReaction,
    applyReactionFromSocket
  } = useChatStore();
  const { user } = useAuthStore();
  const joinConversation = (cid: string) => {
    const socket = getSocket();

    if (!socket.connected) return;

    socket.emit("conversation:join", cid);
  };

  async function loadInitialMessages(conversationId: string) {
    try {
      const msgs = await getMessagesApi(conversationId, null, "30");
      setInitialMessages(conversationId, msgs);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }

  async function loadOlderMessages(conversationId: string) {
    try {
      const convo = messagesByConversation[conversationId];

      if (!convo.hasMore) return;

      const msgs = await getMessagesApi(conversationId, convo.oldestCursor);

      prependMessages(conversationId, msgs);
    } catch (error) {
      console.error("Failed to load older messages:", error);
    }
  }

  const sendMessage = (
    cid: string,
    message: string,
    type: string,
    replyTo?: string,
  ) => {
    // const socket = getSocket();

    // if (!socket.connected) return;
    try {
      sendMessageApi(cid, message, type, replyTo);
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    // socket.emit("message:send", { cid, message });
  };

  const toggleReaction = async (conversationId: string, messageId: string, emoji: string) => {
    const messages = messagesByConversation[conversationId]?.messages
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const hasReacted =
      message.reactions?.[emoji]?.includes(user?.id as string);

    // Optimistic UI update
    if (hasReacted) {
      removeReaction(conversationId, messageId, emoji, user?.id as string)
    }
    else {
      addReaction(conversationId, messageId, emoji, user?.id as string)
    }

    // Call API
    try {
      if (hasReacted) {
        await removeReactionApi(messageId, emoji);
      } else {
        await addReactionApi(messageId, emoji);
      }
    } catch (err) {
      console.error("Reaction failed", err);
      // refetch or revert state
    }
  }
  const onSocketReactionUpdate = (payload: {
    conversationId: string;
    messageId: string;
    emoji: string;
    userId: string;
    action: "add" | "remove";
  }) => {

    const {
      conversationId,
      messageId,
      emoji,
      userId,
      action
    } = payload;

    const conversation = useChatStore.getState().messagesByConversation[conversationId];
    if (!conversation) return;

    const message = conversation.messages.find(
      (m) => m.id === messageId
    );
    if (!message) return;

    // Process first
    const updatedReactions = processReactionUpdate(
      message.reactions,
      emoji,
      userId,
      action
    );

    // Then update store
    applyReactionFromSocket(
      conversationId,
      messageId,
      updatedReactions
    );
  }

  const processReactionUpdate = (reactions: Record<string, string[]>,
    emoji: string,
    userId: string,
    action: string) => {
    const current = reactions ?? {};
    const users = current[emoji] ?? [];
    const already = users.includes(userId);

    if (action === "add" && !already) {
      return {
        ...current,
        [emoji]: [...users, userId],
      };
    }

    if (action === "remove" && already) {
      const updated = users.filter((id) => id !== userId);

      if (updated.length === 0) {
        const copy = { ...current };
        delete copy[emoji];
        return copy;
      }

      return {
        ...current,
        [emoji]: updated,
      };
    }
    return current;
  }

  const onSocketReceiveMessage = (dto: Message) => {
    console.log("New message received via socket:", dto);
    appendMessage(dto);
  };
  const onSocketAckMessage = () => { };
  const onSocketMessageFailed = () => { };

  return {
    joinConversation,
    sendMessage,
    onSocketReceiveMessage,
    onSocketAckMessage,
    onSocketMessageFailed,
    loadInitialMessages,
    loadOlderMessages,
    onSocketReactionUpdate,
    toggleReaction,
    processReactionUpdate
  };
};

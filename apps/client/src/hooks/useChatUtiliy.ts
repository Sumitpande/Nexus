import { getMessagesApi, sendMessageApi } from "@/api/chat.api";
import { getSocket } from "@/socket/socket";
import { useChatStore, type Message } from "@/store/chatStore";

export const useChatUtility = () => {
  const {
    setInitialMessages,
    messagesByConversation,
    prependMessages,
    appendMessage,
  } = useChatStore();
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
  const onSocketRecieveMessage = (dto: Message) => {
    console.log("New message received via socket:", dto);
    appendMessage(dto);
  };
  const onSocketAckMessage = () => {};
  const onSocketMessageFailed = () => {};

  return {
    joinConversation,
    sendMessage,
    onSocketRecieveMessage,
    onSocketAckMessage,
    onSocketMessageFailed,
    loadInitialMessages,
    loadOlderMessages,
  };
};

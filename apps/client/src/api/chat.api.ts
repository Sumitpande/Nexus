import { api } from "@/api/axios";

export const createConversation = async (selectedUsers: string[]) => {
  if (selectedUsers.length === 0) return;

  const res = await api.post("/chat/conversation", {
    userIds: selectedUsers,
  });

  return res.data;
};

export const getConversationList = async () => {
  const res = await api.get("/chat/conversations");
  return res.data;
};

export const sendMessageApi = async (
  cid: string,
  message: string,
  type: string,
  replyTo?: string,
) => {
  const res = await api.post("/chat/message", {
    conversationId: cid,
    content: message,
    type: type,
    replyTo: replyTo,
  });
  return res.data;
};

export const getMessagesApi = async (
  cid: string,
  cursor?: string | null,
  limit?: string | null,
) => {
  let query = "";
  if (cursor && limit) {
    query = `?cursor=${cursor}&limit=${limit}`;
  } else if (cursor) {
    query = `?cursor=${cursor}`;
  } else {
    query = `?limit=${limit}`;
  }
  const res = await api.get(`/chat/conversations/${cid}/messages${query}`);
  return res.data;
};

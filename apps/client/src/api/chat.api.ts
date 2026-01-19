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

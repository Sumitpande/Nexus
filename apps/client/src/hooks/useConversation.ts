import { getConversationList } from "@/api/chat.api";
import type { Conversation } from "@/components/types";
import { useChatStore } from "@/store/chatStore";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const useConversation = () => {
  const { setConversations, conversations, setActiveConversation } =
    useChatStore();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const getConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data: Conversation[] = await getConversationList();
      setConversations(data);

      if (
        params.conversationId &&
        data.map((c) => c.id).includes(params.conversationId)
      ) {
        setActiveConversation(params.conversationId);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    getConversations();
    return;
  }, [getConversations]);
  return { conversations, loading, refreshConversations: getConversations };
};

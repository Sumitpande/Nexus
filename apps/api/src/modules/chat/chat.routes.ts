import { Router } from "express";
import {
  addReactionHandler,
  createConversationHandler,
  getConversationListHandler,
  getMessagesHandler,
  removeReactionHandler,
  sendMessageHandler,
} from "./chat.controller";
import { requireAuth } from "../auth/auth.middleware";

const chatRouter = Router();

chatRouter.post("/message", requireAuth, sendMessageHandler);
chatRouter.post("/reaction", requireAuth, addReactionHandler);
chatRouter.delete("/reaction", requireAuth, removeReactionHandler);

chatRouter.post("/conversation", requireAuth, createConversationHandler);
chatRouter.get("/conversations", requireAuth, getConversationListHandler);
chatRouter.get(
  "/conversations/:conversationId/messages",
  requireAuth,
  getMessagesHandler,
);

export default chatRouter;

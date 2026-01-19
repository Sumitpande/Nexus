import { Router } from "express";
import {
  createConversationHandler,
  getConversationListHandler,
} from "./chat.http";
import { requireAuth } from "../auth/auth.middleware";

const chatRouter = Router();

chatRouter.post("/conversation", requireAuth, createConversationHandler);
chatRouter.get("/conversations", requireAuth, getConversationListHandler);

export default chatRouter;

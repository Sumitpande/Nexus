import { Router } from "express";

import chatRouter from "./chat/chat.routes";

const appRouter = Router();

appRouter.use("/chat", chatRouter);
export { appRouter };

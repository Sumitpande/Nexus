import { Router } from "express";

import userRouter from "./user/user.routes";
import chatRouter from "./chat/chat.routes";

const appRouter = Router();


appRouter.use("/users", userRouter);
appRouter.use("/chat", chatRouter);
export { appRouter };

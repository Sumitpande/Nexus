import { Router } from "express";

import authRoutes from "./auth/auth.routes";

import userRouter from "./user/user.routes";
import chatRouter from "./chat/chat.routes";

const appRouter = Router();

appRouter.use("/auth", authRoutes);
appRouter.use("/users", userRouter);
appRouter.use("/chat", chatRouter);
export { appRouter };

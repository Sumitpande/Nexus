import { Router } from "express";
import { searchUsers } from "./user.controller";
import { requireAuth } from "../auth/auth.middleware";

const userRouter = Router();

userRouter.get("/search", requireAuth, searchUsers);

export default userRouter;

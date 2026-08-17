import { Router } from "express";
import { searchUsers } from "../Controller/user.controller";
import { requireAuth } from "@nexus/auth-client";

const userRouter = Router();

userRouter.get("/search", requireAuth, searchUsers);

export default userRouter;

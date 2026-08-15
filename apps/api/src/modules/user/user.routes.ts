import { Router } from "express";
import { searchUsers } from "./user.controller";
import { requireAuth } from "../../common/middleware";

const userRouter = Router();

userRouter.get("/search", requireAuth, searchUsers);

export default userRouter;

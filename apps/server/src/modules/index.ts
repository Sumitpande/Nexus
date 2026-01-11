import { Router } from "express";

import authRoutes from "./auth/auth.routes";

const appRouter = Router();

appRouter.use("/auth", authRoutes);

export { appRouter };

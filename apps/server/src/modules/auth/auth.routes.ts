import { Router } from "express";
import { authLimiter } from "../../common/middleware";
import { login, logout, refresh, revokeAll, signup } from "./auth.controller";
import { requireAuth } from "./auth.middleware";

const router = Router();

router.post("/login", authLimiter, login);

router.post("/signup", signup);

// refresh will read HttpOnly cookie; withCredentials required from client
router.post("/refresh", refresh);

router.post("/logout", logout);

// revoke all sessions for current user (protected)
router.post("/revoke", requireAuth, revokeAll);

export default router;

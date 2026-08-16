import { Request, Response, NextFunction } from "express";
import { authServiceClient } from "../auth.client";

/**
 * Express middleware: verifies the Bearer token by calling auth-service over
 * HTTP. Attaches `req.userId` and `req.user` on success.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = auth.split(" ")[1];
    const userData = await authServiceClient.verifyToken(token);

    (req as any).userId = userData.userId;
    (req as any).user = userData;

    next();
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
    console.error("[auth-client] requireAuth error:", err.message);
    res.status(503).json({ message: "Authentication service unavailable" });
  }
}

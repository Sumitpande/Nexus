import { Request, Response, NextFunction } from "express";
import { authServiceClient } from "../../services/auth.client";

/**
 * Authentication middleware that verifies tokens via auth-service HTTP call
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = auth.split(" ")[1];

    // Call auth-service to verify token
    const userData = await authServiceClient.verifyToken(token);

    // Attach user data to request
    (req as any).userId = userData.userId;
    (req as any).user = userData;

    next();
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    console.error("Auth middleware error:", err);
    return res.status(503).json({ message: "Authentication service unavailable" });
  }
}

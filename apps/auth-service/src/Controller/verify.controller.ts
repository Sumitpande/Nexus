import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth.tokens";
import { UnauthorizedError } from "@nexus/errors";
import { getUserById } from "../repository/auth.repository";

/**
 * Verify JWT token endpoint for inter-service communication
 * Called by API service to validate tokens
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = verifyAccessToken(token) as any;

      // Optionally verify user still exists and is not disabled
      const user = await getUserById(payload.userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      if (user.is_disabled) {
        throw new UnauthorizedError("Account disabled");
      }

      // Return user info for the requesting service
      return res.json({
        valid: true,
        userId: payload.userId,
        email: user.email,
        name: user.name,
      });
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  } catch (err) {
    next(err);
  }
}

import { authServiceClient } from "../services/auth.client";

export function socketAuthMiddleware(socket: any, next: any) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  // Call auth-service to verify token
  authServiceClient
    .verifyToken(token)
    .then((userData) => {
      // Attach user info to socket
      socket.data.user = {
        userId: userData.userId,
        email: userData.email,
        name: userData.name,
      };
      next();
    })
    .catch((err) => {
      next(new Error("Invalid or expired token"));
    });
}

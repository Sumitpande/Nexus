import { authServiceClient } from "../auth.client";

/**
 * Socket.IO middleware: verifies the token from the handshake auth object by
 * calling auth-service over HTTP. Attaches `socket.data.user` on success.
 */
export function verifySocketToken(
  socket: any,
  next: (err?: Error) => void,
): void {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error: no token"));
  }

  authServiceClient
    .verifyToken(token)
    .then((userData) => {
      socket.data.user = {
        userId: userData.userId,
        email: userData.email,
        name: userData.name,
      };
      next();
    })
    .catch(() => {
      next(new Error("Invalid or expired token"));
    });
}

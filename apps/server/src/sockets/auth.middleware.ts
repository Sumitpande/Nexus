import jwt from "jsonwebtoken";

export function socketAuthMiddleware(socket: any, next: any) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;

    // Attach user info to socket
    socket.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
}

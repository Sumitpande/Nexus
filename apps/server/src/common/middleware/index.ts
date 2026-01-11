import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many auth requests.",
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many messages.",
});

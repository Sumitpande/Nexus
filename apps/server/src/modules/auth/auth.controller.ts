import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, setLastLogin } from "./auth.service";
import pool from "../../db/postgres";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyRefreshToken,
} from "./auth.tokens";
import {
  addRefreshToken,
  revokeAllRefreshTokens,
  storeRefreshToken,
  verifyAndRemoveRefreshToken,
} from "./refreshStore";

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function signup(req: Request, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      message: "Name, email and password required.",
    });
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  try {
    const hash = await hashPassword(password);

    const user = await createUser(email.toLowerCase(), name, hash);

    const payload = { userId: user.id };
    const accessToken = generateAccessToken(payload);
    const { token: refreshToken, jti } = generateRefreshToken(payload);
    // store refresh in redis
    await storeRefreshToken(user.id, jti, refreshToken, REFRESH_TTL_SECONDS);
    // set httpOnly cookie for refresh
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });

    // set last login
    await setLastLogin(user.id);

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
    });
  } catch (err: any) {
    // handle unique violation
    if (err?.code === "23505") {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error("Signup error", err);
    return res.status(500).json({ message: "Internal error" });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Both email and password required.",
    });
  }

  try {
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.is_disabled)
      return res.status(403).json({ message: "Account disabled" });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const payload = { userId: user.id };
    const access = generateAccessToken(payload);
    const { token: refreshToken, jti } = generateRefreshToken(payload);

    await storeRefreshToken(user.id, jti, refreshToken, REFRESH_TTL_SECONDS);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });

    await setLastLogin(user.id);

    return res.json({
      accessToken: access,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ message: "Internal error" });
  }
}

export async function refresh(req: Request, res: Response) {
  const cookie = req.cookies?.refreshToken;
  if (!cookie) return res.status(401).json({ message: "No refresh token" });

  let payload: any;
  try {
    payload = verifyRefreshToken(cookie) as any;
  } catch (err) {
    // invalid/expired signature
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const userId = payload.userId;
  const oldJti = payload.jti;
  if (!userId || !oldJti)
    return res.status(401).json({ message: "Malformed token" });

  try {
    // verify that this jti exists and matches token (atomic recommended)
    const ok = await verifyAndRemoveRefreshToken(userId, oldJti, cookie);
    if (!ok) {
      // token signature valid but not in store -> possible replay (reuse)
      await revokeAllRefreshTokens(userId);
      return res
        .status(401)
        .json({ message: "Refresh token reuse detected. Please re-login." });
    }

    // Rotation: issue new refresh token
    const { token: newRefresh, jti: newJti } = generateAccessToken({ userId });

    // add new token
    await addRefreshToken(userId, newJti, newRefresh, REFRESH_TTL_SECONDS);

    // sign new access token
    const newAccess = generateAccessToken({ userId });

    // set cookie with new refresh token
    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });

    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error("Refresh error", err);
    // If Redis is down, fail closed: 401 (or 503 depending on policy)
    return res.status(401).json({ message: "Unable to refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  const cookie = req.cookies?.refreshToken;
  if (!cookie) {
    // still clear client cookie
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    return res.sendStatus(204);
  }

  try {
    const payload = verifyRefreshToken(cookie) as any;
    const userId = payload.userId;
    const jti = payload.jti;
    if (userId && jti) {
      // remove the specific token
      await verifyAndRemoveRefreshToken(userId, jti, cookie); // we don't care about return
    }
  } catch (err) {
    // ignore invalid token
  }

  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  return res.sendStatus(204);
}

export async function revokeAll(req: Request, res: Response) {
  // For admin / user endpoint: revoke all sessions
  const userId = (req as any).user?.userId;
  if (!userId) return res.sendStatus(401);

  try {
    await revokeAllRefreshTokens(userId);
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Revoke all error", err);
    return res.status(500).json({ message: "Unable to revoke sessions" });
  }
}

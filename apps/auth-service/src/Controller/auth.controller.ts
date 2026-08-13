import { NextFunction, Request, Response } from "express";

import {
  handleLogin,
  handleSignup,
} from "../service/auth.service";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../auth.tokens";
import {
  addRefreshToken,
  revokeAllRefreshTokens,
  verifyAndRemoveRefreshToken,
} from "../refreshStore";
import { BadRequestError, UnauthorizedError } from "@nexus/errors";
import { getUserById } from "../repository/auth.repository";

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const IsProd = process.env.NODE_ENV === "production";

export async function signup(req: Request, res: Response, next: NextFunction) {

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) throw new BadRequestError("Name, email and password required.");
    if (typeof email !== "string" || typeof password !== "string") throw new BadRequestError("Invalid email or password")

    const { accessToken, user, refreshToken } = await handleSignup(email, password, name);

    // set httpOnly cookie for refresh
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });
    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
    });
  } catch (err: any) {
    // handle unique violation
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {


  try {
    const { email, password } = req.body;
    if (!email || !password) throw new BadRequestError("Both email and password required.")
    const { user, access, refreshToken } = await handleLogin(email, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });


    return res.json({
      accessToken: access,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    next(error)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const cookie = req.cookies?.refreshToken;
    if (!cookie) throw new UnauthorizedError("No refresh token");

    let payload: any;
    try {
      payload = verifyRefreshToken(cookie) as any;
    } catch (err) {
      // invalid/expired signature
      throw new UnauthorizedError("Invalid refresh token")
    }

    const userId = payload.userId;
    const oldJti = payload.jti;
    if (!userId || !oldJti) throw new UnauthorizedError("Malformed token");

    // verify that this jti exists and matches token (atomic recommended)
    const ok = await verifyAndRemoveRefreshToken(userId, oldJti, cookie);
    if (!ok) {
      // token signature valid but not in store -> possible replay (reuse)
      await revokeAllRefreshTokens(userId);
      throw new UnauthorizedError("Refresh token reuse detected. Please re-login.")
    }

    // Rotation: issue new refresh token
    const { token: newRefresh, jti: newJti } = generateRefreshToken({ userId });

    // add new token
    await addRefreshToken(userId, newJti, newRefresh, REFRESH_TTL_SECONDS);

    // sign new access token
    const newAccess = generateAccessToken({ userId });

    // set cookie with new refresh token
    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: IsProd,
      sameSite: IsProd ? "strict" : "lax",
      path: "/api/auth/refresh",
      maxAge: REFRESH_TTL_SECONDS * 1000,
    });

    // MUST return user
    const user = await getUserById(userId);

    return res.json({
      accessToken: newAccess,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Refresh error", err);
    // If Redis is down, fail closed: 401 (or 503 depending on policy)
    next(err)
  }
}

export async function logout(req: Request, res: Response) {

  try {
    const cookie = req.cookies?.refreshToken;
    if (!cookie) {
      // still clear client cookie
      res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
      return res.sendStatus(204);
    }

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

export async function revokeAll(req: Request, res: Response, next: NextFunction) {
  // For admin / user endpoint: revoke all sessions


  try {
    const userId = (req as any).user?.userId;
    if (!userId) throw new UnauthorizedError("No user");
    await revokeAllRefreshTokens(userId);
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Revoke all error", err);
    next(err)
  }
}

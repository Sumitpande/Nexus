// import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || "15m";
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";
const jwt = require("jsonwebtoken");

const { v4: uuidv4 } = require("uuid");

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRATION });
}

export function generateRefreshToken(payload: any) {
  const jti = uuidv4();
  const token = jwt.sign({ userId: payload.userId, jti }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRATION,
  });
  return { token, jti };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

import { createUser, findUserByEmail, setLastLogin } from "./auth.repository";
import { comparePassword, generateAccessToken, generateRefreshToken, hashPassword } from "./auth.tokens";
import { storeRefreshToken } from "./refreshStore";
import { ConflictError, UnauthorizedError } from "@nexus/errors";
import { ForbiddenError } from "@nexus/errors";


const { v4: uuid } = require("uuid");
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const handleSignup = async (email: string, password: string, name: string,) => {
  const userId = uuid();
  const hash = await hashPassword(password);
  const u = await findUserByEmail(email.toLowerCase());
  if (u) throw new ConflictError("Email already registered.")
  const user = await createUser(userId, email.toLowerCase(), name, hash);

  const payload = { userId: user.id };
  const accessToken = generateAccessToken(payload);
  const { token: refreshToken, jti } = generateRefreshToken(payload);
  // store refresh in redis
  await storeRefreshToken(user.id, jti, refreshToken, REFRESH_TTL_SECONDS);


  // set last login
  await setLastLogin(user.id);
  return {
    user,
    accessToken,
    refreshToken
  }
}


export const handleLogin = async (email: string, password: string) => {
  const user = await findUserByEmail(email.toLowerCase());
  if (!user) throw new UnauthorizedError('Invalid credentials');

  if (user.is_disabled) throw new ForbiddenError("Account disabled");

  const ok = await comparePassword(password, user.password);
  if (!ok) throw new UnauthorizedError('Invalid credentials');
  const payload = { userId: user.id };
  const access = generateAccessToken(payload);
  const { token: refreshToken, jti } = generateRefreshToken(payload);

  await storeRefreshToken(user.id, jti, refreshToken, REFRESH_TTL_SECONDS);

  await setLastLogin(user.id);
  return {
    user,
    access,
    refreshToken
  }
}
import { connectRedis } from "../../db/redis";

// Key per user: hash of jti => token
function keyForUser(userId: string) {
  return `auth:refresh:${userId}`;
}

/**
 * Store a refresh token for user under jti.
 * TTL applied to the hash key (we refresh TTL on each rotation).
 */
export async function storeRefreshToken(
  userId: string,
  jti: string,
  token: string,
  ttlSec: number
) {
  const redis = await connectRedis();
  const k = keyForUser(userId);
  const txn = redis.multi();
  txn.hset(k, jti, token);
  txn.expire(k, ttlSec);
  await txn.exec();
}

/**
 * Check & remove a given jti (used during rotation).
 * Returns true if token exists and matches.
 */
export async function verifyAndRemoveRefreshToken(
  userId: string,
  jti: string,
  token: string
) {
  const redis = await connectRedis();
  const k = keyForUser(userId);
  // Get actual token
  const stored = await redis.hget(k, jti);
  if (!stored) return false;
  if (stored !== token) return false;
  // Remove the jti (rotation will add new jti)
  await redis.hdel(k, jti);
  return true;
}

/**
 * Add new jti/token as rotated token (after removal).
 */
export async function addRefreshToken(
  userId: string,
  jti: string,
  token: string,
  ttlSec: number
) {
  const redis = await connectRedis();
  const k = keyForUser(userId);
  const txn = redis.multi();
  txn.hset(k, jti, token);
  txn.expire(k, ttlSec);
  await txn.exec();
}

/**
 * Detect reuse: token is valid (signature ok) but not found in our store.
 * In that case, treat as compromise: delete all refresh tokens for user.
 */
export async function revokeAllRefreshTokens(userId: string) {
  const redis = await connectRedis();
  await redis.del(keyForUser(userId));
}

/**
 * Validate token existence (without deleting) — used optionally.
 */
export async function hasRefreshToken(
  userId: string,
  jti: string,
  token: string
) {
  const redis = await connectRedis();
  const k = keyForUser(userId);
  const stored = await redis.hget(k, jti);
  return stored === token;
}

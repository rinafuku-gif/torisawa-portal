// Session token utilities (Edge Runtime compatible)

import { cookies } from "next/headers";

const COOKIE_NAME = "torisawa-session";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const encoder = new TextEncoder();

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(userId: string): Promise<string> {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) throw new Error("PORTAL_SESSION_SECRET is not set");
  const timestamp = Date.now().toString();
  const data = `${userId}.${timestamp}`;
  const sig = await hmacSign(data, secret);
  return `${data}.${sig}`;
}

export async function verifySessionToken(
  token: string
): Promise<string | null> {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, timestamp, sig] = parts;
  const ts = parseInt(timestamp);
  if (isNaN(ts) || Date.now() - ts > TOKEN_MAX_AGE) return null;

  const data = `${userId}.${timestamp}`;
  const expected = await hmacSign(data, secret);

  // タイミング攻撃対策: 文字列の長さが異なる場合もバイト比較で防ぐ
  const sigBytes = encoder.encode(sig);
  const expectedBytes = encoder.encode(expected);
  if (sigBytes.length !== expectedBytes.length) return null;
  const equal = crypto.subtle
    ? (() => {
        // Web Crypto API では timingSafeEqual がないため手動でバイト比較
        let diff = 0;
        for (let i = 0; i < sigBytes.length; i++) {
          diff |= sigBytes[i] ^ expectedBytes[i];
        }
        return diff === 0;
      })()
    : false;
  return equal ? userId : null;
}

export function getSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

/**
 * Server Componentおよびroute handlerから呼ぶ。
 * 有効なセッションがあればuserIdを返し、なければnullを返す。
 */
export async function getSessionMember(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export { COOKIE_NAME };

// Durable V1: Authentication
// Single-origin, same-worker auth. Direct cookie issuance on OTP verification.
//
// Pure functions live in lib/auth-utils.ts for testability.
// This module contains only Cloudflare-dependent functions.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  OTP_TTL_SECONDS,
  SESSION_TTL_SECONDS,
  MAX_OTP_ATTEMPTS,
  sha256,
  randomToken,
  generateOtp,
  parseSessionTokenFromCookie,
  buildSetSessionCookie,
  buildClearSessionCookie,
} from "./auth-utils";

// --- Constants ---

export const SESSION_COOKIE_NAME = "admin_session";

// --- Helpers ---

function getEnv() {
  const { env } = getCloudflareContext();
  return env as CloudflareEnv;
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 * Both strings are compared byte-by-byte; the result is the AND of all
 * individual comparisons, so the overall result is only true if every
 * byte matched. The comparison runs for the full length of both strings
 * regardless of where a mismatch occurs.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// --- Secret Verification ---

export async function verifyAdminSecret(
  secret: string
): Promise<boolean> {
  const env = getEnv();

  if (!env.ADMIN_SECRET) {
    throw new Error("ADMIN_SECRET is not configured.");
  }

  return timingSafeEqual(secret.trim(), env.ADMIN_SECRET);
}

// --- OTP Challenge ---

export async function createOtpChallenge(): Promise<{
  challengeId: string;
  otp: string;
}> {
  const env = getEnv();
  const otp = generateOtp();
  const challengeId = randomToken(16);
  const otpHash = await sha256(otp);

  await env.AUTH_SESSIONS.put(
    `otp:${challengeId}`,
    JSON.stringify({
      hash: otpHash,
      attempts: 0,
      createdAt: Date.now(),
    }),
    { expirationTtl: OTP_TTL_SECONDS }
  );

  return { challengeId, otp };
}

// --- OTP Verification ---

export type OtpVerifyResult =
  | { success: true; sessionToken: string }
  | { success: false; reason: "expired" | "locked" | "invalid" };

export async function verifyOtp(
  challengeId: string,
  otp: string
): Promise<OtpVerifyResult> {
  const env = getEnv();
  const key = `otp:${challengeId}`;
  const stored = await env.AUTH_SESSIONS.get(key);

  if (!stored) {
    return { success: false, reason: "expired" };
  }

  const challenge = JSON.parse(stored) as {
    hash: string;
    attempts: number;
    createdAt: number;
  };

  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    await env.AUTH_SESSIONS.delete(key);
    return { success: false, reason: "locked" };
  }

  const suppliedHash = await sha256(otp.trim());

  if (suppliedHash !== challenge.hash) {
    challenge.attempts += 1;

    await env.AUTH_SESSIONS.put(
      key,
      JSON.stringify(challenge),
      { expirationTtl: OTP_TTL_SECONDS }
    );

    return { success: false, reason: "invalid" };
  }

  // OTP valid — delete the challenge and issue a session
  await env.AUTH_SESSIONS.delete(key);

  const sessionToken = randomToken(32);

  await env.AUTH_SESSIONS.put(
    `session:${sessionToken}`,
    JSON.stringify({
      authenticatedAt: Date.now(),
    }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );

  return { success: true, sessionToken };
}

// --- Session Guard ---

export interface SessionInfo {
  authenticatedAt: number;
}

export async function getSession(
  sessionToken: string | undefined
): Promise<SessionInfo | null> {
  if (!sessionToken) {
    return null;
  }

  const env = getEnv();
  const stored = await env.AUTH_SESSIONS.get(
    `session:${sessionToken}`
  );

  if (!stored) {
    return null;
  }

  try {
    const data = JSON.parse(stored) as {
      authenticatedAt: number;
    };
    return { authenticatedAt: data.authenticatedAt };
  } catch {
    return null;
  }
}

/**
 * Read the session cookie from a request and validate the session.
 * Returns the session info if valid, null otherwise.
 */
export async function requireAuthentication(
  request: Request
): Promise<SessionInfo | null> {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const sessionToken = parseSessionTokenFromCookie(cookieHeader);
  return getSession(sessionToken);
}

// --- Session Destruction ---

export async function destroySession(
  sessionToken: string | undefined
): Promise<void> {
  if (!sessionToken) {
    return;
  }

  const env = getEnv();
  await env.AUTH_SESSIONS.delete(`session:${sessionToken}`);
}

// --- Cookie Helpers ---

export function setSessionCookie(
  response: Response,
  sessionToken: string
): void {
  response.headers.set("Set-Cookie", buildSetSessionCookie(sessionToken));
}

export function clearSessionCookie(
  response: Response
): void {
  response.headers.set("Set-Cookie", buildClearSessionCookie());
}

/**
 * Extract the session token from a request's cookie header.
 */
export function getSessionTokenFromRequest(
  request: Request
): string | undefined {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  return parseSessionTokenFromCookie(cookieHeader);
}

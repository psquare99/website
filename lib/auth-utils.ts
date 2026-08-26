// Durable V1: Auth utilities (pure functions, no Cloudflare dependencies)
// Extracted for testability. These are the same implementations as in lib/auth.ts.

const OTP_TTL_SECONDS = 10 * 60;
const SESSION_TTL_SECONDS = 24 * 60 * 60;
const MAX_OTP_ATTEMPTS = 5;

export { OTP_TTL_SECONDS, SESSION_TTL_SECONDS, MAX_OTP_ATTEMPTS };

export async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function randomToken(length = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);

  return String(100000 + (array[0] % 900000));
}

// --- Cookie Parsing ---

export const SESSION_COOKIE_NAME = "admin_session";

export function parseSessionTokenFromCookie(
  cookieHeader: string
): string | undefined {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!match) {
    return undefined;
  }

  return match.split("=").slice(1).join("=");
}

// --- Cookie Header Builders ---

export function buildSetSessionCookie(
  sessionToken: string
): string {
  return [
    `${SESSION_COOKIE_NAME}=${sessionToken}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=86400",
  ].join("; ");
}

export function buildClearSessionCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

// --- OTP Challenge State Machine ---

export interface OtpChallenge {
  hash: string;
  attempts: number;
  createdAt: number;
}

export function verifyOtpChallenge(
  challenge: OtpChallenge,
  otp: string,
  suppliedHash: string
): {
  valid: boolean;
  locked: boolean;
  updatedChallenge: OtpChallenge;
} {
  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    return {
      valid: false,
      locked: true,
      updatedChallenge: challenge,
    };
  }

  if (suppliedHash !== challenge.hash) {
    return {
      valid: false,
      locked: false,
      updatedChallenge: {
        ...challenge,
        attempts: challenge.attempts + 1,
      },
    };
  }

  return {
    valid: true,
    locked: false,
    updatedChallenge: challenge,
  };
}

// Durable V1: Auth utility tests
// Tests for pure crypto, cookie, and OTP logic (no Cloudflare runtime needed)

import test from "node:test";
import assert from "node:assert/strict";

import {
  sha256,
  randomToken,
  generateOtp,
  parseSessionTokenFromCookie,
  buildSetSessionCookie,
  buildClearSessionCookie,
  SESSION_COOKIE_NAME,
  MAX_OTP_ATTEMPTS,
  verifyOtpChallenge,
  type OtpChallenge,
} from "@/lib/auth-utils";

// --- SHA-256 Tests ---

test("sha256 produces consistent hex output", async () => {
  const hash = await sha256("hello");
  assert.equal(typeof hash, "string");
  assert.equal(hash.length, 64); // 256 bits = 64 hex chars
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test("sha256 is deterministic", async () => {
  const a = await sha256("test-input");
  const b = await sha256("test-input");
  assert.equal(a, b);
});

test("sha256 produces different hashes for different inputs", async () => {
  const a = await sha256("input-a");
  const b = await sha256("input-b");
  assert.notEqual(a, b);
});

// --- Random Token Tests ---

test("randomToken produces hex string of double the specified byte length", () => {
  const token = randomToken(32);
  assert.equal(token.length, 64); // 32 bytes = 64 hex chars
  assert.match(token, /^[0-9a-f]{64}$/);
});

test("randomToken produces different values on each call", () => {
  const a = randomToken(32);
  const b = randomToken(32);
  assert.notEqual(a, b);
});

// --- OTP Generation Tests ---

test("generateOtp produces exactly 6 digits", () => {
  for (let i = 0; i < 20; i++) {
    const otp = generateOtp();
    assert.equal(otp.length, 6);
    assert.match(otp, /^[0-9]{6}$/);
  }
});

test("generateOtp produces values in 100000-999999 range", () => {
  for (let i = 0; i < 20; i++) {
    const otp = generateOtp();
    const num = parseInt(otp, 10);
    assert.ok(num >= 100000, `OTP ${otp} < 100000`);
    assert.ok(num <= 999999, `OTP ${otp} > 999999`);
  }
});

// --- Cookie Parsing Tests ---

test("parseSessionTokenFromCookie extracts token from single cookie", () => {
  const token = parseSessionTokenFromCookie(
    `${SESSION_COOKIE_NAME}=abc123`
  );
  assert.equal(token, "abc123");
});

test("parseSessionTokenFromCookie extracts token from multiple cookies", () => {
  const cookieHeader = `other=value; ${SESSION_COOKIE_NAME}=mytoken; another=val`;
  const token = parseSessionTokenFromCookie(cookieHeader);
  assert.equal(token, "mytoken");
});

test("parseSessionTokenFromCookie returns undefined when cookie not present", () => {
  const token = parseSessionTokenFromCookie("other=value; another=val");
  assert.equal(token, undefined);
});

test("parseSessionTokenFromCookie returns undefined for empty string", () => {
  const token = parseSessionTokenFromCookie("");
  assert.equal(token, undefined);
});

test("parseSessionTokenFromCookie handles tokens containing equals signs", () => {
  const token = parseSessionTokenFromCookie(
    `${SESSION_COOKIE_NAME}=abc=def=ghi`
  );
  assert.equal(token, "abc=def=ghi");
});

// --- Cookie Builder Tests ---

test("buildSetSessionCookie has correct attributes", () => {
  const cookie = buildSetSessionCookie("test-token");
  assert.ok(cookie.includes(`${SESSION_COOKIE_NAME}=test-token`));
  assert.ok(cookie.includes("Path=/"));
  assert.ok(cookie.includes("HttpOnly"));
  assert.ok(cookie.includes("Secure"));
  assert.ok(cookie.includes("SameSite=Lax"));
  assert.ok(cookie.includes("Max-Age=86400"));
});

test("buildClearSessionCookie sets Max-Age=0", () => {
  const cookie = buildClearSessionCookie();
  assert.ok(cookie.includes(`${SESSION_COOKIE_NAME}=`));
  assert.ok(cookie.includes("Max-Age=0"));
});

// --- OTP Challenge Verification Tests ---

function makeChallenge(
  overrides: Partial<OtpChallenge> = {}
): OtpChallenge {
  return {
    hash: "expected-hash",
    attempts: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

test("verifyOtpChallenge: correct OTP is valid", async () => {
  const otp = "123456";
  const hash = await sha256(otp);
  const challenge = makeChallenge({ hash });

  const result = verifyOtpChallenge(challenge, otp, hash);
  assert.equal(result.valid, true);
  assert.equal(result.locked, false);
});

test("verifyOtpChallenge: wrong OTP is invalid and increments attempts", async () => {
  const challenge = makeChallenge({
    hash: await sha256("123456"),
    attempts: 0,
  });

  const wrongHash = await sha256("654321");
  const result = verifyOtpChallenge(challenge, "654321", wrongHash);

  assert.equal(result.valid, false);
  assert.equal(result.locked, false);
  assert.equal(result.updatedChallenge.attempts, 1);
});

test("verifyOtpChallenge: locks out after MAX_OTP_ATTEMPTS", async () => {
  const challenge = makeChallenge({
    hash: await sha256("123456"),
    attempts: MAX_OTP_ATTEMPTS,
  });

  const wrongHash = await sha256("654321");
  const result = verifyOtpChallenge(challenge, "654321", wrongHash);

  assert.equal(result.valid, false);
  assert.equal(result.locked, true);
  assert.equal(result.updatedChallenge.attempts, MAX_OTP_ATTEMPTS);
});

test("verifyOtpChallenge: does not increment attempts when already locked", async () => {
  const challenge = makeChallenge({
    hash: await sha256("123456"),
    attempts: MAX_OTP_ATTEMPTS,
  });

  const result = verifyOtpChallenge(challenge, "123456", challenge.hash);
  assert.equal(result.valid, false);
  assert.equal(result.locked, true);
});

// --- Cookie Session Guard Simulation ---
// These tests prove the cookie → session-token extraction works correctly
// without needing the Cloudflare runtime.

test("session guard flow: extract token from cookie header", () => {
  const sessionToken = randomToken(32);
  const cookieHeader = buildSetSessionCookie(sessionToken);
  const extracted = parseSessionTokenFromCookie(cookieHeader);
  assert.equal(extracted, sessionToken);
});

test("session guard flow: missing cookie returns undefined", () => {
  const extracted = parseSessionTokenFromCookie("");
  assert.equal(extracted, undefined);
});

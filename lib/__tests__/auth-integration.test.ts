// Durable V1: Phase 1.5 — Auth Guard Integration Tests
// Exercises requireAuthentication(), verifyOtp(), and createOtpChallenge()
// against a real mock KV store, not just pure function state machines.
//
// getCloudflareContext() reads from globalThis[Symbol.for("__cloudflare-context__")]
// at call time. We set it once at the top level before any auth functions are called.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { randomToken, SESSION_TTL_SECONDS, MAX_OTP_ATTEMPTS } from "@/lib/auth-utils";

import {
  SESSION_COOKIE_NAME,
  createOtpChallenge,
  verifyOtp,
  requireAuthentication,
} from "@/lib/auth";

// ============================================================
// Mock KV — faithful interface match with TTL simulation
// ============================================================

class MockKVNamespace {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt != null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async put(
    key: string,
    value: string,
    opts?: { expirationTtl?: number }
  ): Promise<void> {
    const expiresAt =
      opts?.expirationTtl != null
        ? Date.now() + opts.expirationTtl * 1000
        : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ============================================================
// Global context setup
// ============================================================

const cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
const mockKV = new MockKVNamespace();
const mockEnv = { AUTH_SESSIONS: mockKV } as unknown as CloudflareEnv;

// Save and restore original context if any
const originalContext = (globalThis as Record<symbol, unknown>)[
  cloudflareContextSymbol
];

// Set mock before any auth functions are called
(globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
  env: mockEnv,
};

afterEach(() => {
  // Restore original context after each test
  if (originalContext !== undefined) {
    (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] =
      originalContext;
  } else {
    delete (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol];
  }
  // Re-set mock for subsequent tests
  (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
    env: mockEnv,
  };
});

// ============================================================
// 1. SESSION GUARD — REAL KV STATE TESTS
// ============================================================

test("session guard: valid unexpired session returns SessionInfo", async () => {
  const sessionToken = randomToken(32);
  const authenticatedAt = Date.now();
  await mockKV.put(
    `session:${sessionToken}`,
    JSON.stringify({ authenticatedAt }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );

  const request = new Request("http://localhost/admin", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
  });

  const result = await requireAuthentication(request);

  assert.notEqual(result, null);
  assert.equal(result!.authenticatedAt, authenticatedAt);
});

test("session guard: expired session (KV TTL) returns null", async () => {
  const sessionToken = randomToken(32);
  // Write entry with 1 second TTL — will expire before we read
  await mockKV.put(
    `session:${sessionToken}`,
    JSON.stringify({ authenticatedAt: Date.now() }),
    { expirationTtl: 1 }
  );

  // Wait for TTL to expire
  await new Promise((r) => setTimeout(r, 1500));

  const request = new Request("http://localhost/admin", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
  });

  const result = await requireAuthentication(request);
  assert.equal(result, null, "expired session must not be accepted");
});

test("session guard: forged token (no matching KV entry) returns null", async () => {
  const forgedToken = randomToken(32);

  const request = new Request("http://localhost/admin", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${forgedToken}` },
  });

  const result = await requireAuthentication(request);
  assert.equal(result, null, "forged token must not be accepted");
});

test("session guard: missing cookie returns null", async () => {
  const request = new Request("http://localhost/admin");

  const result = await requireAuthentication(request);
  assert.equal(result, null, "missing cookie must return null");
});

// ============================================================
// 2. OTP LOCKOUT — PERSISTENCE ACROSS SEPARATE REQUESTS
// ============================================================

test("OTP lockout: attempt count persists and increments across separate verifyOtp calls", async () => {
  const { challengeId, otp } = await createOtpChallenge();
  const wrongOtp = otp === "123456" ? "654321" : "123456";

  // Simulate MAX_OTP_ATTEMPTS separate HTTP requests, each with a wrong OTP
  for (let i = 0; i < MAX_OTP_ATTEMPTS; i++) {
    const result = await verifyOtp(challengeId, wrongOtp);
    assert.equal(result.success, false, `attempt ${i + 1} should fail`);

    // Read the persisted challenge directly from KV to verify attempt count
    const stored = await mockKV.get(`otp:${challengeId}`);
    assert.notEqual(stored, null, `KV entry must exist after attempt ${i + 1}`);
    const challenge = JSON.parse(stored!);
    assert.equal(
      challenge.attempts,
      i + 1,
      `persisted attempts must be ${i + 1} after attempt ${i + 1}, got ${challenge.attempts}`
    );
  }
});

test("OTP lockout: 6th wrong attempt is rejected as locked using persisted count", async () => {
  const { challengeId, otp } = await createOtpChallenge();
  const wrongOtp = otp === "123456" ? "654321" : "123456";

  // Exhaust all attempts
  for (let i = 0; i < MAX_OTP_ATTEMPTS; i++) {
    await verifyOtp(challengeId, wrongOtp);
  }

  // 6th attempt — must be "locked", not "invalid"
  const result = await verifyOtp(challengeId, wrongOtp);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(
      result.reason,
      "locked",
      "6th attempt must use persisted count to determine lockout"
    );
  }
});

test("OTP lockout: correct OTP after lockout is still rejected", async () => {
  const { challengeId, otp } = await createOtpChallenge();
  const wrongOtp = otp === "123456" ? "654321" : "123456";

  // Exhaust all attempts with wrong OTPs
  for (let i = 0; i < MAX_OTP_ATTEMPTS; i++) {
    await verifyOtp(challengeId, wrongOtp);
  }

  // Submit the correct OTP — must still be locked
  const result = await verifyOtp(challengeId, otp);
  assert.equal(result.success, false, "correct OTP after lockout must fail");
  if (!result.success) {
    assert.equal(
      result.reason,
      "locked",
      "correct OTP must not bypass persisted lockout"
    );
  }
});

test("OTP: correct OTP before lockout still succeeds", async () => {
  const { challengeId, otp } = await createOtpChallenge();
  const wrongOtp = otp === "123456" ? "654321" : "123456";

  // 3 wrong attempts (below threshold)
  for (let i = 0; i < 3; i++) {
    const r = await verifyOtp(challengeId, wrongOtp);
    assert.equal(r.success, false);
  }

  // Correct OTP should still work
  const result = await verifyOtp(challengeId, otp);
  assert.equal(result.success, true, "correct OTP before lockout must succeed");
});

// ============================================================
// 3. TTL ASSERTIONS
// ============================================================

test("OTP challenge TTL: attempt after 10-minute window is rejected as expired", async () => {
  const { challengeId, otp } = await createOtpChallenge();

  // Simulate TTL expiry by deleting the KV entry (as Cloudflare KV would)
  await mockKV.delete(`otp:${challengeId}`);

  const result = await verifyOtp(challengeId, otp);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(
      result.reason,
      "expired",
      "OTP attempt after TTL expiry must be rejected"
    );
  }
});

test("OTP challenge TTL: entry with 1-second TTL expires correctly", async () => {
  const { challengeId, otp } = await createOtpChallenge();

  // Overwrite with a 1-second TTL entry
  const stored = await mockKV.get(`otp:${challengeId}`);
  assert.notEqual(stored, null);
  await mockKV.delete(`otp:${challengeId}`);
  await mockKV.put(`otp:${challengeId}`, stored!, { expirationTtl: 1 });

  await new Promise((r) => setTimeout(r, 1500));

  const result = await verifyOtp(challengeId, otp);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.reason, "expired");
  }
});

test("Session TTL: session with 1-second TTL expires correctly", async () => {
  const sessionToken = randomToken(32);
  await mockKV.put(
    `session:${sessionToken}`,
    JSON.stringify({ authenticatedAt: Date.now() }),
    { expirationTtl: 1 }
  );

  await new Promise((r) => setTimeout(r, 1500));

  const request = new Request("http://localhost/admin", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
  });

  const result = await requireAuthentication(request);
  assert.equal(result, null, "session must be null after TTL expiry");
});

test("Session TTL: valid unexpired session passes guard", async () => {
  const sessionToken = randomToken(32);
  const authenticatedAt = Date.now();
  await mockKV.put(
    `session:${sessionToken}`,
    JSON.stringify({ authenticatedAt }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );

  const request = new Request("http://localhost/admin", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
  });

  const result = await requireAuthentication(request);
  assert.notEqual(result, null);
  assert.equal(result!.authenticatedAt, authenticatedAt);
});

// ============================================================
// 4. FULL END-TO-END FLOW
// ============================================================

test("full flow: createOtpChallenge → verifyOtp → session guard succeeds", async () => {
  // Step 1: Create challenge
  const { challengeId, otp } = await createOtpChallenge();

  // Step 2: Verify OTP — should issue a session
  const verifyResult = await verifyOtp(challengeId, otp);
  assert.equal(verifyResult.success, true);
  assert.ok("sessionToken" in verifyResult);
  const { sessionToken } = verifyResult as { sessionToken: string };

  // Step 3: Session guard validates the issued session
  const request = new Request("http://localhost/admin", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
  });

  const sessionInfo = await requireAuthentication(request);
  assert.notEqual(sessionInfo, null);
  assert.equal(typeof sessionInfo!.authenticatedAt, "number");
  // authenticatedAt should be very recent (within last 5 seconds)
  assert.ok(Date.now() - sessionInfo!.authenticatedAt < 5000);
});

test("full flow: destroySession invalidates the session", async () => {
  const { destroySession } = await import("@/lib/auth");

  const { challengeId, otp } = await createOtpChallenge();
  const verifyResult = await verifyOtp(challengeId, otp);
  assert.equal(verifyResult.success, true);
  const { sessionToken } = verifyResult as { sessionToken: string };

  // Session is valid
  const request = new Request("http://localhost/admin", {
    headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
  });
  const sessionInfo = await requireAuthentication(request);
  assert.notEqual(sessionInfo, null);

  // Destroy the session
  await destroySession(sessionToken);

  // Session is now invalid
  const result = await requireAuthentication(
    new Request("http://localhost/admin", {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}` },
    })
  );
  assert.equal(result, null, "destroyed session must not be accepted");
});

// Durable V1: Email delivery tests
// Tests sendOtpEmail with mocked Resend provider.
//
// getCloudflareContext() reads from globalThis[Symbol.for("__cloudflare-context__")]
// at call time. We set it once at the top level before any functions are called.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

// ============================================================
// Global context setup
// ============================================================

const cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
const originalContext = (globalThis as Record<symbol, unknown>)[
  cloudflareContextSymbol
];

function setMockEnv(env: Partial<CloudflareEnv>) {
  (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
    env,
  };
}

afterEach(() => {
  if (originalContext !== undefined) {
    (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] =
      originalContext;
  } else {
    delete (globalThis as Record<symbol, unknown>)[cloudflareContextSymbol];
  }
});

// ============================================================
// Tests
// ============================================================

test("sendOtpEmail: logs OTP when RESEND_API_KEY is not configured", async () => {
  setMockEnv({
    RESEND_API_KEY: undefined,
    ADMIN_EMAIL: undefined,
  } as unknown as CloudflareEnv);

  const warnings: string[] = [];
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.join(" "));

  try {
    const { sendOtpEmail } = await import("@/lib/email");
    await sendOtpEmail("123456");
  } finally {
    console.warn = origWarn;
  }

  assert.equal(warnings.length, 1, "should log exactly one warning");
  assert.ok(
    warnings[0].includes("123456"),
    "warning should contain the OTP"
  );
  assert.ok(
    warnings[0].includes("not configured"),
    "warning should mention missing config"
  );
});

test("sendOtpEmail: logs OTP when ADMIN_EMAIL is missing", async () => {
  setMockEnv({
    RESEND_API_KEY: "re_fake_key",
    ADMIN_EMAIL: undefined,
  } as unknown as CloudflareEnv);

  const warnings: string[] = [];
  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.join(" "));

  try {
    const { sendOtpEmail } = await import("@/lib/email");
    await sendOtpEmail("654321");
  } finally {
    console.warn = origWarn;
  }

  assert.equal(warnings.length, 1, "should log exactly one warning");
  assert.ok(
    warnings[0].includes("654321"),
    "warning should contain the OTP"
  );
});

test("sendOtpEmail: throws when Resend API call fails", async () => {
  setMockEnv({
    RESEND_API_KEY: "re_fake_key_that_will_fail",
    ADMIN_EMAIL: "admin@example.com",
  } as unknown as CloudflareEnv);

  const { sendOtpEmail } = await import("@/lib/email");

  // The Resend SDK will fail with an invalid API key
  await assert.rejects(
    () => sendOtpEmail("123456"),
    (err: Error) => {
      assert.ok(
        err.message.includes("Email delivery failed"),
        `error message should mention delivery failure, got: ${err.message}`
      );
      return true;
    }
  );
});

test("sendOtpEmail: function is exported and callable", async () => {
  const { sendOtpEmail } = await import("@/lib/email");
  assert.equal(typeof sendOtpEmail, "function");
});

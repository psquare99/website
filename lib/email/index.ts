import { Resend } from "resend";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getEnv() {
  const { env } = getCloudflareContext();
  return env as CloudflareEnv;
}

/**
 * Send a one-time password email to the admin recipient.
 *
 * Requires the following environment variables (Cloudflare Worker secrets/vars):
 * - RESEND_API_KEY: Resend API key (secret)
 * - ADMIN_EMAIL: Recipient email address (configurable, not hardcoded)
 *
 * On failure, throws an error. The caller is responsible for handling the error
 * and returning an appropriate response to the client.
 *
 * In development (no API key configured), logs the OTP to the console and
 * returns without sending an email.
 */
export async function sendOtpEmail(otp: string): Promise<void> {
  const env = getEnv();
  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.ADMIN_EMAIL;

  if (!apiKey || !toEmail) {
    // Development fallback: log OTP to console
    console.warn(
      "[EMAIL] RESEND_API_KEY or ADMIN_EMAIL not configured. " +
        `OTP (dev only): ${otp}`
    );
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL || "P² Admin <onboarding@resend.dev>",
    to: toEmail,
    subject: "Your P² Admin verification code",
    text: `Your verification code is ${otp}.\n\nThis code expires shortly. If you didn't request it, you can safely ignore this email.`,
  });

  if (error) {
    throw new Error(
      `Email delivery failed: ${error.message || JSON.stringify(error)}`
    );
  }
}

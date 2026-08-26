import { NextRequest } from "next/server";
import {
  createOtpChallenge,
  verifyAdminSecret,
} from "@/lib/auth";

/**
 * POST /api/admin/auth/request-otp
 *
 * Validates the shared secret, generates a 6-digit OTP,
 * stores its hash in KV with a 10-minute TTL.
 *
 * OTP delivery: console-log only (no email provider wired yet).
 * Follow-up: wire Resend or equivalent in a later phase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      secret?: unknown;
    };

    const secret =
      typeof body.secret === "string" ? body.secret : "";

    const valid = await verifyAdminSecret(secret);

    if (!valid) {
      return Response.json(
        {
          error:
            "Nice try. The chimney smoke says otherwise.",
        },
        { status: 401 }
      );
    }

    const { challengeId, otp } =
      await createOtpChallenge();

    // OTP delivery: console-log for now.
    // In production, this would be sent via email.
    console.log(
      `[AUTH] OTP for challenge ${challengeId}: ${otp}`
    );

    return Response.json({
      success: true,
      challengeId,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Something went wrong while starting authentication.",
      },
      { status: 500 }
    );
  }
}

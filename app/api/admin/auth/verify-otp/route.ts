import { NextRequest } from "next/server";
import {
  verifyOtp,
  setSessionCookie,
} from "@/lib/auth";

/**
 * POST /api/admin/auth/verify-otp
 *
 * Verifies the OTP against the challenge. On success,
 * issues a session directly (same-origin).
 * Sets an HttpOnly/Secure/SameSite=Lax cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      challengeId?: unknown;
      otp?: unknown;
    };

    const challengeId =
      typeof body.challengeId === "string"
        ? body.challengeId
        : "";

    const otp =
      typeof body.otp === "string" ? body.otp : "";

    if (!challengeId || !otp) {
      return Response.json(
        {
          error:
            "Enter the verification code.",
        },
        { status: 400 }
      );
    }

    const result = await verifyOtp(challengeId, otp);

    if (!result.success) {
      // Single generic error for all failure modes (expired, locked, invalid).
      // Prevents an attacker from distinguishing whether a challengeId exists,
      // whether they've been locked out, or whether the OTP was simply wrong.
      return Response.json(
        { error: "Invalid or expired code." },
        { status: 401 }
      );
    }

    // Session issued directly.
    const response = Response.json({
      success: true,
    });

    setSessionCookie(response, result.sessionToken);

    return response;
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Unable to verify the code.",
      },
      { status: 500 }
    );
  }
}

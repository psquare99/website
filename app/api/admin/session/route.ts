import { NextRequest } from "next/server";
import {
  requireAuthentication,
  destroySession,
  clearSessionCookie,
  getSessionTokenFromRequest,
} from "@/lib/auth";

/**
 * GET /api/admin/session
 *
 * Returns { authenticated: true } if the session is valid,
 * { authenticated: false } otherwise.
 */
export async function GET(request: NextRequest) {
  const session = await requireAuthentication(request);

  if (!session) {
    return Response.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return Response.json({
    authenticated: true,
    authenticatedAt: session.authenticatedAt,
  });
}

/**
 * DELETE /api/admin/session
 *
 * Logs the user out by destroying the server-side session in KV
 * AND clearing the browser cookie. A stolen pre-logout session
 * token will no longer authenticate after this call.
 */
export async function DELETE(request: NextRequest) {
  const sessionToken = getSessionTokenFromRequest(request);

  if (sessionToken) {
    await destroySession(sessionToken);
  }

  const response = new Response(null, { status: 204 });
  clearSessionCookie(response);
  return response;
}

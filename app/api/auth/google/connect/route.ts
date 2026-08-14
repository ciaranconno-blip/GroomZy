import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";
import { adminAuth } from "@/lib/firebase-admin";

// Verifies the caller's own Firebase ID token rather than trusting a bare uid
// query param — otherwise, once sign-up is open, any signed-in groomer could
// pass a different uid and hijack another business's calendar connection.
// Returns the Google auth URL rather than redirecting directly, since the
// token must travel as an Authorization header (not a URL param that would
// sit in server access logs) — the caller does the navigation itself.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return NextResponse.json({ url: getAuthUrl(uid) });
}

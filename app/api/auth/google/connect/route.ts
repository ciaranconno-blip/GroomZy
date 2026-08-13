import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";

// TODO before public deploy: this trusts the uid query param as-is. Fine for
// V1 single-tenant testing, but once this is multi-groomer, verify a Firebase
// ID token (passed as a Bearer header from the client) instead of trusting
// a bare query param, so one groomer can't connect a calendar to another's uid.
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }
  return NextResponse.redirect(getAuthUrl(uid));
}

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeAndStore } from "@/lib/googleCalendar";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const uid = req.nextUrl.searchParams.get("state"); // groomerId, round-tripped via OAuth state
  const error = req.nextUrl.searchParams.get("error");

  const adminUrl = new URL("/admin", req.nextUrl.origin);

  if (error) {
    adminUrl.searchParams.set("calendar_error", error); // e.g. "access_denied" if they cancel
    return NextResponse.redirect(adminUrl);
  }
  if (!code || !uid) {
    adminUrl.searchParams.set("calendar_error", "missing_params");
    return NextResponse.redirect(adminUrl);
  }

  try {
    await exchangeCodeAndStore(code, uid);
    adminUrl.searchParams.set("calendar", "connected");
  } catch (err) {
    console.error("Google Calendar connect failed:", err);
    adminUrl.searchParams.set("calendar_error", "exchange_failed");
  }

  return NextResponse.redirect(adminUrl);
}

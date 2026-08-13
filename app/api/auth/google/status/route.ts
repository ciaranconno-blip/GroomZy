import { NextRequest, NextResponse } from "next/server";
import { isCalendarConnected } from "@/lib/googleCalendar";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  const connected = await isCalendarConnected(uid);
  return NextResponse.json({ connected });
}

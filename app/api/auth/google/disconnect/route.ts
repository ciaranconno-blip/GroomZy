import { NextRequest, NextResponse } from "next/server";
import { disconnectCalendar } from "@/lib/googleCalendar";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  await disconnectCalendar(uid);
  return NextResponse.json({ disconnected: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createEventForBooking } from "@/lib/googleCalendar";

// Called client-side right after a direct-path booking is written to
// Firestore. Deliberately a best-effort side effect, not part of the booking
// transaction itself — a groomer without a connected calendar (or a
// transient Calendar API error) should never block a client from booking.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { groomerId, dogName, breedName, serviceName, ownerName, ownerPhone, date, time, durationMin } = body;

  if (!groomerId || !date || !time) {
    return NextResponse.json({ synced: false, reason: "missing_fields" }, { status: 400 });
  }

  const result = await createEventForBooking(groomerId, {
    dogName,
    breedName,
    serviceName,
    ownerName,
    ownerPhone,
    date,
    time,
    durationMin,
  });

  return NextResponse.json(result);
}

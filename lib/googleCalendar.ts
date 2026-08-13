import { google } from "googleapis";
import { adminDb } from "@/lib/firebase-admin";

function oauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );
}

export function getAuthUrl(groomerId: string): string {
  const client = oauthClient();
  return client.generateAuthUrl({
    access_type: "offline", // required to get a refresh_token back
    prompt: "consent", // forces a fresh refresh_token even on repeat connects
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: groomerId,
  });
}

export async function exchangeCodeAndStore(code: string, groomerId: string) {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    // Happens if the groomer had already granted consent before and Google
    // skipped issuing a new refresh_token — prompt=consent above should
    // prevent this, but fail loudly rather than silently losing the connection.
    throw new Error("No refresh token returned — try disconnecting in Google Account settings and reconnecting.");
  }

  await adminDb.collection("googleCalendarTokens").doc(groomerId).set({
    refreshToken: tokens.refresh_token,
    scope: tokens.scope,
    connectedAt: new Date().toISOString(),
  });
}

export async function isCalendarConnected(groomerId: string): Promise<boolean> {
  const doc = await adminDb.collection("googleCalendarTokens").doc(groomerId).get();
  return doc.exists;
}

export async function disconnectCalendar(groomerId: string) {
  await adminDb.collection("googleCalendarTokens").doc(groomerId).delete();
}

/**
 * Creates a Calendar event for a confirmed booking using the groomer's stored
 * refresh token. Called right after a direct-path booking is written to
 * Firestore (see app/api/bookings/sync-calendar). Silently no-ops if the
 * groomer hasn't connected a calendar yet — syncing is a bonus, not a
 * requirement for taking bookings.
 */
export async function createEventForBooking(
  groomerId: string,
  booking: {
    dogName: string;
    breedName: string;
    serviceName: string;
    ownerName: string;
    ownerPhone: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    durationMin: number;
  }
): Promise<{ synced: boolean; reason?: string }> {
  const tokenDoc = await adminDb.collection("googleCalendarTokens").doc(groomerId).get();
  if (!tokenDoc.exists) return { synced: false, reason: "not_connected" };

  const client = oauthClient();
  client.setCredentials({ refresh_token: tokenDoc.data()!.refreshToken });

  const calendar = google.calendar({ version: "v3", auth: client });

  const start = new Date(`${booking.date}T${booking.time}:00`);
  const end = new Date(start.getTime() + booking.durationMin * 60_000);

  try {
    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `${booking.dogName} (${booking.breedName}) — ${booking.serviceName}`,
        description: `Owner: ${booking.ownerName}\nPhone: ${booking.ownerPhone}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    });
    return { synced: true };
  } catch (err) {
    console.error("Calendar event creation failed:", err);
    return { synced: false, reason: "api_error" };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { PLATFORM_OWNER_UID } from "@/lib/platform";

// Server-side only — bookings/enquiries are owner-gated by Firestore rules,
// so a cross-business count needs the Admin SDK (which bypasses rules) plus
// its own access check here, gated to the one uid that runs groomzy.ie.
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

  if (uid !== PLATFORM_OWNER_UID) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const [businessesSnap, bookingsCount, enquiriesCount] = await Promise.all([
    adminDb.collection("businesses").get(),
    adminDb.collection("bookings").count().get(),
    adminDb.collection("enquiries").count().get(),
  ]);

  const businesses = businessesSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      businessName: data.businessName,
      slug: data.slug,
      town: data.town,
      county: data.county,
      subscriptionStatus: data.subscriptionStatus,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    };
  });

  const byStatus: Record<string, number> = {};
  for (const b of businesses) {
    byStatus[b.subscriptionStatus] = (byStatus[b.subscriptionStatus] ?? 0) + 1;
  }

  businesses.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return NextResponse.json({
    businesses,
    totals: {
      totalBusinesses: businesses.length,
      byStatus,
      totalBookings: bookingsCount.data().count,
      totalEnquiries: enquiriesCount.data().count,
    },
  });
}

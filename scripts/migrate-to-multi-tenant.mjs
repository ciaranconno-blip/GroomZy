// One-off migration: create the businesses/{businessId} doc for the
// existing Fairy Dog Mother tenant, then backfill businessId + ownerId onto
// every existing bookings/enquiries/waitlist doc.
//
// Idempotent — safe to re-run. Defaults to --dry-run (no writes); pass
// --apply to actually write.
//
// Run with:
//   GOOGLE_APPLICATION_CREDENTIALS=~/.config/groomzy/service-account.json node scripts/migrate-to-multi-tenant.mjs
//   GOOGLE_APPLICATION_CREDENTIALS=~/.config/groomzy/service-account.json node scripts/migrate-to-multi-tenant.mjs --apply

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const APPLY = process.argv.includes("--apply");

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

// Values as they exist today in lib/groomer.ts — carried forward as-is.
const FAIRY_DOG_MOTHER = {
  ownerId: "urJLvy0SAST9Th5CMVOA6HII3n62",
  slug: "fairy-dog-mother",
  businessName: "Fairy Dog Mother",
  tagline: "Gentle, unhurried grooming — Ballinasloe & surrounds",
  address: "Main Street",
  town: "Ballinasloe",
  county: "Co. Galway",
  eircode: "H53 XXXX",
  lat: 53.3336,
  lng: -8.2145,
  phone: "+353 00 000 0000",
  hours: [
    { day: "Mon", open: "09:00", close: "17:00" },
    { day: "Tue", open: "09:00", close: "17:00" },
    { day: "Wed", open: "09:00", close: "17:00" },
    { day: "Thu", open: "09:00", close: "17:00" },
    { day: "Fri", open: "09:00", close: "17:00" },
    { day: "Sat", open: "09:00", close: "13:00" },
    { day: "Sun", open: "", close: "", closed: true },
  ],
  rating: 4.9,
  reviewCount: 128,
  socials: {},
  subscriptionStatus: "active", // she's the flagship tenant, not a trial
};

async function ensureBusinessDoc() {
  const existing = await db.collection("businesses").where("slug", "==", FAIRY_DOG_MOTHER.slug).limit(1).get();
  if (!existing.empty) {
    const doc = existing.docs[0];
    console.log(`Business doc already exists: ${doc.id} (slug: ${FAIRY_DOG_MOTHER.slug}) — reusing it.`);
    return doc.id;
  }

  console.log(`No business doc found for slug "${FAIRY_DOG_MOTHER.slug}" — ${APPLY ? "creating" : "would create"} one.`);
  if (!APPLY) return "DRY-RUN-BUSINESS-ID";

  const ref = await db.collection("businesses").add({
    ...FAIRY_DOG_MOTHER,
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log(`Created businesses/${ref.id}`);
  return ref.id;
}

async function backfillCollection(collectionName, businessId, ownerId) {
  const snap = await db.collection(collectionName).get();
  const toUpdate = snap.docs.filter((d) => !d.data().businessId);

  console.log(
    `${collectionName}: ${snap.size} total docs, ${toUpdate.length} missing businessId (${APPLY ? "updating now" : "would update"}).`
  );

  if (!APPLY || toUpdate.length === 0) return toUpdate.length;

  // Firestore batch writes cap at 500 ops — chunk defensively.
  for (let i = 0; i < toUpdate.length; i += 500) {
    const batch = db.batch();
    for (const doc of toUpdate.slice(i, i + 500)) {
      batch.set(doc.ref, { businessId, ownerId }, { merge: true });
    }
    await batch.commit();
  }
  return toUpdate.length;
}

async function main() {
  console.log(`Mode: ${APPLY ? "APPLY (writing for real)" : "DRY RUN (no writes — pass --apply to commit)"}\n`);

  const businessId = await ensureBusinessDoc();
  const ownerId = FAIRY_DOG_MOTHER.ownerId;

  const counts = {};
  for (const col of ["bookings", "enquiries", "waitlist"]) {
    counts[col] = await backfillCollection(col, businessId, ownerId);
  }

  console.log("\nSummary:");
  console.log(`  businessId: ${businessId}`);
  console.log(`  bookings updated:  ${counts.bookings}`);
  console.log(`  enquiries updated: ${counts.enquiries}`);
  console.log(`  waitlist updated:  ${counts.waitlist}`);
  if (!APPLY) console.log("\nThis was a dry run — no data was changed. Re-run with --apply to commit.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

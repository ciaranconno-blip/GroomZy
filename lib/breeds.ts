// Breed & coat taxonomy — ported directly from GROOMER_APP_MEMORY.md sections 4a/4b.
// Coat type drives routing more than size (see Pomeranian/Corgi note below) —
// never key routing off size alone.

export type SizeTier = "toy" | "small" | "medium" | "large" | "giant";
export type CoatType =
  | "smooth"
  | "single"
  | "curly"
  | "wire"
  | "double"
  | "corded"
  | "hairless";
export type BookingPath = "direct" | "enquiry";

export interface Breed {
  breedId: string;
  displayName: string;
  sizeTier: SizeTier;
  coatType: CoatType;
  defaultPath: BookingPath;
  baseDurationMin: number;
  groomingNotes?: string; // shown to the groomer, never the client
  aliases?: string[];
}

// Coat type is the primary routing signal — this table is the source of truth.
// Groomers may tighten (move a breed from direct → enquiry) but never loosen.
export const COAT_DEFAULT_PATH: Record<CoatType, BookingPath> = {
  smooth: "direct",
  single: "direct",
  curly: "direct", // flag matting risk high in the UI, still bookable direct
  wire: "direct", // hand-stripping is a separate, longer service
  double: "enquiry",
  corded: "enquiry", // specialist service
  hairless: "direct", // skincare service, not clipping
};

export const SIZE_TIER_LABEL: Record<SizeTier, string> = {
  toy: "Toy (under 5kg)",
  small: "Small (5–10kg)",
  medium: "Medium (10–25kg)",
  large: "Large (25–40kg)",
  giant: "Giant (40kg+)",
};

export const BREEDS: Breed[] = [
  // --- Small / single-coat — Path A, ~30–45 min [CARRIED OVER v1] ---
  { breedId: "shih_tzu", displayName: "Shih Tzu", sizeTier: "small", coatType: "single", defaultPath: "direct", baseDurationMin: 45 },
  { breedId: "maltese", displayName: "Maltese", sizeTier: "toy", coatType: "single", defaultPath: "direct", baseDurationMin: 40 },
  { breedId: "bichon_frise", displayName: "Bichon Frisé", sizeTier: "small", coatType: "curly", defaultPath: "direct", baseDurationMin: 45, groomingNotes: "High matting risk — curly coat" },
  { breedId: "yorkshire_terrier", displayName: "Yorkshire Terrier", sizeTier: "toy", coatType: "single", defaultPath: "direct", baseDurationMin: 40 },
  { breedId: "poodle_miniature", displayName: "Poodle (Miniature)", sizeTier: "small", coatType: "curly", defaultPath: "direct", baseDurationMin: 45, groomingNotes: "High matting risk — curly coat", aliases: ["mini poodle"] },
  { breedId: "cavapoo", displayName: "Cavapoo", sizeTier: "small", coatType: "curly", defaultPath: "direct", baseDurationMin: 45, groomingNotes: "High matting risk — curly coat" },
  { breedId: "lhasa_apso", displayName: "Lhasa Apso", sizeTier: "small", coatType: "single", defaultPath: "direct", baseDurationMin: 45 },

  // --- Medium — Path A, ~60 min [CARRIED OVER v1] ---
  { breedId: "cocker_spaniel", displayName: "Cocker Spaniel", sizeTier: "medium", coatType: "single", defaultPath: "direct", baseDurationMin: 60 },
  { breedId: "springer_spaniel", displayName: "Springer Spaniel", sizeTier: "medium", coatType: "single", defaultPath: "direct", baseDurationMin: 60 },
  { breedId: "poodle_standard", displayName: "Poodle (Standard)", sizeTier: "medium", coatType: "curly", defaultPath: "direct", baseDurationMin: 60, groomingNotes: "High matting risk — curly coat" },
  { breedId: "labradoodle", displayName: "Labradoodle", sizeTier: "medium", coatType: "curly", defaultPath: "direct", baseDurationMin: 60, groomingNotes: "High matting risk — curly coat" },

  // --- Large / double-coat — Path B, enquiry only [CARRIED OVER v1] ---
  { breedId: "siberian_husky", displayName: "Siberian Husky", sizeTier: "large", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150, aliases: ["husky", "sibe"] },
  { breedId: "newfoundland", displayName: "Newfoundland", sizeTier: "giant", coatType: "double", defaultPath: "enquiry", baseDurationMin: 180 },
  { breedId: "golden_retriever", displayName: "Golden Retriever", sizeTier: "large", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150 },
  { breedId: "bernese_mountain_dog", displayName: "Bernese Mountain Dog", sizeTier: "giant", coatType: "double", defaultPath: "enquiry", baseDurationMin: 180, aliases: ["bernese"] },
  { breedId: "samoyed", displayName: "Samoyed", sizeTier: "large", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150 },
  { breedId: "alaskan_malamute", displayName: "Alaskan Malamute", sizeTier: "large", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150, aliases: ["malamute"] },
  { breedId: "german_shepherd", displayName: "German Shepherd", sizeTier: "large", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150, aliases: ["gsd"] },
  { breedId: "border_collie", displayName: "Border Collie", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 120 },
  { breedId: "labrador", displayName: "Labrador", sizeTier: "large", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150 },

  // --- Extended double-coat set [EXTENDED — not yet client-validated] ---
  { breedId: "chow_chow", displayName: "Chow Chow", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150 },
  { breedId: "akita", displayName: "Akita", sizeTier: "large", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150 },
  { breedId: "pomeranian", displayName: "Pomeranian", sizeTier: "toy", coatType: "double", defaultPath: "enquiry", baseDurationMin: 90, groomingNotes: "Small but double-coated — de-shedding complexity, hard no-shave rule" },
  { breedId: "corgi", displayName: "Corgi", sizeTier: "small", coatType: "double", defaultPath: "enquiry", baseDurationMin: 90, groomingNotes: "Small but double-coated — de-shedding complexity, hard no-shave rule" },
  { breedId: "australian_shepherd", displayName: "Australian Shepherd", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 150, aliases: ["aussie shepherd"] },
  { breedId: "shiba_inu", displayName: "Shiba Inu", sizeTier: "small", coatType: "double", defaultPath: "enquiry", baseDurationMin: 90 },
  { breedId: "great_pyrenees", displayName: "Great Pyrenees", sizeTier: "giant", coatType: "double", defaultPath: "enquiry", baseDurationMin: 180 },
  { breedId: "keeshond", displayName: "Keeshond", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 120 },
  { breedId: "eurasier", displayName: "Eurasier", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 120 },
  { breedId: "finnish_spitz", displayName: "Finnish Spitz", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 120 },
  { breedId: "icelandic_sheepdog", displayName: "Icelandic Sheepdog", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 120 },
  { breedId: "norwegian_elkhound", displayName: "Norwegian Elkhound", sizeTier: "medium", coatType: "double", defaultPath: "enquiry", baseDurationMin: 120 },

  // --- Corded / specialist — Path B [EXTENDED] ---
  { breedId: "puli", displayName: "Puli", sizeTier: "medium", coatType: "corded", defaultPath: "enquiry", baseDurationMin: 180, groomingNotes: "Specialist corded-coat service" },
  { breedId: "komondor", displayName: "Komondor", sizeTier: "giant", coatType: "corded", defaultPath: "enquiry", baseDurationMin: 210, groomingNotes: "Specialist corded-coat service" },

  // --- Hairless — Path A, skincare service [EXTENDED] ---
  { breedId: "chinese_crested", displayName: "Chinese Crested", sizeTier: "toy", coatType: "hairless", defaultPath: "direct", baseDurationMin: 30, groomingNotes: "Skincare service, not clipping" },
  { breedId: "xoloitzcuintli", displayName: "Xoloitzcuintli", sizeTier: "small", coatType: "hairless", defaultPath: "direct", baseDurationMin: 30, groomingNotes: "Skincare service, not clipping", aliases: ["xolo"] },
];

// Special, non-breed options that must always appear at the end of the picker.
export const UNSURE_DOUBLE_COAT = "double_unsure";
export const OTHER_MIXED_BREED = "other_mixed";

export function findBreed(breedId: string): Breed | undefined {
  return BREEDS.find((b) => b.breedId === breedId);
}

/**
 * Routing rules, exactly as specified in the memory file section 3:
 * 1. Tagged double-coat (or corded) → Path B
 * 2. Not in the list / "other, mixed" → ask single-or-double
 * 3. Answer is "not sure" → Path B (fail-safe, always)
 * 4. Everything else → Path A
 */
export function routeBreed(
  breedId: string,
  unsureAnswer?: "single" | "double" | "not_sure"
): BookingPath {
  if (breedId === UNSURE_DOUBLE_COAT) return "enquiry";

  if (breedId === OTHER_MIXED_BREED) {
    if (unsureAnswer === "double" || unsureAnswer === "not_sure" || !unsureAnswer) {
      return "enquiry"; // fail-safe: unanswered defaults to the safe path
    }
    return "direct";
  }

  const breed = findBreed(breedId);
  if (!breed) return "enquiry"; // unknown breed_id — fail safe
  return breed.defaultPath;
}

export interface ServiceOption {
  id: string;
  name: string;
  durationLabel: string;
  priceFrom: number | null; // null = "enquiry only", no price shown
  note?: string;
}

// [CARRIED OVER v1] — real prices validated with the client.
export const SERVICES: ServiceOption[] = [
  { id: "full_groom_small", name: "Full Groom (small / single-coat)", durationLabel: "30–45 min", priceFrom: 45 },
  { id: "full_groom_medium", name: "Full Groom (medium single-coat)", durationLabel: "~60 min", priceFrom: 60 },
  { id: "bath_blow_dry", name: "Bath & Blow Dry", durationLabel: "~30 min", priceFrom: 30 },
  { id: "tidy_trim", name: "Tidy & Trim (face, paws, tail)", durationLabel: "~20 min", priceFrom: 25 },
  { id: "nail_clipping", name: "Nail Clipping", durationLabel: "add-on", priceFrom: null, note: "Added at booking" },
  { id: "full_groom_large", name: "Large / Double-Coat Full Groom", durationLabel: "variable", priceFrom: null, note: "Enquiry only — consultation required" },
];

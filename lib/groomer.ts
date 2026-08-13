// Single-groomer profile — this is the V1 shape (per business plan §"Map scope":
// one groomer, one page, one map pin). Multi-groomer directory is a later phase
// once there are enough real listings for a marketplace map to be worth showing.
//
// Placeholder data below is representative sample content only, not a real
// business record — swap for the real groomer's details before launch.

export interface GroomerProfile {
  groomerId: string; // Firebase Auth uid — links public bookings to this groomer's calendar/admin
  businessName: string;
  tagline: string;
  address: string;
  town: string;
  county: string;
  eircode: string;
  lat: number;
  lng: number;
  phone: string;
  hours: { day: string; open: string; close: string; closed?: boolean }[];
  rating: number;
  reviewCount: number;
  socials: { instagram?: string; facebook?: string; googleReviews?: string };
}

export const GROOMER: GroomerProfile = {
  groomerId: "urJLvy0SAST9Th5CMVOA6HII3n62",
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
};

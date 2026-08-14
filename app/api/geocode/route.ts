import { NextRequest, NextResponse } from "next/server";

// Wraps Nominatim (OpenStreetMap's free geocoder) so client code never talks
// to it directly — Nominatim's usage policy requires a descriptive
// User-Agent identifying the app, which browsers won't let JS set anyway.
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ie");

  const res = await fetch(url, {
    headers: { "User-Agent": "GroomZy/1.0 (https://groomzy.ie)" },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding service unavailable" }, { status: 502 });
  }

  const results = (await res.json()) as { lat: string; lon: string }[];
  if (results.length === 0) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
}

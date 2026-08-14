import { NextRequest, NextResponse } from "next/server";

const NOTIFY_EMAIL = "ciaranconno@gmail.com";

// Fire-and-forget from the signup flow — a missing/misconfigured API key
// should never block a groomer from finishing signup, so this always
// resolves 200 and just logs when it can't actually send.
export async function POST(req: NextRequest) {
  const { businessName, slug, town, county } = await req.json();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping new-signup notification email.");
    return NextResponse.json({ sent: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GroomZy <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: `New groomer signed up: ${businessName}`,
        html: `
          <p><strong>${businessName}</strong> just signed up on GroomZy.</p>
          <p>${town}, ${county}</p>
          <p><a href="https://groomzy.ie/g/${slug}">View their booking page</a></p>
          <p><a href="https://groomzy.ie/dev/analytics">View platform analytics</a></p>
        `,
      }),
    });
    if (!res.ok) {
      console.error("Resend notification failed:", await res.text());
      return NextResponse.json({ sent: false });
    }
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Resend notification failed:", err);
    return NextResponse.json({ sent: false });
  }
}

import { NextResponse } from "next/server";

// Stub cron handler hit by /vercel.json daily at 06:00 UTC.
// Tomorrow this will:
//   - Pull a fresh snapshot from the Google Ads API
//   - Persist it (Vercel KV or Edge Config) so /api/snapshot can serve it
//   - Optionally notify the operator on anomaly (CPA blowout, zero-impression
//     campaigns, learning-phase exit, etc.) via Telegram webhook.

export const runtime = "edge";

export async function GET(request: Request) {
  // Vercel cron uses a header for verification. When invoked manually
  // without it (e.g. for smoke testing), we still respond 200 with a
  // payload that explains what would happen.
  const isCron = request.headers.get("x-vercel-cron") !== null;

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    triggeredBy: isCron ? "vercel-cron" : "manual",
    next: "Google Ads API pull lands here. See app/api/snapshot/route.ts TODO.",
  });
}

export const POST = GET;

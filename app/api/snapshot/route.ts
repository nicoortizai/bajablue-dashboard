import { NextResponse } from "next/server";
import { loadLiveSnapshot } from "@/lib/data";

// Live snapshot endpoint — merges Google Ads + Search Console + DataForSEO.
// Each source is independently activateable via env vars (see lib/env.ts).
// When a source's env is missing it's silently skipped; when a live pull
// fails the error is surfaced via snapshot.sources.<x>.error so the UI
// can render a precise "Activate" empty-state instead of a hard failure.
//
// Caching: 4-hour TTL in Vercel KV (or in-memory fallback) via withCache.

export const runtime = "nodejs"; // Node runtime — googleapis + KV play nicer here than edge.
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await loadLiveSnapshot();
  return NextResponse.json(
    { ...snapshot, generatedAt: new Date().toISOString() },
    {
      headers: {
        "cache-control": "public, max-age=30, s-maxage=60",
      },
    },
  );
}

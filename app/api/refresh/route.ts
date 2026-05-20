import { NextResponse } from "next/server";
import { checkSource } from "@/lib/env";
import { fetchAdsSnapshot } from "@/lib/google-ads";
import { fetchGscSnapshot } from "@/lib/gsc";
import {
  fetchCompetitorSoV,
  fetchAiOverviewVisibility,
} from "@/lib/dataforseo";

// Cron handler hit by /vercel.json daily at 06:00 UTC.
// Warms the KV cache for every wired data source so the public dashboard
// stays snappy and minimizes API quota burn.
//
// Each source is best-effort — one failure never blocks the others. The
// response payload reports per-source status so the cron log makes the
// state of the world obvious.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRACKED_KEYWORDS = [
  "whale watching la paz",
  "whale watching sea of cortez",
  "multi day expedition baja",
  "blue whale tour mexico",
  "orca tour baja california sur",
  "marine expedition baja",
  "sea of cortez tour",
  "mobula ray tour",
  "swim with whale sharks baja",
  "ecotourism baja california sur",
];

interface SourceReport {
  ready: boolean;
  ok: boolean;
  error?: string;
}

async function safe<T>(label: string, fn: () => Promise<T>): Promise<SourceReport> {
  try {
    await fn();
    return { ready: true, ok: true };
  } catch (e) {
    return {
      ready: true,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function GET(request: Request) {
  const isCron = request.headers.get("x-vercel-cron") !== null;
  const startedAt = Date.now();

  const yourDomain =
    process.env.GSC_SITE_URL?.replace(/^sc-domain:/, "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "") || "bajablue.mx";

  // Run each refresh in parallel — they don't share resources.
  const [ads, gsc, sov, ai] = await Promise.all([
    checkSource("ads").ready
      ? safe("ads", () => fetchAdsSnapshot())
      : Promise.resolve({ ready: false, ok: false } as SourceReport),
    checkSource("gsc").ready
      ? safe("gsc", () => fetchGscSnapshot())
      : Promise.resolve({ ready: false, ok: false } as SourceReport),
    checkSource("dataforseo").ready
      ? safe("sov", () =>
          fetchCompetitorSoV({ yourDomain, keywords: TRACKED_KEYWORDS }),
        )
      : Promise.resolve({ ready: false, ok: false } as SourceReport),
    checkSource("dataforseo").ready
      ? safe("ai", () =>
          fetchAiOverviewVisibility({ yourDomain, keywords: TRACKED_KEYWORDS }),
        )
      : Promise.resolve({ ready: false, ok: false } as SourceReport),
  ]);

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    triggeredBy: isCron ? "vercel-cron" : "manual",
    sources: {
      googleAds: ads,
      searchConsole: gsc,
      competitorSoV: sov,
      aiOverviews: ai,
    },
  });
}

export const POST = GET;

// Google Search Console REST client — edge-runtime compatible.
//
// Reuses the OAuth refresh-token flow. GSC requires a separate
// refresh token (different OAuth consent screen scope) — set GSC_REFRESH_TOKEN.
// If the operator's Ads OAuth client already includes the GSC scope they
// can paste the same token into both env vars.

import { checkSource, requireEnv } from "./env";
import { getAccessToken } from "./google-oauth";
import { withCache } from "./kv-cache";

const GSC_BASE = "https://searchconsole.googleapis.com/webmasters/v3";

export interface GscQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number;
}

export interface GscTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscSnapshot {
  siteUrl: string;
  /** Top queries over last 30 days, sorted by clicks desc. */
  topQueries: GscQueryRow[];
  /** Last 7 days totals (matches the Paid 7d window for Organic-vs-Paid card). */
  last7d: GscTotals;
  /** Last 30 days totals (for headline). */
  last30d: GscTotals;
}

interface GscApiResponse {
  rows?: Array<{
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function searchanalyticsQuery(opts: {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
}): Promise<GscApiResponse> {
  const clientId =
    process.env.GSC_CLIENT_ID || requireEnv("GOOGLE_ADS_CLIENT_ID");
  const clientSecret =
    process.env.GSC_CLIENT_SECRET || requireEnv("GOOGLE_ADS_CLIENT_SECRET");
  const refreshToken = requireEnv("GSC_REFRESH_TOKEN");

  const accessToken = await getAccessToken({
    clientId,
    clientSecret,
    refreshToken,
    cacheKey: "gsc",
  });

  const url = `${GSC_BASE}/sites/${encodeURIComponent(opts.siteUrl)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      startDate: opts.startDate,
      endDate: opts.endDate,
      dimensions: opts.dimensions ?? [],
      rowLimit: opts.rowLimit ?? 25,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GSC searchanalytics failed: ${res.status} ${res.statusText} ${text.slice(0, 300)}`,
    );
  }
  return (await res.json()) as GscApiResponse;
}

function aggregate(rows: GscApiResponse["rows"]): GscTotals {
  const list = rows ?? [];
  const clicks = list.reduce((a, r) => a + (r.clicks ?? 0), 0);
  const impressions = list.reduce((a, r) => a + (r.impressions ?? 0), 0);
  // Weighted-average position across rows (impressions-weighted).
  const positionNum = list.reduce(
    (a, r) => a + (r.position ?? 0) * (r.impressions ?? 0),
    0,
  );
  const position = impressions ? positionNum / impressions : 0;
  const ctr = impressions ? clicks / impressions : 0;
  return { clicks, impressions, ctr, position };
}

export async function fetchGscSnapshot(): Promise<GscSnapshot> {
  if (!checkSource("gsc").ready) {
    throw new Error("Search Console env vars are not configured.");
  }
  const siteUrl = requireEnv("GSC_SITE_URL");

  return withCache(`gsc:snapshot:${siteUrl}`, 60 * 60 * 4, async () => {
    const today = dateOffset(1); // GSC has a ~1-2 day data lag
    const sevenAgo = dateOffset(8);
    const thirtyAgo = dateOffset(31);

    const [queries30d, totals7d, totals30d] = await Promise.all([
      searchanalyticsQuery({
        siteUrl,
        startDate: thirtyAgo,
        endDate: today,
        dimensions: ["query"],
        rowLimit: 25,
      }),
      searchanalyticsQuery({
        siteUrl,
        startDate: sevenAgo,
        endDate: today,
        dimensions: [],
        rowLimit: 1,
      }),
      searchanalyticsQuery({
        siteUrl,
        startDate: thirtyAgo,
        endDate: today,
        dimensions: [],
        rowLimit: 1,
      }),
    ]);

    const topQueries: GscQueryRow[] = (queries30d.rows ?? [])
      .map((r) => ({
        query: r.keys?.[0] ?? "",
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      }))
      .filter((r) => r.query)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return {
      siteUrl,
      topQueries,
      last7d: aggregate(totals7d.rows),
      last30d: aggregate(totals30d.rows),
    };
  });
}

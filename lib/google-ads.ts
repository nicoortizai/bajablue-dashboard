// Google Ads REST client — edge-runtime compatible.
//
// We talk to the Google Ads API v18 REST endpoint directly using
// the OAuth access token + developer token. No googleapis SDK needed
// (it's a Node-only behemoth and we want this to run on the edge).
//
// Public surface:
//   fetchAdsSnapshot()  — returns the Ads slice of the dashboard snapshot.
//                         Throws if env is missing — caller should check
//                         checkSource("ads") first.

import { checkSource, requireEnv } from "./env";
import { getAccessToken } from "./google-oauth";
import { withCache } from "./kv-cache";
import type {
  AdGroupStats,
  Campaign,
  CampaignStatus,
  ConversionAction,
  DailyPoint,
  DayLeads,
  ThirtyDayBlock,
} from "@/types/dashboard";

const ADS_API_VERSION = "v18";

interface GaqlRow {
  campaign?: {
    id?: string;
    name?: string;
    status?: string;
    biddingStrategyType?: string;
    advertisingChannelType?: string;
  };
  campaignBudget?: {
    amountMicros?: string;
  };
  adGroup?: { id?: string; name?: string };
  metrics?: {
    costMicros?: string;
    clicks?: string;
    impressions?: string;
    conversions?: number;
  };
  segments?: {
    date?: string;
    conversionActionName?: string;
  };
}

interface GaqlResponse {
  results?: GaqlRow[];
  fieldMask?: string;
  error?: { message?: string };
}

async function gaql(query: string): Promise<GaqlRow[]> {
  // Build auth on every call — getAccessToken is cached.
  const accessToken = await getAccessToken({
    clientId: requireEnv("GOOGLE_ADS_CLIENT_ID"),
    clientSecret: requireEnv("GOOGLE_ADS_CLIENT_SECRET"),
    refreshToken: requireEnv("GOOGLE_ADS_REFRESH_TOKEN"),
    cacheKey: "ads",
  });
  const customerId = requireEnv("GOOGLE_ADS_CUSTOMER_ID").replace(/-/g, "");
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(
    /-/g,
    "",
  );

  const url = `https://googleads.googleapis.com/${ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": requireEnv("GOOGLE_ADS_DEVELOPER_TOKEN"),
    "content-type": "application/json",
  };
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Google Ads GAQL failed: ${res.status} ${res.statusText} ${text.slice(0, 500)}`,
    );
  }
  // searchStream returns a JSON array of pages.
  const pages = (await res.json()) as GaqlResponse[] | GaqlResponse;
  const arr = Array.isArray(pages) ? pages : [pages];
  const rows: GaqlRow[] = [];
  for (const page of arr) {
    if (page?.results) rows.push(...page.results);
  }
  return rows;
}

function micros(s: string | undefined): number {
  if (!s) return 0;
  return Number(s) / 1_000_000;
}

function num(s: string | undefined): number {
  if (!s) return 0;
  return Number(s);
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function mapStatus(s: string | undefined): CampaignStatus {
  if (s === "ENABLED" || s === "PAUSED" || s === "REMOVED") return s;
  return "PAUSED";
}

export interface AdsSnapshot {
  campaigns: Campaign[];
  leads: { today: DayLeads; yesterday: DayLeads };
  thirtyDay: ThirtyDayBlock;
  byAdGroup7d: AdGroupStats[];
  conversionActions: ConversionAction[];
}

export async function fetchAdsSnapshot(): Promise<AdsSnapshot> {
  if (!checkSource("ads").ready) {
    throw new Error("Google Ads env vars are not configured.");
  }

  return withCache("ads:snapshot", 60 * 60 * 4, async () => {
    const today = todayUTC();
    const yesterday = dateOffset(1);
    const thirtyDaysAgo = dateOffset(30);
    const sevenDaysAgo = dateOffset(7);

    // Fan-out — Google Ads supports multiple concurrent GAQL calls per token.
    const [
      campaignMeta,
      campaign30dDaily,
      campaignToday,
      campaignYesterday,
      adGroup7d,
      conversions30d,
    ] = await Promise.all([
      gaql(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.bidding_strategy_type,
          campaign.advertising_channel_type,
          campaign_budget.amount_micros
        FROM campaign
        WHERE campaign.status != 'REMOVED'
      `),
      gaql(`
        SELECT
          campaign.id,
          segments.date,
          metrics.cost_micros,
          metrics.clicks,
          metrics.impressions,
          metrics.conversions
        FROM campaign
        WHERE segments.date BETWEEN '${thirtyDaysAgo}' AND '${today}'
      `),
      gaql(`
        SELECT
          campaign.id,
          metrics.cost_micros,
          metrics.clicks,
          metrics.impressions,
          metrics.conversions
        FROM campaign
        WHERE segments.date = '${today}'
      `),
      gaql(`
        SELECT
          campaign.id,
          metrics.cost_micros,
          metrics.clicks,
          metrics.impressions,
          metrics.conversions
        FROM campaign
        WHERE segments.date = '${yesterday}'
      `),
      gaql(`
        SELECT
          ad_group.id,
          ad_group.name,
          campaign.id,
          metrics.cost_micros,
          metrics.clicks,
          metrics.impressions,
          metrics.conversions
        FROM ad_group
        WHERE segments.date BETWEEN '${sevenDaysAgo}' AND '${today}'
          AND ad_group.status != 'REMOVED'
      `),
      gaql(`
        SELECT
          segments.conversion_action_name,
          metrics.conversions
        FROM customer
        WHERE segments.date BETWEEN '${thirtyDaysAgo}' AND '${today}'
      `),
    ]);

    // ---------- campaigns ----------
    const campaigns: Campaign[] = campaignMeta.map((row) => ({
      id: row.campaign?.id ?? "",
      name: row.campaign?.name ?? "Unnamed",
      status: mapStatus(row.campaign?.status),
      channel: row.campaign?.advertisingChannelType ?? "SEARCH",
      biddingStrategy: row.campaign?.biddingStrategyType ?? "MANUAL_CPC",
      targetCpa: 0,
      dailyBudget: micros(row.campaignBudget?.amountMicros),
      monthlyBudgetTarget: micros(row.campaignBudget?.amountMicros) * 30,
      launchedAt: new Date().toISOString(),
      adGroups: [],
    }));

    // ---------- 30d daily series (totals across all campaigns) ----------
    const byDate = new Map<string, DailyPoint>();
    for (const row of campaign30dDaily) {
      const date = row.segments?.date;
      if (!date) continue;
      const prev = byDate.get(date) ?? {
        date,
        spend: 0,
        clicks: 0,
        impressions: 0,
        conv: 0,
      };
      prev.spend += micros(row.metrics?.costMicros);
      prev.clicks += num(row.metrics?.clicks);
      prev.impressions += num(row.metrics?.impressions);
      prev.conv += row.metrics?.conversions ?? 0;
      byDate.set(date, prev);
    }
    const dailySeries: DailyPoint[] = Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const thirtyDay: ThirtyDayBlock = {
      totalSpend: dailySeries.reduce((a, p) => a + p.spend, 0),
      totalClicks: dailySeries.reduce((a, p) => a + p.clicks, 0),
      totalImpressions: dailySeries.reduce((a, p) => a + p.impressions, 0),
      totalConversions: dailySeries.reduce((a, p) => a + p.conv, 0),
      dailySeries,
    };

    // ---------- leads today / yesterday ----------
    const todayTotals = aggregateLeads(campaignToday);
    const yesterdayTotals = aggregateLeads(campaignYesterday);
    const hour = new Date().getUTCHours();

    // ---------- 7d ad groups ----------
    const adGroupMap = new Map<string, AdGroupStats>();
    for (const row of adGroup7d) {
      const id = row.adGroup?.id;
      if (!id) continue;
      const prev = adGroupMap.get(id) ?? {
        id,
        name: row.adGroup?.name ?? "Unnamed",
        clicks: 0,
        impressions: 0,
        conv: 0,
        cost: 0,
      };
      prev.clicks += num(row.metrics?.clicks);
      prev.impressions += num(row.metrics?.impressions);
      prev.conv += row.metrics?.conversions ?? 0;
      prev.cost += micros(row.metrics?.costMicros);
      adGroupMap.set(id, prev);
    }
    const byAdGroup7d = Array.from(adGroupMap.values())
      .sort((a, b) => b.cost - a.cost || b.impressions - a.impressions)
      .slice(0, 10);

    // ---------- conversion actions ----------
    const convMap = new Map<string, number>();
    for (const row of conversions30d) {
      const name = row.segments?.conversionActionName;
      if (!name) continue;
      convMap.set(name, (convMap.get(name) ?? 0) + (row.metrics?.conversions ?? 0));
    }
    const conversionActions: ConversionAction[] = Array.from(convMap.entries())
      .map(([name, count]) => ({
        name,
        type: "UNKNOWN",
        primary: false,
        count,
      }))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

    return {
      campaigns,
      leads: {
        today: { ...todayTotals, asOfHour: hour },
        yesterday: yesterdayTotals,
      },
      thirtyDay,
      byAdGroup7d,
      conversionActions,
    };
  });
}

function aggregateLeads(rows: GaqlRow[]): DayLeads {
  let spend = 0,
    clicks = 0,
    impressions = 0,
    conv = 0;
  for (const r of rows) {
    spend += micros(r.metrics?.costMicros);
    clicks += num(r.metrics?.clicks);
    impressions += num(r.metrics?.impressions);
    conv += r.metrics?.conversions ?? 0;
  }
  return {
    inquiries: Math.round(conv),
    bookings: 0,
    spend,
    clicks,
    impressions,
  };
}

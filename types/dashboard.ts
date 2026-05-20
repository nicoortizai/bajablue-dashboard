// Type definitions matching seed-snapshot.json shape.
// Keep these aligned with /seed-snapshot.json and any future
// Google Ads API → snapshot transformation.

export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED";

export interface AdGroup {
  id: string;
  name: string;
}

export interface AdGroupStats {
  id: string;
  name: string;
  clicks: number;
  impressions: number;
  conv: number;
  cost: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: string;
  biddingStrategy: string;
  targetCpa: number;
  dailyBudget: number;
  monthlyBudgetTarget: number;
  launchedAt: string; // ISO timestamp
  adGroups: AdGroup[];
}

export interface DayLeads {
  inquiries: number;
  bookings: number;
  asOfHour?: number;
  spend?: number;
  clicks?: number;
  impressions?: number;
}

export interface ProjectedTomorrow {
  method: string;
  expectedRange: { low: number; high: number };
  note: string;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  spend: number;
  clicks: number;
  impressions: number;
  conv: number;
}

export interface ThirtyDayBlock {
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  dailySeries: DailyPoint[];
}

export interface ConversionAction {
  name: string;
  type: string;
  primary: boolean;
  tag?: string;
  count?: number;
}

export interface NegKeywordList {
  name: string;
  count: number;
  linked: boolean;
}

// ---------- Organic / SEO ----------

export interface OrganicQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number;
}

export interface OrganicTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface OrganicBlock {
  siteUrl: string;
  topQueries: OrganicQuery[];
  last7d: OrganicTotals;
  last30d: OrganicTotals;
}

// ---------- Competitor Share-of-Voice ----------

export interface CompetitorSoVRow {
  domain: string;
  score: number;
  appearances: number;
  topRank: number;
}

export interface CompetitorBlock {
  yourDomain: string;
  keywords: string[];
  rows: CompetitorSoVRow[];
  totals: { keywordCount: number; yourScore: number; topScore: number };
}

// ---------- AI Overview citations ----------

export interface AiCitation {
  keyword: string;
  cited: boolean;
  sources: string[];
}

export interface AiVisibilityBlock {
  yourDomain: string;
  totalKeywords: number;
  cited: number;
  citations: AiCitation[];
}

// ---------- Section status (drives empty-state CTAs) ----------

export interface SourceState {
  ready: boolean;
  missing: string[];
  label: string;
  /** Set when an attempted live pull failed at runtime. */
  error?: string;
}

export interface SourcesBlock {
  ads: SourceState;
  gsc: SourceState;
  dataforseo: SourceState;
}

export interface Snapshot {
  meta: {
    pulledAt: string;
    today: string;
    yesterday: string;
    accountId: string;
    accountName: string;
    note?: string;
    /** True when at least one campaign value came from the live Ads API. */
    liveAds?: boolean;
  };
  campaigns: Campaign[];
  leads: {
    today: DayLeads;
    yesterday: DayLeads;
    projectedTomorrow: ProjectedTomorrow;
  };
  thirtyDay: ThirtyDayBlock;
  byAdGroup7d: AdGroupStats[];
  conversionActions: ConversionAction[];
  negKeywordList: NegKeywordList;
  /** Optional — present when GSC env is wired. */
  organic?: OrganicBlock;
  /** Optional — present when DataForSEO env is wired. */
  competitors?: CompetitorBlock;
  /** Optional — present when DataForSEO env is wired. */
  aiVisibility?: AiVisibilityBlock;
  /** Per-source readiness — UI uses this to render "Activate" empty-states. */
  sources: SourcesBlock;
}

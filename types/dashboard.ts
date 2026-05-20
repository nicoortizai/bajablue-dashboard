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

export interface Snapshot {
  meta: {
    pulledAt: string;
    today: string;
    yesterday: string;
    accountId: string;
    accountName: string;
    note?: string;
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
}

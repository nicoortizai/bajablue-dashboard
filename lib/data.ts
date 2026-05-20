import seedJson from "@/seed-snapshot.json";
import type {
  Snapshot,
  OrganicBlock,
  CompetitorBlock,
  AiVisibilityBlock,
  SourceState,
} from "@/types/dashboard";
import { checkSource } from "./env";
import { fetchAdsSnapshot } from "./google-ads";
import { fetchGscSnapshot } from "./gsc";
import {
  fetchCompetitorSoV,
  fetchAiOverviewVisibility,
} from "./dataforseo";

// Cast at the boundary — the seed JSON shape is hand-curated to match the
// Snapshot type. If they drift, TS will surface the mismatch the next time
// we extend the type rather than silently coerce.
const seed = seedJson as unknown as Omit<Snapshot, "sources">;

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

function sourceState(
  source: "ads" | "gsc" | "dataforseo",
  error?: string,
): SourceState {
  const s = checkSource(source);
  return { ready: s.ready, missing: s.missing, label: s.label, error };
}

/**
 * Synchronous seed loader. Used by server-rendered pages that want
 * an instant first paint with no network calls.
 */
export function loadSnapshot(): Snapshot {
  return {
    ...seed,
    sources: {
      ads: sourceState("ads"),
      gsc: sourceState("gsc"),
      dataforseo: sourceState("dataforseo"),
    },
  };
}

/**
 * Async loader — merges live data sources on top of the seed snapshot.
 * Each source is independent: if its env is unset OR a live fetch fails,
 * the seed value is kept and the failure is surfaced via `sources.<x>.error`
 * so the UI can show a precise empty-state CTA without crashing.
 */
export async function loadLiveSnapshot(): Promise<Snapshot> {
  const base = loadSnapshot();

  const yourDomain =
    process.env.GSC_SITE_URL?.replace(/^sc-domain:/, "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "") || "bajablue.mx";

  // Settle independently — one source's failure never blocks the others.
  const [adsResult, gscResult, sovResult, aiResult] = await Promise.allSettled([
    checkSource("ads").ready ? fetchAdsSnapshot() : Promise.reject("disabled"),
    checkSource("gsc").ready ? fetchGscSnapshot() : Promise.reject("disabled"),
    checkSource("dataforseo").ready
      ? fetchCompetitorSoV({ yourDomain, keywords: TRACKED_KEYWORDS })
      : Promise.reject("disabled"),
    checkSource("dataforseo").ready
      ? fetchAiOverviewVisibility({ yourDomain, keywords: TRACKED_KEYWORDS })
      : Promise.reject("disabled"),
  ]);

  const result: Snapshot = { ...base };

  // --- Ads merge ---
  if (adsResult.status === "fulfilled") {
    const live = adsResult.value;
    // Merge — keep seed campaign metadata when live API returns nothing
    // (newly provisioned accounts often have empty 30d series).
    result.campaigns = live.campaigns.length ? live.campaigns : base.campaigns;
    result.thirtyDay = live.thirtyDay;
    result.byAdGroup7d = live.byAdGroup7d.length
      ? live.byAdGroup7d
      : base.byAdGroup7d;
    result.conversionActions = live.conversionActions.length
      ? live.conversionActions
      : base.conversionActions;
    result.leads = {
      ...base.leads,
      today: { ...base.leads.today, ...live.leads.today },
      yesterday: { ...base.leads.yesterday, ...live.leads.yesterday },
    };
    result.meta = { ...base.meta, liveAds: true };
  } else if (adsResult.status === "rejected" && adsResult.reason !== "disabled") {
    result.sources = {
      ...result.sources,
      ads: sourceState("ads", errorString(adsResult.reason)),
    };
  }

  // --- GSC merge ---
  if (gscResult.status === "fulfilled") {
    const g = gscResult.value;
    const organic: OrganicBlock = {
      siteUrl: g.siteUrl,
      topQueries: g.topQueries,
      last7d: g.last7d,
      last30d: g.last30d,
    };
    result.organic = organic;
  } else if (gscResult.status === "rejected" && gscResult.reason !== "disabled") {
    result.sources = {
      ...result.sources,
      gsc: sourceState("gsc", errorString(gscResult.reason)),
    };
  }

  // --- DataForSEO SoV merge ---
  if (sovResult.status === "fulfilled") {
    const competitors: CompetitorBlock = sovResult.value;
    result.competitors = competitors;
  } else if (
    sovResult.status === "rejected" &&
    sovResult.reason !== "disabled"
  ) {
    result.sources = {
      ...result.sources,
      dataforseo: sourceState("dataforseo", errorString(sovResult.reason)),
    };
  }

  // --- DataForSEO AI Overviews merge ---
  if (aiResult.status === "fulfilled") {
    const aiVisibility: AiVisibilityBlock = aiResult.value;
    result.aiVisibility = aiVisibility;
  } else if (aiResult.status === "rejected" && aiResult.reason !== "disabled") {
    // SoV error already populated dataforseo error if both failed; only
    // overwrite when SoV succeeded but AI failed.
    if (sovResult.status === "fulfilled") {
      result.sources = {
        ...result.sources,
        dataforseo: sourceState("dataforseo", errorString(aiResult.reason)),
      };
    }
  }

  return result;
}

function errorString(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export type { Snapshot } from "@/types/dashboard";

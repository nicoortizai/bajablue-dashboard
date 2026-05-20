// DataForSEO REST client — edge-runtime compatible.
//
// Two surfaces:
//   • fetchCompetitorSoV(domain, keywords) — for each keyword, fetch top 10
//     organic results, compute weighted share-of-voice per domain.
//   • fetchAiOverviewVisibility(domain, keywords) — check if `domain` is cited
//     in Google AI Overviews for each keyword. Falls back to "not detected"
//     when no overview is returned.
//
// Auth: HTTP Basic with DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD.

import { checkSource, requireEnv } from "./env";
import { withCache } from "./kv-cache";

const DFS_BASE = "https://api.dataforseo.com/v3";

function authHeader(): string {
  const login = requireEnv("DATAFORSEO_LOGIN");
  const password = requireEnv("DATAFORSEO_PASSWORD");
  const token = btoa(`${login}:${password}`);
  return `Basic ${token}`;
}

interface DfsResponse<T> {
  status_code: number;
  status_message: string;
  tasks?: Array<{
    status_code: number;
    status_message: string;
    result?: T[];
  }>;
}

interface SerpItem {
  type?: string;
  rank_group?: number;
  rank_absolute?: number;
  domain?: string;
  url?: string;
  title?: string;
}

interface SerpResult {
  keyword?: string;
  items?: SerpItem[];
}

interface AiOverviewItem {
  type?: string;
  references?: Array<{
    domain?: string;
    url?: string;
    title?: string;
  }>;
}

interface AiOverviewResult {
  keyword?: string;
  items?: AiOverviewItem[];
}

// ---------- Competitor share-of-voice ----------

export interface SoVRow {
  domain: string;
  score: number; // weighted by position
  appearances: number;
  topRank: number;
}

export interface CompetitorSoVSnapshot {
  yourDomain: string;
  keywords: string[];
  rows: SoVRow[]; // sorted desc by score; you + top 5 competitors
  totals: { keywordCount: number; yourScore: number; topScore: number };
}

function positionWeight(rank: number): number {
  // CTR-curve-ish weighting: pos 1 = 1, pos 2 = 0.5, decaying.
  // Mirrors how Moz/Ahrefs compute SoV.
  if (rank <= 0) return 0;
  if (rank === 1) return 1.0;
  if (rank === 2) return 0.55;
  if (rank === 3) return 0.4;
  if (rank === 4) return 0.28;
  if (rank === 5) return 0.2;
  if (rank <= 10) return 0.12;
  if (rank <= 20) return 0.04;
  return 0.01;
}

function normalizeDomain(input: string): string {
  return input
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export async function fetchCompetitorSoV(opts: {
  yourDomain: string;
  keywords: string[];
  locationCode?: number; // 2840 = US
  languageCode?: string; // "en"
}): Promise<CompetitorSoVSnapshot> {
  if (!checkSource("dataforseo").ready) {
    throw new Error("DataForSEO env vars are not configured.");
  }
  const yourDomain = normalizeDomain(opts.yourDomain);
  const keywords = opts.keywords.slice(0, 20); // cap to keep cost predictable

  const cacheKey = `dfs:sov:${yourDomain}:${keywords.join("|")}`;
  return withCache(cacheKey, 60 * 60 * 4, async () => {
    const tasks = keywords.map((kw) => ({
      keyword: kw,
      language_code: opts.languageCode ?? "en",
      location_code: opts.locationCode ?? 2840,
      depth: 20,
      device: "desktop",
    }));

    const res = await fetch(
      `${DFS_BASE}/serp/google/organic/live/advanced`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          "content-type": "application/json",
        },
        body: JSON.stringify(tasks),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `DataForSEO SoV failed: ${res.status} ${res.statusText} ${text.slice(0, 300)}`,
      );
    }
    const json = (await res.json()) as DfsResponse<SerpResult>;

    const scoreByDomain = new Map<
      string,
      { score: number; appearances: number; topRank: number }
    >();

    for (const task of json.tasks ?? []) {
      for (const result of task.result ?? []) {
        const items = result.items ?? [];
        for (const item of items) {
          if (item.type !== "organic") continue;
          const d = item.domain ? normalizeDomain(item.domain) : "";
          const rank = item.rank_group ?? 0;
          if (!d || !rank) continue;
          const prev = scoreByDomain.get(d) ?? {
            score: 0,
            appearances: 0,
            topRank: 100,
          };
          prev.score += positionWeight(rank);
          prev.appearances += 1;
          prev.topRank = Math.min(prev.topRank, rank);
          scoreByDomain.set(d, prev);
        }
      }
    }

    const allRows: SoVRow[] = Array.from(scoreByDomain.entries()).map(
      ([domain, v]) => ({
        domain,
        score: Math.round(v.score * 100) / 100,
        appearances: v.appearances,
        topRank: v.topRank,
      }),
    );
    allRows.sort((a, b) => b.score - a.score);

    // Always include yourDomain in the visible rows. Take top 5 + you (deduped).
    const top = allRows.slice(0, 5);
    const youInTop = top.some((r) => r.domain === yourDomain);
    const youRow = allRows.find((r) => r.domain === yourDomain);
    const visible = youInTop
      ? top
      : youRow
        ? [...top, youRow]
        : [
            ...top,
            { domain: yourDomain, score: 0, appearances: 0, topRank: 100 },
          ];

    return {
      yourDomain,
      keywords,
      rows: visible,
      totals: {
        keywordCount: keywords.length,
        yourScore: youRow?.score ?? 0,
        topScore: top[0]?.score ?? 0,
      },
    };
  });
}

// ---------- AI Overviews visibility ----------

export interface AiOverviewVisibility {
  yourDomain: string;
  totalKeywords: number;
  cited: number;
  citations: Array<{
    keyword: string;
    cited: boolean;
    sources: string[]; // top domains cited in the overview
  }>;
}

export async function fetchAiOverviewVisibility(opts: {
  yourDomain: string;
  keywords: string[];
  locationCode?: number;
  languageCode?: string;
}): Promise<AiOverviewVisibility> {
  if (!checkSource("dataforseo").ready) {
    throw new Error("DataForSEO env vars are not configured.");
  }
  const yourDomain = normalizeDomain(opts.yourDomain);
  const keywords = opts.keywords.slice(0, 20);

  const cacheKey = `dfs:aio:${yourDomain}:${keywords.join("|")}`;
  return withCache(cacheKey, 60 * 60 * 4, async () => {
    const tasks = keywords.map((kw) => ({
      keyword: kw,
      language_code: opts.languageCode ?? "en",
      location_code: opts.locationCode ?? 2840,
      device: "desktop",
    }));

    const res = await fetch(
      `${DFS_BASE}/serp/google/ai_overview/live/advanced`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader(),
          "content-type": "application/json",
        },
        body: JSON.stringify(tasks),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `DataForSEO AI Overview failed: ${res.status} ${res.statusText} ${text.slice(0, 300)}`,
      );
    }
    const json = (await res.json()) as DfsResponse<AiOverviewResult>;

    const citations: AiOverviewVisibility["citations"] = [];
    for (const task of json.tasks ?? []) {
      for (const result of task.result ?? []) {
        const kw = result.keyword ?? "";
        const items = result.items ?? [];
        const allRefs = items.flatMap((it) => it.references ?? []);
        const sources = Array.from(
          new Set(
            allRefs
              .map((r) => (r.domain ? normalizeDomain(r.domain) : ""))
              .filter(Boolean),
          ),
        );
        citations.push({
          keyword: kw,
          cited: sources.includes(yourDomain),
          sources: sources.slice(0, 5),
        });
      }
    }

    return {
      yourDomain,
      totalKeywords: keywords.length,
      cited: citations.filter((c) => c.cited).length,
      citations,
    };
  });
}

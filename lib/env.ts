// Central env-availability registry.
//
// Every live-data section asks one question: "do I have what I need?"
// This module gives a single yes/no per data source so the route + UI
// stay consistent and the empty-state CTAs can name the exact var to set.

export type DataSource = "ads" | "gsc" | "dataforseo" | "gmaps" | "kv";

interface SourceSpec {
  /** Env vars that must all be present for this source to function. */
  required: string[];
  /** Human label shown in empty-state cards. */
  label: string;
}

const SOURCES: Record<DataSource, SourceSpec> = {
  ads: {
    required: [
      "GOOGLE_ADS_DEVELOPER_TOKEN",
      "GOOGLE_ADS_CLIENT_ID",
      "GOOGLE_ADS_CLIENT_SECRET",
      "GOOGLE_ADS_REFRESH_TOKEN",
      "GOOGLE_ADS_CUSTOMER_ID",
    ],
    label: "Google Ads",
  },
  gsc: {
    required: ["GSC_REFRESH_TOKEN", "GSC_SITE_URL"],
    label: "Search Console",
  },
  dataforseo: {
    required: ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"],
    label: "DataForSEO",
  },
  gmaps: {
    required: ["GOOGLE_MAPS_PLACES_API_KEY"],
    label: "Google Maps",
  },
  kv: {
    required: ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
    label: "Vercel KV",
  },
};

export interface SourceStatus {
  ready: boolean;
  missing: string[];
  label: string;
}

export function checkSource(source: DataSource): SourceStatus {
  const spec = SOURCES[source];
  const missing = spec.required.filter((key) => !process.env[key]);
  return {
    ready: missing.length === 0,
    missing,
    label: spec.label,
  };
}

export function getEnv(key: string): string | undefined {
  return process.env[key];
}

export function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
}

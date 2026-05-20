import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/data";

// TODO (live wiring — tomorrow):
//   Replace the seed import with a call to the Google Ads API.
//
//   Setup steps:
//     1. npm install googleapis google-auth-library
//     2. Provision a Google Ads OAuth refresh token for the operator account
//        (Nico's MCC) and store it in env vars on Vercel:
//          GOOGLE_ADS_DEVELOPER_TOKEN
//          GOOGLE_ADS_OAUTH_CLIENT_ID
//          GOOGLE_ADS_OAUTH_CLIENT_SECRET
//          GOOGLE_ADS_OAUTH_REFRESH_TOKEN
//          GOOGLE_ADS_LOGIN_CUSTOMER_ID  (MCC id, no dashes)
//          GOOGLE_ADS_CUSTOMER_ID        (BajaBlue id "2252665731")
//     3. Use the v17 REST endpoint or the official Node client.
//     4. Run a small set of GAQL queries:
//          - campaign-level: spend, clicks, impressions, conversions LAST_30_DAYS
//          - campaign-level: same metrics for "today" and "yesterday"
//          - ad_group_view: 7d slice per ad group
//          - conversion_action: name + type
//        Map results into the Snapshot shape in @/types/dashboard.ts.
//     5. Cache for 15 min via `revalidate` below to stay under quota.
//     6. Wire a refresh button in the UI to bust this cache (POST /api/refresh).
//
//   For now we return the seed snapshot so the UI is fully renderable.

export const runtime = "edge";
export const revalidate = 60; // seconds

export async function GET() {
  const snapshot = loadSnapshot();
  // Surface a generated-at timestamp the UI uses for "Updated Xm ago".
  return NextResponse.json(
    { ...snapshot, generatedAt: new Date().toISOString() },
    {
      headers: {
        "cache-control": "public, max-age=30, s-maxage=60",
      },
    },
  );
}

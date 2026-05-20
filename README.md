# Bajablue Performance

Single-tenant Google Ads dashboard for Bajablue. One page, three numbers, ocean-deep brand palette. Every section names its data source and shows when the data was actually pulled — no fabricated numbers anywhere.

## What it shows

- **Headline metrics** — yesterday's bookings, today's live bookings, and tomorrow's projection (empty-state until 7 days of conversion history accrue).
- **Month-to-date spend** with on-pace marker and projected end-of-month spend.
- **Campaigns** — per-campaign 7d spend / clicks / conversions / CPA with sparkline.
- **Ad groups** — share-of-spend bars across all ad groups in the last 7 days.
- **Conversion mix** — donut across configured Google Ads conversion actions.
- **30-day trend** — daily spend + daily conversions area charts.
- **Search & AI visibility** — organic vs paid, top organic queries, competitor share-of-voice, AI Overviews citations. Each lights up once its API key is added.

Every section card carries a `Source: ... · Refreshed Nm ago` footer so the operator can tell at a glance which API is live and how fresh it is.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS 4 with the Bajablue palette as CSS variables
- Fraunces (display) + Inter (body) — the Bajablue typography pairing
- Framer Motion (count-ups, fade-up, progress bars)
- Recharts (sparklines, area charts, donut)
- Edge route handlers, cookie-based password gate

## Develop

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The dev password fallback is `bajablue` (override with `ADMIN_PASSWORD`).

## Build

```bash
npm run build
```

## Deploy

Vercel project: `bajablue-dashboard`. Deploys are manual via the Vercel CLI from a clean worktree:

```bash
vercel --prod --yes
```

Production URL: <https://bajablue-dashboard.vercel.app>

## Data flow

1. `seed-snapshot.json` is the canonical input shape (also TS-typed in `types/dashboard.ts`).
2. `/api/snapshot` returns that shape, merging any live API pulls on top of the seed.
3. The seed file is rewritten hourly by an external cron that pulls fresh Google Ads data via the NotFair MCP. As long as the JSON conforms to `types/dashboard.ts`, the dashboard reads it cleanly.

Optional live integrations (each section degrades to an "Activate" empty-state when its env vars are unset):

- **Google Ads OAuth** — `GOOGLE_ADS_*` env vars in `lib/google-ads.ts`
- **Google Search Console** — `GSC_REFRESH_TOKEN`, `GSC_SITE_URL` in `lib/gsc.ts`
- **DataForSEO** — `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` in `lib/dataforseo.ts`

## Honest data, always

- Tomorrow's projection refuses to fabricate a number. With <7 days of conversion history the card renders `Insufficient data` and tells you how many more days are needed.
- The "Refreshed Nm ago" badge reflects `meta.pulledAt` in the snapshot — never wall-clock at render time.
- The "Source" badge accurately names the actual data source (`Google Ads`, `Google Search Console`, `DataForSEO …`, or `not yet connected`).

## Layout

- `app/` — routes (page, login, logout, api)
- `components/` — UI primitives + dashboard sections
- `lib/` — data loader, projections, formatters, auth helpers
- `types/` — Snapshot shape
- `proxy.ts` — Next.js proxy (formerly middleware) for the auth gate
- `public/favicon.svg` — Bajablue swimmer mark. **TODO:** add `public/og-image.png` for richer social previews.

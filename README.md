# BajaSwarm Ad Dashboard

Apple-style, single-page ad analytics dashboard built for the operator. Replaces the daily Google Ads UI check with three numbers, a spend gauge, campaign cards, ad-group bars, 30-day trends, and a conversion mix donut — at every viewport from 375px up.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind CSS 4
- Framer Motion (count-ups, fade-up, progress bars)
- Recharts (sparklines, area charts, donut)
- Lucide icons
- Inter (body) + system SF Pro Display fallback for headlines
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

The dashboard runs on Vercel. The Vercel CLI does the work:

```bash
vercel --prod --yes
```

Cron is declared in `vercel.json` — `/api/refresh` runs daily at 06:00 UTC. Today it's a stub; tomorrow it will pull a fresh snapshot from the Google Ads API and persist it for `/api/snapshot` to serve.

## Data flow

1. `seed-snapshot.json` is the canonical input shape (also TS-typed in `types/dashboard.ts`).
2. `/api/snapshot` returns that shape (currently from the seed file).
3. `/api/refresh` is hit by Vercel cron. Tomorrow it pulls from the Google Ads API and writes to durable storage (Vercel KV or Edge Config) keyed by account.

See the TODO block in `app/api/snapshot/route.ts` for the Google Ads wiring plan.

## Layout

- `app/` — routes (page, login, logout, api)
- `components/` — UI primitives + dashboard sections
- `lib/` — data loader, projections, formatters, auth helpers
- `types/` — Snapshot shape
- `proxy.ts` — Next.js proxy (formerly middleware) for the auth gate

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { ActivateEmpty } from "./ActivateEmpty";
import { SourceBadge } from "./SourceBadge";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type {
  OrganicBlock,
  DayLeads,
  SourceState,
  ThirtyDayBlock,
  DailyPoint,
} from "@/types/dashboard";

interface OrganicVsPaidProps {
  organic?: OrganicBlock;
  /** Yesterday's paid (last full day) — use this for the paid 7d aggregate. */
  thirtyDay: ThirtyDayBlock;
  /** Source readiness for empty-state. */
  gscSource: SourceState;
  adsSource: SourceState;
  /** ISO snapshot timestamp for the source badge. */
  pulledAt: string;
}

function sumLast7d(series: DailyPoint[]): {
  spend: number;
  clicks: number;
  impressions: number;
  conv: number;
} {
  const tail = series.slice(-7);
  return tail.reduce(
    (a, p) => ({
      spend: a.spend + p.spend,
      clicks: a.clicks + p.clicks,
      impressions: a.impressions + p.impressions,
      conv: a.conv + p.conv,
    }),
    { spend: 0, clicks: 0, impressions: 0, conv: 0 },
  );
}

export function OrganicVsPaid({
  organic,
  thirtyDay,
  gscSource,
  adsSource,
  pulledAt,
}: OrganicVsPaidProps) {
  // If GSC isn't wired, this whole section is an empty-state CTA.
  if (!organic) {
    return (
      <ActivateEmpty
        title="Organic vs Paid"
        source="Search Console"
        missing={
          gscSource.missing.length
            ? gscSource.missing
            : ["GSC_REFRESH_TOKEN", "GSC_SITE_URL"]
        }
        pitch="Side-by-side weekly view: organic clicks from Google Search vs paid clicks from Ads. Lights up the moment Search Console is connected."
        error={gscSource.error}
      />
    );
  }

  const paid7d = sumLast7d(thirtyDay.dailySeries);

  // Ratio bar — organic vs paid share of total clicks.
  const totalClicks = organic.last7d.clicks + paid7d.clicks;
  const organicPct = totalClicks ? (organic.last7d.clicks / totalClicks) * 100 : 50;
  const paidPct = totalClicks ? (paid7d.clicks / totalClicks) * 100 : 50;
  const allZero = totalClicks === 0;

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Organic vs Paid
        </h2>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          Last 7 days
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat
          label="Organic — Search Console"
          accent="#36859A"
          rows={[
            { k: "Clicks", v: formatNumber(organic.last7d.clicks) },
            { k: "Impressions", v: formatNumber(organic.last7d.impressions) },
            { k: "Avg position", v: organic.last7d.position.toFixed(1) },
            { k: "CTR", v: formatPercent(organic.last7d.ctr) },
          ]}
        />
        <Stat
          label="Paid — Google Ads"
          accent="#0A84FF"
          rows={[
            { k: "Clicks", v: formatNumber(paid7d.clicks) },
            { k: "Impressions", v: formatNumber(paid7d.impressions) },
            { k: "Conversions", v: paid7d.conv.toFixed(1) },
            { k: "Cost", v: formatCurrency(paid7d.spend) },
          ]}
          warning={!adsSource.ready ? "Live Ads not wired — showing seed" : undefined}
        />
      </div>

      <div className="mt-7">
        <div className="flex items-baseline justify-between text-xs text-[color:var(--fg-mute)]">
          <span>Share of clicks</span>
          <span className="tabular">
            {allZero
              ? "—"
              : `${organicPct.toFixed(0)}% organic · ${paidPct.toFixed(0)}% paid`}
          </span>
        </div>
        <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${allZero ? 50 : organicPct}%` }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="h-full"
            style={{
              background: "linear-gradient(90deg, #2f6f80 0%, #36859A 100%)",
              opacity: allZero ? 0.35 : 1,
            }}
          />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${allZero ? 50 : paidPct}%` }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="h-full"
            style={{
              background: "linear-gradient(90deg, #0A84FF 0%, #64D2FF 100%)",
              opacity: allZero ? 0.35 : 1,
            }}
          />
        </div>
      </div>

      {allZero ? (
        <p className="mt-5 text-xs text-[color:var(--fg-faint)]">
          Bar shape previews how organic and paid will split once traffic accrues.
        </p>
      ) : null}

      <div className="mt-6 border-t border-[color:var(--border)] pt-3">
        <SourceBadge source="Search Console + Google Ads" pulledAt={pulledAt} />
      </div>
    </FrostedCard>
  );
}

function Stat({
  label,
  accent,
  rows,
  warning,
}: {
  label: string;
  accent: string;
  rows: Array<{ k: string; v: string | DayLeads }>;
  warning?: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-soft)] px-4 py-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-mute)]">
          {label}
        </p>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {rows.map((r) => (
          <div key={r.k}>
            <dt className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
              {r.k}
            </dt>
            <dd className="mt-0.5 text-sm font-medium tabular text-[color:var(--fg)]">
              {String(r.v)}
            </dd>
          </div>
        ))}
      </dl>
      {warning ? (
        <p className="mt-3 text-[10px] text-[color:var(--accent-warm)]">{warning}</p>
      ) : null}
    </div>
  );
}

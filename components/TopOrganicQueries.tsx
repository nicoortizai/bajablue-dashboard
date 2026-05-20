"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { ActivateEmpty } from "./ActivateEmpty";
import { SourceBadge } from "./SourceBadge";
import { formatNumber, formatPercent } from "@/lib/format";
import type { OrganicBlock, SourceState } from "@/types/dashboard";

interface TopOrganicQueriesProps {
  organic?: OrganicBlock;
  gscSource: SourceState;
  /** ISO snapshot timestamp for the source badge. */
  pulledAt: string;
}

export function TopOrganicQueries({
  organic,
  gscSource,
  pulledAt,
}: TopOrganicQueriesProps) {
  if (!organic) {
    return (
      <ActivateEmpty
        title="Top organic queries"
        source="Search Console"
        missing={
          gscSource.missing.length
            ? gscSource.missing
            : ["GSC_REFRESH_TOKEN", "GSC_SITE_URL"]
        }
        pitch="The 10 queries sending the most non-paid traffic to your site, with position, impressions, and CTR. Updates daily once Search Console is connected."
        error={gscSource.error}
      />
    );
  }

  const rows = organic.topQueries;
  const maxClicks = Math.max(1, ...rows.map((r) => r.clicks));

  if (rows.length === 0) {
    return (
      <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
        <Header />
        <p className="mt-6 text-sm text-[color:var(--fg-mute)]">
          Search Console returned no query rows for the last 30 days. New sites
          typically need 7–14 days of impressions before queries show up here.
        </p>
        <div className="mt-6 border-t border-[color:var(--border)] pt-3">
          <SourceBadge source="Google Search Console" pulledAt={pulledAt} />
        </div>
      </FrostedCard>
    );
  }

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <Header siteUrl={organic.siteUrl} />

      <div className="mt-6 -mx-2 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
              <th className="px-2 py-1.5 text-left font-medium">Query</th>
              <th className="px-2 py-1.5 text-right font-medium">Pos</th>
              <th className="px-2 py-1.5 text-right font-medium">Impressions</th>
              <th className="px-2 py-1.5 text-right font-medium">Clicks</th>
              <th className="px-2 py-1.5 text-right font-medium">CTR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const sharePct = (r.clicks / maxClicks) * 100;
              return (
                <tr
                  key={r.query}
                  className="group transition-colors hover:bg-[color:var(--bg-soft)]"
                >
                  <td className="relative max-w-[200px] truncate rounded-l-xl px-2 py-2.5 align-middle text-sm text-[color:var(--fg)]">
                    <span className="relative z-10">{r.query}</span>
                    {/* Subtle inline sparkline-style bar */}
                    <motion.span
                      aria-hidden
                      initial={{ width: 0 }}
                      whileInView={{ width: `${sharePct}%` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.9,
                        delay: 0.04 * i,
                        ease: [0.2, 0.7, 0.2, 1],
                      }}
                      className="pointer-events-none absolute inset-y-1 left-1 -z-0 rounded-md opacity-25"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(54,133,154,0.4), rgba(10,132,255,0.25))",
                      }}
                    />
                  </td>
                  <td className="px-2 py-2.5 text-right text-sm tabular text-[color:var(--fg-soft)]">
                    {r.position.toFixed(1)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-sm tabular text-[color:var(--fg-soft)]">
                    {formatNumber(r.impressions)}
                  </td>
                  <td className="px-2 py-2.5 text-right text-sm font-medium tabular text-[color:var(--fg)]">
                    {formatNumber(r.clicks)}
                  </td>
                  <td className="rounded-r-xl px-2 py-2.5 text-right text-sm tabular text-[color:var(--fg-soft)]">
                    {formatPercent(r.ctr)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border-t border-[color:var(--border)] pt-3">
        <SourceBadge source="Google Search Console" pulledAt={pulledAt} />
      </div>
    </FrostedCard>
  );
}

function Header({ siteUrl }: { siteUrl?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Top organic queries
      </h2>
      <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
        {siteUrl ? `${siteUrl.replace(/^sc-domain:/, "")} · 30d` : "30d"}
      </p>
    </div>
  );
}

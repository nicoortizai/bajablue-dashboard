"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AdGroupStats } from "@/types/dashboard";

interface AdGroupBarChartProps {
  rows: AdGroupStats[];
  /** When all costs are zero, render a placeholder ranking by impressions. */
  metric?: "auto" | "cost" | "impressions";
  /** ISO timestamp of the snapshot pull — used in the source badge footer. */
  pulledAt: string;
}

const TIER_COLORS = [
  "linear-gradient(90deg, #36859A 0%, #0A84FF 100%)",
  "linear-gradient(90deg, #2f6f80 0%, #1773d9 100%)",
  "linear-gradient(90deg, #295c6a 0%, #145eb3 100%)",
  "linear-gradient(90deg, #234f5a 0%, #11498c 100%)",
  "linear-gradient(90deg, #1e434c 0%, #0e3a6e 100%)",
];

export function AdGroupBarChart({
  rows,
  metric = "auto",
  pulledAt,
}: AdGroupBarChartProps) {
  const useCost =
    metric === "cost" ||
    (metric === "auto" && rows.some((r) => r.cost > 0));

  const items = rows.map((r) => ({
    id: r.id,
    name: cleanName(r.name),
    value: useCost ? r.cost : r.impressions,
    secondary: useCost
      ? `${formatNumber(r.clicks)} clicks · ${formatNumber(r.conv)} conv`
      : `${formatNumber(r.clicks)} clicks · ${formatCurrency(r.cost)}`,
  }));

  const max = Math.max(1, ...items.map((i) => i.value));
  const totalZero = items.every((i) => i.value === 0);

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Ad groups
        </h2>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          {useCost ? "By spend · last 7d" : "By impressions · last 7d"}
        </p>
      </div>

      <ul className="mt-6 space-y-4">
        {items.map((row, i) => {
          const pct = totalZero ? 0 : (row.value / max) * 100;
          return (
            <li key={row.id}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium text-[color:var(--fg)]">
                  {row.name}
                </p>
                <p className="shrink-0 text-sm tabular text-[color:var(--fg-soft)]">
                  {useCost ? formatCurrency(row.value) : formatNumber(row.value)}
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.max(pct, totalZero ? 4 : 0)}%` }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 1.1,
                    delay: 0.05 * i,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: TIER_COLORS[i % TIER_COLORS.length],
                    opacity: totalZero ? 0.35 : 1,
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
                {row.secondary}
              </p>
            </li>
          );
        })}
      </ul>

      {totalZero ? (
        <p className="mt-6 text-xs text-[color:var(--fg-faint)]">
          No spend yet — bars show placeholder pace. Real distribution will fill in as
          the auction warms up.
        </p>
      ) : null}

      <div className="mt-6 border-t border-[color:var(--border)] pt-3">
        <SourceBadge source="Google Ads" pulledAt={pulledAt} />
      </div>
    </FrostedCard>
  );
}

function cleanName(raw: string): string {
  // "AG1 - ORCA" → "ORCA". Keep AG prefix as a small superscript-style chip elsewhere
  // if we ever want to surface it.
  const m = raw.match(/^AG\d+\s*[-–]\s*(.+)$/);
  return m?.[1] ?? raw;
}

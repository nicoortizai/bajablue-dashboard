"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { Money } from "./Money";
import { formatNumber } from "@/lib/format";
import type { SearchTermStats, Snapshot } from "@/types/dashboard";

interface SearchTermsLogProps {
  terms?: SearchTermStats[];
  meta: Snapshot["meta"];
}

export function SearchTermsLog({ terms, meta }: SearchTermsLogProps) {
  const rows = (terms ?? []).slice().sort((a, b) => b.impressions - a.impressions);
  const empty = rows.length === 0;
  const max = Math.max(1, ...rows.map((r) => r.impressions));

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            What people actually typed
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
            Search term log · last 7 days
          </p>
        </div>
        {!empty ? (
          <p className="text-[11px] tabular text-[color:var(--fg-mute)]">
            {rows.length} unique queries
          </p>
        ) : null}
      </div>

      {empty ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--bg-soft)] px-5 py-8 text-center">
          <p className="font-display text-base font-semibold tracking-tight">
            No search terms reported yet
          </p>
          <p className="mt-2 text-xs text-[color:var(--fg-mute)]">
            Google releases search-term data on a ~24h delay after first
            impressions. The 103 impressions from today will surface here tomorrow.
          </p>
          {/* Skeleton rows so the user sees the shape */}
          <div className="mt-6 space-y-2">
            {[64, 48, 40, 32, 24].map((w) => (
              <div
                key={w}
                className="mx-auto h-2.5 rounded-full bg-[color:var(--border)]"
                style={{ width: `${w}%`, opacity: 0.5 }}
              />
            ))}
          </div>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-[color:var(--border)]">
          {rows.map((row, i) => {
            const width = (row.impressions / max) * 100;
            return (
              <motion.li
                key={row.term}
                initial={{ opacity: 0, x: -4 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: 0.015 * i }}
                className="grid grid-cols-[1fr_auto] items-center gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[color:var(--fg)]">
                    {row.term}
                  </p>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${width}%` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.9, delay: 0.04 * i, ease: [0.2, 0.7, 0.2, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--accent-2) 0%, var(--accent) 100%)",
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] tabular text-[color:var(--fg-faint)]">
                    {formatNumber(row.impressions)} impr · {formatNumber(row.clicks)} clicks
                  </p>
                </div>
                <Money
                  amount={row.cost}
                  meta={meta}
                  layout="stack"
                  size="sm"
                  precise
                  className="items-end"
                />
              </motion.li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 flex items-center justify-end border-t border-[color:var(--border)] pt-3">
        <SourceBadge source="Google Ads · search terms" pulledAt={meta.pulledAt} />
      </div>
    </FrostedCard>
  );
}

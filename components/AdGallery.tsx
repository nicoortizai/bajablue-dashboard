"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { Money } from "./Money";
import { formatNumber } from "@/lib/format";
import type { AdStats, Snapshot } from "@/types/dashboard";

interface AdGalleryProps {
  ads?: AdStats[];
  meta: Snapshot["meta"];
}

export function AdGallery({ ads, meta }: AdGalleryProps) {
  const rows = (ads ?? []).slice().sort((a, b) => b.impressions - a.impressions);
  const totalImpr = rows.reduce((s, r) => s + r.impressions, 0);
  const totalSpend = rows.reduce((s, r) => s + r.cost, 0);

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Every ad variant we're testing
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
            {rows.length} responsive search ads · last 7 days
          </p>
        </div>
        <p className="text-[11px] tabular text-[color:var(--fg-mute)]">
          {formatNumber(totalImpr)} total impressions
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {rows.map((ad, i) => {
          const active = ad.impressions > 0;
          const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
          return (
            <motion.li
              key={ad.adId}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.04 * i, ease: [0.2, 0.7, 0.2, 1] }}
              className="frosted-soft p-4 sm:p-5"
              style={{
                opacity: active ? 1 : 0.78,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-mute)]">
                  {shortAg(ad.adGroup)}
                </span>
                {active ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--accent-2)] bg-[color:var(--accent)]/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[color:var(--accent-2)]">
                    <span className="h-1 w-1 rounded-full bg-[color:var(--accent-2)]" />
                    Serving
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-[0.14em] text-[color:var(--fg-faint)]">
                    Waiting
                  </span>
                )}
              </div>

              <ol className="mt-3 space-y-1">
                {ad.headlines.slice(0, 3).map((h, hi) => (
                  <li
                    key={hi}
                    className="text-sm font-medium leading-snug text-[color:var(--fg)]"
                  >
                    <span className="mr-1.5 inline-block w-3 text-[10px] tabular text-[color:var(--fg-faint)]">
                      {hi + 1}.
                    </span>
                    {h}
                  </li>
                ))}
              </ol>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[color:var(--border)] pt-3">
                <Stat label="Impr" value={formatNumber(ad.impressions)} />
                <Stat
                  label="CTR"
                  value={ad.impressions > 0 ? `${ctr.toFixed(2)}%` : "—"}
                />
                <Stat
                  label="Spend"
                  value={
                    ad.cost > 0 ? (
                      <Money
                        amount={ad.cost}
                        meta={meta}
                        size="xs"
                        layout="inline"
                        precise
                        hideShadow
                      />
                    ) : (
                      "—"
                    )
                  }
                />
              </div>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border)] pt-3">
        <p className="text-[11px] text-[color:var(--fg-faint)] tabular">
          <Money amount={totalSpend} meta={meta} layout="inline" size="xs" precise hideShadow />{" "}
          across {rows.length} ad variants
        </p>
        <SourceBadge source="Google Ads · ads" pulledAt={meta.pulledAt} />
      </div>
    </FrostedCard>
  );
}

function shortAg(name: string): string {
  const m = name.match(/^AG(\d+)\s*[-–]\s*(.+)$/);
  if (!m) return name;
  return `AG${m[1]} · ${m[2]}`;
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.14em] text-[color:var(--fg-faint)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm tabular font-medium text-[color:var(--fg-soft)]">
        {value}
      </p>
    </div>
  );
}

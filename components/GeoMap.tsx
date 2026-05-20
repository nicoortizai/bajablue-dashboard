"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { Money } from "./Money";
import { formatNumber } from "@/lib/format";
import type { GeoStats, Snapshot } from "@/types/dashboard";

interface GeoMapProps {
  geo?: GeoStats[];
  meta: Snapshot["meta"];
}

export function GeoMap({ geo, meta }: GeoMapProps) {
  const rows = (geo ?? [])
    .filter((r) => r.impressions > 0)
    .sort((a, b) => b.impressions - a.impressions);
  const empty = rows.length === 0;
  const totalImpr = rows.reduce((s, r) => s + r.impressions, 0);
  const totalSpend = rows.reduce((s, r) => s + r.cost, 0);
  const max = Math.max(1, ...rows.map((r) => r.impressions));

  // Group by country for the "share" strip at top
  const byCountry = new Map<string, { impr: number; spend: number; clicks: number }>();
  for (const r of rows) {
    const c = r.country || guessCountry(r.label) || "—";
    const cur = byCountry.get(c) ?? { impr: 0, spend: 0, clicks: 0 };
    cur.impr += r.impressions;
    cur.spend += r.cost;
    cur.clicks += r.clicks;
    byCountry.set(c, cur);
  }
  const countries = Array.from(byCountry.entries())
    .map(([code, v]) => ({ code, ...v }))
    .sort((a, b) => b.impr - a.impr);

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Where they're searching from
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
            Geographic reach · last 7 days
          </p>
        </div>
        {!empty ? (
          <p className="text-[11px] tabular text-[color:var(--fg-mute)]">
            {countries.length} {countries.length === 1 ? "country" : "countries"} ·{" "}
            {rows.length} cities
          </p>
        ) : null}
      </div>

      {empty ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--bg-soft)] px-5 py-8 text-center">
          <p className="font-display text-base font-semibold tracking-tight">
            No located impressions yet
          </p>
          <p className="mt-2 text-xs text-[color:var(--fg-mute)]">
            Geo data populates after the first served impressions are matched to a
            place. Should arrive within hours.
          </p>
        </div>
      ) : (
        <>
          {/* Country share strip */}
          <div className="mt-6">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
              {countries.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ flexBasis: 0 }}
                  whileInView={{ flexBasis: `${(c.impr / totalImpr) * 100}%` }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.2, delay: 0.08 * i, ease: [0.2, 0.7, 0.2, 1] }}
                  className="h-full"
                  style={{
                    background:
                      i === 0
                        ? "linear-gradient(90deg, var(--accent-2), var(--accent))"
                        : `rgba(54,133,154,${Math.max(0.2, 0.8 - i * 0.15)})`,
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {countries.map((c) => (
                <span
                  key={c.code}
                  className="inline-flex items-baseline gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-mute)]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent-2)]" />
                  {c.code}
                  <span className="tabular text-[color:var(--fg-faint)] normal-case">
                    {Math.round((c.impr / totalImpr) * 100)}%
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* City list */}
          <ul className="mt-7 divide-y divide-[color:var(--border)]">
            {rows.map((row, i) => {
              const width = (row.impressions / max) * 100;
              return (
                <motion.li
                  key={row.cityId}
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: 0.025 * i }}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3"
                >
                  <span className="inline-flex h-7 w-9 items-center justify-center rounded border border-[color:var(--border)] bg-[color:var(--bg-soft)] text-[10px] uppercase tracking-[0.14em] text-[color:var(--fg-soft)] tabular">
                    {row.country || guessCountry(row.label) || "—"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[color:var(--fg)]">
                      {row.label || row.cityId}
                    </p>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${width}%` }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.2, 0.7, 0.2, 1] }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--accent-2), var(--accent))",
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
        </>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border)] pt-3">
        <p className="text-[11px] text-[color:var(--fg-faint)] tabular">
          {!empty ? (
            <>
              {formatNumber(totalImpr)} impressions ·{" "}
              <Money amount={totalSpend} meta={meta} layout="inline" size="xs" precise hideShadow />
            </>
          ) : (
            "Awaiting first geo-resolved impressions"
          )}
        </p>
        <SourceBadge source="Google Ads · geographic_view" pulledAt={meta.pulledAt} />
      </div>
    </FrostedCard>
  );
}

function guessCountry(label?: string): string | undefined {
  if (!label) return undefined;
  if (/\bUnited States\b|\bUS\b|\bUSA\b|California|Texas|Hawaii|Florida|New York|Washington/.test(label)) return "US";
  if (/Mexico|México|Baja|Sonora|Jalisco/.test(label)) return "MX";
  if (/Canada/.test(label)) return "CA";
  return undefined;
}

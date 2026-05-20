"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { Money } from "./Money";
import { formatNumber } from "@/lib/format";
import type { KeywordStats, Snapshot } from "@/types/dashboard";

interface KeywordTableProps {
  keywords?: KeywordStats[];
  meta: Snapshot["meta"];
}

type SortKey = "impressions" | "clicks" | "cost" | "ctr" | "conversions";

const MATCH_TYPE_LABEL: Record<string, string> = {
  EXACT: "Exact",
  PHRASE: "Phrase",
  BROAD: "Broad",
};

const MATCH_TYPE_COLOR: Record<string, string> = {
  EXACT: "var(--accent-2)",
  PHRASE: "var(--accent)",
  BROAD: "var(--accent-warm)",
};

export function KeywordTable({ keywords, meta }: KeywordTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>("impressions");
  const [adGroupFilter, setAdGroupFilter] = React.useState<string | null>(null);

  const allAdGroups = React.useMemo(() => {
    const s = new Set<string>();
    (keywords ?? []).forEach((k) => s.add(k.adGroup));
    return Array.from(s).sort();
  }, [keywords]);

  const filtered = React.useMemo(() => {
    let rows = keywords ?? [];
    if (adGroupFilter) rows = rows.filter((r) => r.adGroup === adGroupFilter);
    return [...rows].sort((a, b) => {
      const av = sortKey === "ctr" ? ctr(a) : a[sortKey];
      const bv = sortKey === "ctr" ? ctr(b) : b[sortKey];
      return (bv as number) - (av as number);
    });
  }, [keywords, sortKey, adGroupFilter]);

  const total = filtered.reduce(
    (acc, r) => ({
      cost: acc.cost + r.cost,
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      conversions: acc.conversions + r.conversions,
    }),
    { cost: 0, impressions: 0, clicks: 0, conversions: 0 },
  );

  const empty = total.impressions === 0;

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Every keyword we bid on
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
            {filtered.length} keywords · last 7 days
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill
            label="All ad groups"
            active={adGroupFilter === null}
            onClick={() => setAdGroupFilter(null)}
          />
          {allAdGroups.map((ag) => (
            <Pill
              key={ag}
              label={shortAg(ag)}
              active={adGroupFilter === ag}
              onClick={() => setAdGroupFilter(ag)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
              <th className="pb-3 pr-4 font-medium">Keyword</th>
              <th className="pb-3 pr-4 font-medium">Match</th>
              <SortHeader
                label="Impr"
                active={sortKey === "impressions"}
                onClick={() => setSortKey("impressions")}
              />
              <SortHeader
                label="Clicks"
                active={sortKey === "clicks"}
                onClick={() => setSortKey("clicks")}
              />
              <SortHeader
                label="CTR"
                active={sortKey === "ctr"}
                onClick={() => setSortKey("ctr")}
              />
              <SortHeader
                label="Conv"
                active={sortKey === "conversions"}
                onClick={() => setSortKey("conversions")}
              />
              <SortHeader
                label="Cost"
                active={sortKey === "cost"}
                onClick={() => setSortKey("cost")}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const r = ctr(row);
              const active = row.impressions > 0;
              return (
                <motion.tr
                  key={`${row.text}-${row.matchType}-${row.adGroup}`}
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: 0.015 * i }}
                  className="border-t border-[color:var(--border)] align-middle"
                >
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${
                          active ? "text-[color:var(--fg)]" : "text-[color:var(--fg-mute)]"
                        }`}
                      >
                        {row.text}
                      </span>
                      <span className="mt-0.5 text-[10px] text-[color:var(--fg-faint)]">
                        {shortAg(row.adGroup)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-block rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]"
                      style={{
                        borderColor: MATCH_TYPE_COLOR[row.matchType] ?? "var(--border)",
                        color: MATCH_TYPE_COLOR[row.matchType] ?? "var(--fg-mute)",
                      }}
                    >
                      {MATCH_TYPE_LABEL[row.matchType] ?? row.matchType}
                    </span>
                  </td>
                  <td className="py-3 pr-4 tabular text-sm">
                    {formatNumber(row.impressions)}
                  </td>
                  <td className="py-3 pr-4 tabular text-sm">{formatNumber(row.clicks)}</td>
                  <td className="py-3 pr-4 tabular text-sm">
                    {row.impressions > 0 ? `${(r * 100).toFixed(2)}%` : "—"}
                  </td>
                  <td className="py-3 pr-4 tabular text-sm">
                    {row.conversions > 0 ? formatNumber(row.conversions) : "—"}
                  </td>
                  <td className="py-3 text-right">
                    {row.cost > 0 ? (
                      <Money
                        amount={row.cost}
                        meta={meta}
                        size="sm"
                        layout="stack"
                        precise
                        className="items-end"
                      />
                    ) : (
                      <span className="text-sm text-[color:var(--fg-faint)] tabular">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {empty ? (
        <p className="mt-5 text-xs text-[color:var(--fg-mute)]">
          Most keywords have not yet earned an impression — this is normal for an
          account in its first 24h. The auction picks one or two keywords to test
          first, then widens.
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border)] pt-3">
        <p className="text-[11px] text-[color:var(--fg-faint)] tabular">
          {formatNumber(total.impressions)} impressions ·{" "}
          {formatNumber(total.clicks)} clicks ·{" "}
          <Money amount={total.cost} meta={meta} layout="inline" size="xs" precise hideShadow />
        </p>
        <SourceBadge source="Google Ads · keywords" pulledAt={meta.pulledAt} />
      </div>
    </FrostedCard>
  );
}

function ctr(r: KeywordStats): number {
  return r.impressions > 0 ? r.clicks / r.impressions : 0;
}

function shortAg(name: string): string {
  const m = name.match(/^AG(\d+)\s*[-–]\s*(.+)$/);
  if (!m) return name;
  return `AG${m[1]} · ${m[2]}`;
}

function SortHeader({
  label,
  active,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`pb-3 ${align === "right" ? "pl-4 text-right" : "pr-4"}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 font-medium uppercase tracking-[0.16em] transition-colors ${
          active
            ? "text-[color:var(--fg)]"
            : "text-[color:var(--fg-faint)] hover:text-[color:var(--fg-mute)]"
        }`}
      >
        {label}
        {active ? (
          <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
            <path d="M4 2 L6.5 6 L1.5 6 Z" fill="currentColor" transform="rotate(180 4 4)" />
          </svg>
        ) : null}
      </button>
    </th>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-[color:var(--accent-2)] bg-[color:var(--accent)]/10 text-[color:var(--accent-2)]"
          : "border-[color:var(--border)] bg-transparent text-[color:var(--fg-mute)] hover:text-[color:var(--fg)]"
      }`}
    >
      {label}
    </button>
  );
}

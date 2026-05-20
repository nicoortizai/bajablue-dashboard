"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { Money } from "./Money";
import { formatNumber } from "@/lib/format";
import type { DeviceStats, Snapshot } from "@/types/dashboard";

interface DeviceBreakdownProps {
  today?: DeviceStats[];
  last7d?: DeviceStats[];
  meta: Snapshot["meta"];
}

const DEVICE_ORDER = ["MOBILE", "DESKTOP", "TABLET", "OTHER", "UNKNOWN"];

// Hand-drawn looking SVG silhouettes. No emoji.
function DeviceGlyph({ device, active }: { device: string; active: boolean }) {
  const stroke = active ? "var(--accent-2)" : "var(--fg-faint)";
  const fill = active ? "rgba(54,133,154,0.10)" : "transparent";
  const common = { stroke, strokeWidth: 1.25, fill, vectorEffect: "non-scaling-stroke" as const };
  if (device === "MOBILE") {
    return (
      <svg viewBox="0 0 24 36" className="h-10 w-7 sm:h-12 sm:w-8" aria-hidden>
        <rect x="2" y="2" width="20" height="32" rx="3.5" {...common} />
        <circle cx="12" cy="30" r="1" fill={stroke} />
        <line x1="9" y1="5" x2="15" y2="5" stroke={stroke} strokeWidth="0.75" />
      </svg>
    );
  }
  if (device === "DESKTOP") {
    return (
      <svg viewBox="0 0 36 30" className="h-10 w-12 sm:h-12 sm:w-14" aria-hidden>
        <rect x="2" y="2" width="32" height="20" rx="2" {...common} />
        <line x1="10" y1="26" x2="26" y2="26" stroke={stroke} strokeWidth="1.25" />
        <line x1="18" y1="22" x2="18" y2="26" stroke={stroke} strokeWidth="1.25" />
      </svg>
    );
  }
  // TABLET / OTHER / UNKNOWN
  return (
    <svg viewBox="0 0 28 36" className="h-10 w-8 sm:h-12 sm:w-10" aria-hidden>
      <rect x="2" y="2" width="24" height="32" rx="2.5" {...common} />
      <circle cx="14" cy="30.5" r="0.8" fill={stroke} />
    </svg>
  );
}

export function DeviceBreakdown({ today, last7d, meta }: DeviceBreakdownProps) {
  const [view, setView] = React.useState<"today" | "7d">("today");
  const rows = (view === "today" ? today : last7d) ?? [];

  const ordered = [...rows].sort(
    (a, b) => DEVICE_ORDER.indexOf(a.device) - DEVICE_ORDER.indexOf(b.device),
  );

  const totals = ordered.reduce(
    (acc, r) => ({
      cost: acc.cost + r.cost,
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
    }),
    { cost: 0, impressions: 0, clicks: 0 },
  );

  const empty = totals.impressions === 0;

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Where the traffic is
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
            Device split across this campaign
          </p>
        </div>
        <Toggle
          options={[
            { id: "today", label: "Today" },
            { id: "7d", label: "Last 7d" },
          ]}
          value={view}
          onChange={(v) => setView(v as "today" | "7d")}
        />
      </div>

      {empty ? (
        <p className="mt-8 text-sm text-[color:var(--fg-mute)]">
          No device data yet for this window — the auction is still warming up.
        </p>
      ) : (
        <ul className="mt-7 space-y-5">
          {ordered.map((row, i) => {
            const sharePct =
              totals.impressions > 0
                ? (row.impressions / totals.impressions) * 100
                : 0;
            const ctr = row.impressions > 0 ? row.clicks / row.impressions : 0;
            const active = row.impressions > 0;
            return (
              <li key={row.device} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-6">
                <div className="flex flex-col items-center gap-1.5">
                  <DeviceGlyph device={row.device} active={active} />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-mute)]">
                    {row.device.toLowerCase()}
                  </p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium tabular">
                      {formatNumber(row.impressions)}{" "}
                      <span className="text-[color:var(--fg-faint)] font-normal">impr</span>
                    </p>
                    <p className="text-[11px] tabular text-[color:var(--fg-mute)]">
                      {sharePct.toFixed(0)}% share
                    </p>
                  </div>
                  <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${sharePct}%` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 1.0,
                        delay: 0.08 * i,
                        ease: [0.2, 0.7, 0.2, 1],
                      }}
                      className="h-full rounded-full"
                      style={{
                        background: active
                          ? "linear-gradient(90deg, var(--accent-2) 0%, var(--accent) 100%)"
                          : "var(--border-strong)",
                        opacity: active ? 1 : 0.4,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[color:var(--fg-faint)] tabular">
                    {formatNumber(row.clicks)} clicks · CTR {(ctr * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <Money
                    amount={row.cost}
                    meta={meta}
                    size="sm"
                    layout="stack"
                    precise
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-7 flex items-center justify-between border-t border-[color:var(--border)] pt-3">
        <p className="text-[11px] text-[color:var(--fg-faint)] tabular">
          Total <Money amount={totals.cost} meta={meta} layout="inline" size="sm" precise hideShadow />{" "}
          across {formatNumber(totals.impressions)} impressions
        </p>
        <SourceBadge source="Google Ads" pulledAt={meta.pulledAt} />
      </div>
    </FrostedCard>
  );
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] p-0.5 text-[11px]"
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`relative rounded-full px-3 py-1 font-medium tracking-wide transition-colors ${
              active
                ? "text-[color:var(--bg)]"
                : "text-[color:var(--fg-mute)] hover:text-[color:var(--fg)]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="toggle-pill"
                className="absolute inset-0 rounded-full bg-[color:var(--fg)]"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

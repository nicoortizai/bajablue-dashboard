"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { Money } from "./Money";
import { formatNumber } from "@/lib/format";
import type { HourlyStats, Snapshot } from "@/types/dashboard";

interface ScheduleHeatmapProps {
  hourly?: HourlyStats[];
  meta: Snapshot["meta"];
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABEL: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

type Metric = "impressions" | "clicks" | "cost";

export function ScheduleHeatmap({ hourly, meta }: ScheduleHeatmapProps) {
  const [metric, setMetric] = React.useState<Metric>("impressions");

  // Build 7 × 24 grid. Cell = sum across all weeks in the data.
  const grid = React.useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const row of hourly ?? []) {
      const dIdx = DAYS.indexOf(row.dayOfWeek);
      if (dIdx === -1) continue;
      if (row.hour < 0 || row.hour > 23) continue;
      g[dIdx][row.hour] += row[metric];
    }
    return g;
  }, [hourly, metric]);

  const max = Math.max(0, ...grid.flat());
  const total = grid.flat().reduce((a, b) => a + b, 0);

  // Best window — find the cell with peak value
  let best: { day: string; hour: number; value: number } | null = null;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (grid[d][h] > (best?.value ?? 0)) {
        best = { day: DAYS[d], hour: h, value: grid[d][h] };
      }
    }
  }

  const empty = total === 0;

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            When the ads run
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
            Day × hour heatmap · last 7 days
          </p>
        </div>
        <MetricToggle value={metric} onChange={setMetric} />
      </div>

      <div className="mt-6 overflow-x-auto -mx-2 px-2">
        <div className="min-w-[520px]">
          {/* Hour axis */}
          <div className="grid grid-cols-[36px_repeat(24,minmax(0,1fr))] gap-[2px]">
            <div />
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className="text-center text-[9px] tabular text-[color:var(--fg-faint)]"
              >
                {h % 3 === 0 ? formatHour(h) : ""}
              </div>
            ))}
          </div>

          {/* Cells */}
          {DAYS.map((day, dIdx) => (
            <div
              key={day}
              className="mt-[3px] grid grid-cols-[36px_repeat(24,minmax(0,1fr))] gap-[2px]"
            >
              <div className="flex items-center text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-mute)]">
                {DAY_LABEL[day]}
              </div>
              {grid[dIdx].map((value, h) => {
                const intensity = max > 0 ? value / max : 0;
                const isBest = best && best.day === day && best.hour === h && value > 0;
                return (
                  <motion.div
                    key={h}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: 0.005 * (dIdx * 24 + h) }}
                    className="h-5 rounded-[3px] sm:h-6"
                    style={{
                      background:
                        intensity > 0
                          ? `rgba(54, 133, 154, ${0.12 + intensity * 0.78})`
                          : "var(--border)",
                      boxShadow: isBest
                        ? "0 0 0 1.5px var(--accent-warm)"
                        : intensity > 0.6
                          ? "inset 0 0 0 1px rgba(54,133,154,0.3)"
                          : "none",
                    }}
                    title={
                      value > 0
                        ? `${DAY_LABEL[day]} ${formatHour(h)} · ${labelFor(metric, value, meta)}`
                        : `${DAY_LABEL[day]} ${formatHour(h)} · no activity`
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[color:var(--border)] pt-4 sm:grid-cols-2">
        <div>
          {empty ? (
            <p className="text-xs text-[color:var(--fg-mute)]">
              Campaign launched recently — the heatmap will texture in as impressions
              accrue across the week.
            </p>
          ) : best ? (
            <p className="text-xs text-[color:var(--fg-mute)]">
              <span className="text-[color:var(--fg)]">Peak window:</span>{" "}
              <span className="tabular">
                {DAY_LABEL[best.day]} {formatHour(best.hour)}
              </span>{" "}
              ·{" "}
              {metric === "cost" ? (
                <Money amount={best.value} meta={meta} layout="inline" size="xs" precise hideShadow />
              ) : (
                <span className="tabular">{formatNumber(best.value)} {metric}</span>
              )}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
            Less
          </span>
          <div className="flex gap-[2px]">
            {[0.15, 0.35, 0.55, 0.75, 0.95].map((step) => (
              <span
                key={step}
                className="h-3 w-3 rounded-[2px]"
                style={{ background: `rgba(54, 133, 154, ${step})` }}
              />
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
            More
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <SourceBadge source="Google Ads · day-hour" pulledAt={meta.pulledAt} />
      </div>
    </FrostedCard>
  );
}

function formatHour(h: number): string {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  if (h < 12) return `${h}a`;
  return `${h - 12}p`;
}

function labelFor(metric: Metric, value: number, _meta: Snapshot["meta"]): string {
  if (metric === "cost") return `${value.toFixed(2)}`;
  return `${Math.round(value)} ${metric}`;
}

function MetricToggle({
  value,
  onChange,
}: {
  value: Metric;
  onChange: (m: Metric) => void;
}) {
  const opts: { id: Metric; label: string }[] = [
    { id: "impressions", label: "Impr" },
    { id: "clicks", label: "Clicks" },
    { id: "cost", label: "Spend" },
  ];
  return (
    <div className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] p-0.5 text-[11px]">
      {opts.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`relative rounded-full px-3 py-1 font-medium tracking-wide transition-colors ${
              active
                ? "text-[color:var(--bg)]"
                : "text-[color:var(--fg-mute)] hover:text-[color:var(--fg)]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="schedule-pill"
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

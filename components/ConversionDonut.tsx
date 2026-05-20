"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import type { ConversionAction } from "@/types/dashboard";

interface ConversionDonutProps {
  actions: ConversionAction[];
  /** ISO timestamp of the snapshot pull — used in the source badge footer. */
  pulledAt: string;
}

const PALETTE = [
  "#0A84FF",
  "#36859A",
  "#30D158",
  "#FF9F0A",
  "#BF5AF2",
  "#64D2FF",
];

export function ConversionDonut({ actions, pulledAt }: ConversionDonutProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const data = actions
    .filter((a) => a.tag !== "read-only")
    .map((a, i) => ({
      name: shortLabel(a.name),
      full: a.name,
      value: a.count ?? 0,
      primary: a.primary,
      color: PALETTE[i % PALETTE.length],
    }));
  const allZero = data.every((d) => d.value === 0);

  // For zero-state, render a "ghost" donut with equal placeholder slices
  // so the chart still has visual weight, then label it explicitly.
  const renderData = allZero
    ? data.map((d) => ({ ...d, value: 1 }))
    : data;

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Conversion mix
        </h2>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          Configured · {data.length}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-1 items-center gap-6 sm:grid-cols-[180px_1fr]">
        <div className="relative mx-auto h-44 w-44">
          {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={renderData}
                dataKey="value"
                innerRadius={56}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
                isAnimationActive
                animationDuration={1200}
              >
                {renderData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.color}
                    opacity={allZero ? 0.25 : 1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          ) : null}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
              {allZero ? "Awaiting" : "Total"}
            </p>
            <p className="font-display text-2xl font-semibold tabular">
              {allZero ? "—" : data.reduce((acc, d) => acc + d.value, 0)}
            </p>
          </div>
        </div>

        <ul className="space-y-2">
          {data.map((d) => (
            <li
              key={d.full}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="truncate text-[color:var(--fg)]">{d.name}</span>
                {d.primary ? (
                  <span className="shrink-0 rounded-full border border-[color:var(--border)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[color:var(--fg-faint)]">
                    Primary
                  </span>
                ) : null}
              </span>
              <span className="text-[color:var(--fg-soft)] tabular">
                {allZero ? "—" : d.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {allZero ? (
        <p className="mt-6 text-xs text-[color:var(--fg-faint)]">
          Conversion mix renders once Bokun + form events accrue. The chart shape
          previews how it will read at scale.
        </p>
      ) : null}

      <div className="mt-6 border-t border-[color:var(--border)] pt-3">
        <SourceBadge source="Google Ads" pulledAt={pulledAt} />
      </div>
    </FrostedCard>
  );
}

function shortLabel(name: string): string {
  return name
    .replace(/^Bokun\s+/i, "")
    .replace(/\s+\(.*\)$/, "")
    .replace(/—.*$/, "")
    .trim();
}

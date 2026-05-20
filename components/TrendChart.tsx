"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { shortDate, formatCurrency, formatNumber } from "@/lib/format";
import type { DailyPoint } from "@/types/dashboard";

interface TrendChartProps {
  title: string;
  data: DailyPoint[];
  dataKey: keyof DailyPoint;
  format: "currency" | "number";
  gradientFrom?: string;
  gradientTo?: string;
  delay?: number;
  /** ISO snapshot timestamp for the source badge. */
  pulledAt: string;
}

export function TrendChart({
  title,
  data,
  dataKey,
  format,
  gradientFrom = "#36859A",
  gradientTo = "#0F2832",
  delay = 0,
  pulledAt,
}: TrendChartProps) {
  const hasData = data.length > 0;
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradientId = `grad-${id}`;
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const total =
    data.reduce((acc, d) => acc + (Number(d[dataKey] ?? 0) || 0), 0) || 0;
  const formatted =
    format === "currency" ? formatCurrency(total) : formatNumber(total);

  return (
    <FrostedCard delay={delay} className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
            {title}
          </p>
          <p className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
            {formatted}
          </p>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          Last 30 days
        </p>
      </div>

      <div className="mt-3">
        <SourceBadge source="Google Ads" pulledAt={pulledAt} />
      </div>

      <div className="mt-4 h-44 sm:h-52">
        {hasData && mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 4, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={gradientTo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--grid-line)"
                strokeDasharray="2 4"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval="preserveStartEnd"
                tickFormatter={(v) => shortDate(String(v))}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) =>
                  format === "currency" ? `$${Math.round(Number(v))}` : String(v)
                }
              />
              <Tooltip
                cursor={{ stroke: "var(--border-strong)", strokeDasharray: 3 }}
                content={<FrostedTooltip format={format} dataKey={dataKey} />}
              />
              <Area
                type="monotone"
                dataKey={dataKey as string}
                stroke={gradientFrom}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive
                animationDuration={1400}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyTrendChart />
        )}
      </div>
    </FrostedCard>
  );
}

function FrostedTooltip({
  active,
  payload,
  label,
  format,
  dataKey,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  format: "currency" | "number";
  dataKey: keyof DailyPoint;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  const display =
    format === "currency" ? formatCurrency(value) : formatNumber(value);
  return (
    <div
      className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/90 px-3 py-2 text-xs text-[color:var(--fg)] backdrop-blur-xl"
      style={{ boxShadow: "0 8px 24px -12px rgba(0,0,0,0.4)" }}
    >
      <p className="text-[10px] uppercase tracking-wider text-[color:var(--fg-faint)]">
        {label ? shortDate(String(label)) : ""}
      </p>
      <p className="mt-0.5 font-display text-base font-semibold tabular">
        {display}
      </p>
      <p className="mt-0.5 text-[10px] text-[color:var(--fg-faint)]">
        {String(dataKey)}
      </p>
    </div>
  );
}

function EmptyTrendChart() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(transparent 60%, var(--grid-line) 60%, var(--grid-line) 61%, transparent 61%)",
          backgroundSize: "16px 24px",
        }}
      />
      <div className="relative flex items-center gap-2 text-sm text-[color:var(--fg-soft)]">
        <span className="live-dot" /> Awaiting traffic
      </div>
      <p className="relative text-xs text-[color:var(--fg-faint)]">
        First 30-day series renders here once impressions start landing.
      </p>
    </div>
  );
}

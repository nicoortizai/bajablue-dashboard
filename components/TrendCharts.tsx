"use client";

import { TrendChart } from "./TrendChart";
import type { DailyPoint } from "@/types/dashboard";

interface TrendChartsProps {
  data: DailyPoint[];
}

/**
 * Wrapper that lets the dashboard page hand a single client island
 * to Recharts. Keeps the rest of the page server-rendered and stops
 * the "container width(-1)" warning during the static prerender pass.
 */
export function TrendCharts({ data }: TrendChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
      <TrendChart
        title="Daily spend"
        data={data}
        dataKey="spend"
        format="currency"
        gradientFrom="#0A84FF"
        gradientTo="#36859A"
      />
      <TrendChart
        title="Daily conversions"
        data={data}
        dataKey="conv"
        format="number"
        gradientFrom="#30D158"
        gradientTo="#0A84FF"
        delay={0.06}
      />
    </div>
  );
}

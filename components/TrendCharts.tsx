"use client";

import { TrendChart } from "./TrendChart";
import type { DailyPoint } from "@/types/dashboard";
import type { CurrencyMeta } from "@/lib/currency";

interface TrendChartsProps {
  data: DailyPoint[];
  /** ISO timestamp of the snapshot pull — forwarded to each TrendChart. */
  pulledAt: string;
  /** Currency meta — forwarded so MXN charts read as MXN with USD shadow. */
  currencyMeta?: CurrencyMeta;
}

/**
 * Wrapper that lets the dashboard page hand a single client island
 * to Recharts. Keeps the rest of the page server-rendered and stops
 * the "container width(-1)" warning during the static prerender pass.
 */
export function TrendCharts({ data, pulledAt, currencyMeta }: TrendChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
      <TrendChart
        title="Daily spend"
        data={data}
        dataKey="spend"
        format="currency"
        gradientFrom="#36859A"
        gradientTo="#0F2832"
        pulledAt={pulledAt}
        currencyMeta={currencyMeta}
      />
      <TrendChart
        title="Daily conversions"
        data={data}
        dataKey="conv"
        format="number"
        gradientFrom="#E4A853"
        gradientTo="#36859A"
        delay={0.06}
        pulledAt={pulledAt}
      />
    </div>
  );
}

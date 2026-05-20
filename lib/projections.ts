import type { DailyPoint, Snapshot } from "@/types/dashboard";

// Tomorrow projection: trailing-7d average with a soft day-of-week
// multiplier. When there is no history (newly-launched campaign),
// we honor the explicit expectedRange the upstream snapshot carries
// — that range is set by the data layer based on launch context.

export interface ProjectionResult {
  low: number;
  high: number;
  point: number;
  note: string;
  hasHistory: boolean;
}

const DOW_MULT: Record<number, number> = {
  // Sun..Sat
  0: 0.85,
  1: 0.95,
  2: 1.0,
  3: 1.05,
  4: 1.1,
  5: 1.05,
  6: 0.9,
};

function targetDayOfWeek(today: string): number {
  // Today is the YYYY-MM-DD string for "now". Tomorrow = today + 1.
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.getUTCDay();
}

function trailingSeries(series: DailyPoint[], n: number): DailyPoint[] {
  if (series.length <= n) return series;
  return series.slice(series.length - n);
}

export function projectTomorrowConversions(
  snapshot: Snapshot,
): ProjectionResult {
  const { thirtyDay, leads, meta } = snapshot;
  const series = thirtyDay.dailySeries ?? [];
  const hasHistory = series.length >= 3;

  if (!hasHistory) {
    return {
      low: leads.projectedTomorrow.expectedRange.low,
      high: leads.projectedTomorrow.expectedRange.high,
      point: Math.round(
        (leads.projectedTomorrow.expectedRange.low +
          leads.projectedTomorrow.expectedRange.high) /
          2,
      ),
      note: leads.projectedTomorrow.note,
      hasHistory: false,
    };
  }

  const trailing7 = trailingSeries(series, 7);
  const sum = trailing7.reduce((acc, d) => acc + (d.conv ?? 0), 0);
  const avg = sum / trailing7.length;

  const dow = targetDayOfWeek(meta.today);
  const mult = DOW_MULT[dow] ?? 1.0;
  const center = avg * mult;

  // 25% band around the centered estimate.
  const low = Math.max(0, Math.round(center * 0.75));
  const high = Math.max(low, Math.round(center * 1.25));
  const point = Math.round(center);

  return {
    low,
    high,
    point,
    note: "Trailing 7d average × day-of-week multiplier",
    hasHistory: true,
  };
}

export interface MtdProjection {
  mtdSpend: number;
  projectedEomSpend: number;
  monthlyBudget: number;
  dayOfMonth: number;
  daysInMonth: number;
  dailyRunRate: number;
}

export function projectMtd(snapshot: Snapshot): MtdProjection {
  const monthlyBudget =
    snapshot.campaigns.reduce((acc, c) => acc + (c.monthlyBudgetTarget ?? 0), 0) ||
    1000;

  const series = snapshot.thirtyDay.dailySeries ?? [];
  const today = new Date(`${snapshot.meta.today}T00:00:00Z`);
  const monthStr = snapshot.meta.today.slice(0, 7); // YYYY-MM

  const mtdSeries = series.filter((d) => d.date.startsWith(monthStr));
  const mtdSpend = mtdSeries.reduce((acc, d) => acc + (d.spend ?? 0), 0);

  const dom = today.getUTCDate();
  const dim = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0),
  ).getUTCDate();

  const daysElapsed = mtdSeries.length > 0 ? mtdSeries.length : dom;
  const dailyRunRate = daysElapsed > 0 ? mtdSpend / daysElapsed : 0;
  const projectedEomSpend = dailyRunRate * dim;

  return {
    mtdSpend,
    projectedEomSpend,
    monthlyBudget,
    dayOfMonth: dom,
    daysInMonth: dim,
    dailyRunRate,
  };
}

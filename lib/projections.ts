import type { DailyPoint, Snapshot } from "@/types/dashboard";

// Tomorrow projection: trailing-7d average with a soft day-of-week
// multiplier. We REFUSE to fabricate a number when history is thin.
// The card always renders one of two states: a real projection,
// or an explicit "insufficient data" surface.

export interface ProjectionInsufficient {
  insufficient: true;
  daysAvailable: number;
  daysNeeded: number;
  message: string;
}

export interface ProjectionResult {
  insufficient: false;
  low: number;
  high: number;
  point: number;
  note: string;
  daysAvailable: number;
}

export type Projection = ProjectionInsufficient | ProjectionResult;

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

const MIN_DAYS_FOR_PROJECTION = 7;

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

export function projectTomorrowConversions(snapshot: Snapshot): Projection {
  const { thirtyDay, meta } = snapshot;
  const series = thirtyDay.dailySeries ?? [];
  const daysAvailable = series.length;

  if (daysAvailable === 0) {
    return {
      insufficient: true,
      daysAvailable: 0,
      daysNeeded: MIN_DAYS_FOR_PROJECTION,
      message: "Projection available after 7 days of conversion history",
    };
  }

  if (daysAvailable < MIN_DAYS_FOR_PROJECTION) {
    const remaining = MIN_DAYS_FOR_PROJECTION - daysAvailable;
    return {
      insufficient: true,
      daysAvailable,
      daysNeeded: MIN_DAYS_FOR_PROJECTION,
      message: `Need ${remaining} more day${remaining === 1 ? "" : "s"} of data for projection`,
    };
  }

  const trailing7 = trailingSeries(series, MIN_DAYS_FOR_PROJECTION);
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
    insufficient: false,
    low,
    high,
    point,
    note: "Trailing 7d average × day-of-week multiplier",
    daysAvailable,
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

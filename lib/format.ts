// Money + number + date formatting helpers.
// All callers should funnel through here so currency, locale, and
// precision stay consistent across every metric card and chart tooltip.

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number, opts: { precise?: boolean } = {}) {
  return opts.precise ? usdPrecise.format(value) : usd.format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompact(value: number) {
  return compact.format(value);
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function shortDate(iso: string) {
  // Accepts "2026-05-19" or full ISO. Renders "May 19".
  const date = iso.length === 10 ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function relativeTimeFromNow(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return diffSec <= 1 ? "just now" : `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return shortDate(iso);
}

export function liveSinceLabel(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now.getTime() - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just launched";
  if (minutes < 60) return `Launched ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remMin = minutes - hours * 60;
    return remMin === 0
      ? `Launched ${hours}h ago`
      : `Launched ${hours}h ${remMin}m ago`;
  }
  const days = Math.floor(hours / 24);
  return `Launched ${days}d ago`;
}

export function dayOfMonth(iso: string): number {
  // Works for "2026-05-19" or full ISO; returns day-of-month in UTC.
  const date = iso.length === 10 ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  return date.getUTCDate();
}

export function daysInMonth(iso: string): number {
  const date = iso.length === 10 ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

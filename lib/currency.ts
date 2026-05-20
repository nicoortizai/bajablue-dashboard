// Currency-aware money formatting for the dashboard.
// The Google Ads account reports in MXN; every displayed value gets a
// USD shadow so a USD-native viewer can still grok the magnitude.
//
// Convention: `fxRate` is units-of-local per 1 USD. So USD = localAmount / fxRate.
// Default MXN/USD fallback: 17.30 (mid-May 2026 mid-market).

const FX_FALLBACK_MXN_PER_USD = 17.3;

export interface CurrencyMeta {
  currency?: string;
  fxRate?: number;
  fxRateAsOf?: string;
}

export function getCurrency(meta?: CurrencyMeta): string {
  return (meta?.currency || "USD").toUpperCase();
}

export function getFxRate(meta?: CurrencyMeta): number {
  if (meta?.fxRate && Number.isFinite(meta.fxRate) && meta.fxRate > 0) {
    return meta.fxRate;
  }
  // Default fallback only applies when currency is MXN; for USD it's 1.
  return getCurrency(meta) === "USD" ? 1 : FX_FALLBACK_MXN_PER_USD;
}

/**
 * Pick the number of fraction digits based on magnitude. Cents-level only
 * shows when the number is small enough that they materially change the read.
 */
function digitsFor(amount: number, precise: boolean): number {
  if (precise) return 2;
  if (Math.abs(amount) >= 1000) return 0;
  if (Math.abs(amount) >= 100) return 0;
  if (Math.abs(amount) >= 10) return 2;
  return 2;
}

function formatPlain(amount: number, currency: string, precise: boolean): string {
  const digits = digitsFor(amount, precise);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

export interface MoneyParts {
  /** Primary label, e.g. "$16.45 MXN" */
  primary: string;
  /** Shadow USD label, e.g. "≈ $0.95 USD". Empty string when account is already USD. */
  shadow: string;
  /** Numeric values for chart tooltips. */
  amount: number;
  usd: number;
  currency: string;
}

export function moneyParts(
  amount: number,
  meta?: CurrencyMeta,
  opts: { precise?: boolean } = {},
): MoneyParts {
  const currency = getCurrency(meta);
  const fx = getFxRate(meta);
  const precise = opts.precise ?? Math.abs(amount) < 100;
  const primary = `${formatPlain(amount, currency, precise)} ${currency}`;
  const usd = currency === "USD" ? amount : amount / fx;
  const shadow =
    currency === "USD"
      ? ""
      : `≈ ${formatPlain(usd, "USD", Math.abs(usd) < 100)} USD`;
  return { primary, shadow, amount, usd, currency };
}

/** Single-line convenience: "$16.45 MXN (≈ $0.95 USD)" */
export function moneyInline(
  amount: number,
  meta?: CurrencyMeta,
  opts: { precise?: boolean; parens?: boolean } = {},
): string {
  const m = moneyParts(amount, meta, opts);
  if (!m.shadow) return m.primary;
  return opts.parens === false
    ? `${m.primary} · ${m.shadow}`
    : `${m.primary} (${m.shadow})`;
}

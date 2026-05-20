"use client";

import * as React from "react";
import { moneyParts, type CurrencyMeta } from "@/lib/currency";

interface MoneyProps {
  amount: number;
  meta?: CurrencyMeta;
  precise?: boolean;
  /** Layout: stack (default) puts shadow USD on the line below; inline = side by side. */
  layout?: "stack" | "inline";
  /** Size scale for the primary number. */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  /** Hide the shadow entirely (e.g. inside chart tooltips). */
  hideShadow?: boolean;
  className?: string;
  /** Apply tabular-nums for ledger alignment. */
  tabular?: boolean;
}

const SIZE_PRIMARY: Record<NonNullable<MoneyProps["size"]>, string> = {
  xs: "text-[11px]",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
  hero: "font-display text-4xl sm:text-5xl",
};

const SIZE_SHADOW: Record<NonNullable<MoneyProps["size"]>, string> = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-xs",
  xl: "text-xs",
  hero: "text-sm",
};

/**
 * Money — renders amount in account currency with a quieter USD shadow.
 * Use everywhere a price appears so the operator never has to mentally convert.
 */
export function Money({
  amount,
  meta,
  precise,
  layout = "stack",
  size = "md",
  hideShadow = false,
  className = "",
  tabular = true,
}: MoneyProps) {
  const parts = moneyParts(amount, meta, { precise });
  const tab = tabular ? "tabular" : "";

  if (layout === "inline") {
    return (
      <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
        <span className={`${SIZE_PRIMARY[size]} ${tab}`}>{parts.primary}</span>
        {parts.shadow && !hideShadow ? (
          <span
            className={`${SIZE_SHADOW[size]} ${tab} text-[color:var(--fg-faint)]`}
          >
            {parts.shadow}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`${SIZE_PRIMARY[size]} ${tab}`}>{parts.primary}</span>
      {parts.shadow && !hideShadow ? (
        <span
          className={`${SIZE_SHADOW[size]} ${tab} text-[color:var(--fg-faint)]`}
        >
          {parts.shadow}
        </span>
      ) : null}
    </span>
  );
}

"use client";

import * as React from "react";
import { FrostedCard } from "./FrostedCard";
import { AnimatedNumber } from "./AnimatedNumber";

interface HeroMetricCardProps {
  label: string;
  primary: number;
  /** Renders e.g. "0–2" for projected range when high !== primary. */
  primaryHigh?: number;
  /** Optional decoration (e.g. live pulse dot) shown next to the label. */
  badge?: React.ReactNode;
  /** Sublabel split, e.g. "0 inquiries · 0 bookings". */
  sublabel?: React.ReactNode;
  /** Footnote line in muted text, e.g. "as of 7pm CST" */
  footnote?: React.ReactNode;
  delay?: number;
  /** Color the primary number: default | positive | accent */
  tone?: "default" | "positive" | "accent";
}

export function HeroMetricCard({
  label,
  primary,
  primaryHigh,
  badge,
  sublabel,
  footnote,
  delay = 0,
  tone = "default",
}: HeroMetricCardProps) {
  const isRange = typeof primaryHigh === "number" && primaryHigh !== primary;

  const numClass =
    tone === "positive"
      ? "text-[color:var(--positive)]"
      : tone === "accent"
        ? "bg-gradient-to-br from-[#0A84FF] to-[#36859A] bg-clip-text text-transparent"
        : "text-[color:var(--fg)]";

  return (
    <FrostedCard delay={delay} className="px-6 py-7 sm:px-7 sm:py-8">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          {label}
        </p>
        {badge}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={`font-display text-5xl font-semibold sm:text-6xl ${numClass}`}
        >
          <AnimatedNumber value={primary} immediate />
          {isRange ? (
            <>
              <span className="px-1 text-[color:var(--fg-mute)]">–</span>
              <AnimatedNumber value={primaryHigh!} immediate />
            </>
          ) : null}
        </span>
      </div>

      {sublabel ? (
        <p className="mt-3 text-sm text-[color:var(--fg-soft)]">{sublabel}</p>
      ) : null}
      {footnote ? (
        <p className="mt-2 text-xs text-[color:var(--fg-faint)]">{footnote}</p>
      ) : null}
    </FrostedCard>
  );
}

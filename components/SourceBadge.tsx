"use client";

import * as React from "react";
import { relativeTimeFromNow } from "@/lib/format";

interface SourceBadgeProps {
  /** Human-readable source name, e.g. "Google Ads", "Google Search Console". */
  source: string;
  /**
   * ISO timestamp of when this data was actually pulled.
   * - When provided: renders "Source: {source} · Refreshed {relative} ago".
   * - When null/undefined: renders "Source: not yet connected · activate to enable".
   */
  pulledAt?: string | null;
  /** Optional override class for layout adjustments. */
  className?: string;
}

/**
 * Tiny "where did this number come from" tag — shown in every section so
 * the operator can tell at a glance which API is live and how fresh it is.
 * Recomputes the relative label every minute so it stays honest even when
 * the page is left open for a while.
 */
export function SourceBadge({ source, pulledAt, className = "" }: SourceBadgeProps) {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!pulledAt) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--fg-faint)] ${className}`}
        suppressHydrationWarning
      >
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-[color:var(--fg-faint)] opacity-60"
        />
        Source: not yet connected · activate to enable
      </span>
    );
  }

  const relative = now ? relativeTimeFromNow(pulledAt, now) : "—";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--fg-faint)] ${className}`}
      suppressHydrationWarning
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-2)]"
      />
      Source: {source} · Refreshed {relative}
    </span>
  );
}

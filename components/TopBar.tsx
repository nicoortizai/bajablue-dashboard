"use client";

import * as React from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { relativeTimeFromNow } from "@/lib/format";

interface TopBarProps {
  pulledAt: string;
}

export function TopBar({ pulledAt }: TopBarProps) {
  const [now, setNow] = React.useState<Date | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/snapshot", { cache: "no-store" });
      setNow(new Date());
    } catch {
      /* network failure is fine — silent */
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }

  const updatedLabel = now ? relativeTimeFromNow(pulledAt, now) : "";

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-8 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="frosted-soft flex items-center justify-between gap-3 rounded-2xl px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--accent-2)] text-white shadow-[0_4px_12px_-4px_rgba(54,133,154,0.5)]"
          >
            <BajablueSwimmerMark />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-[color:var(--fg)] sm:text-lg">
            Bajablue
          </span>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)] sm:inline">
            Performance
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
              Updated
            </p>
            <p
              className="-mt-0.5 text-xs text-[color:var(--fg-soft)] tabular"
              suppressHydrationWarning
            >
              {updatedLabel || "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] transition hover:border-[color:var(--border-strong)]"
          >
            <RefreshCw
              size={15}
              className={`text-[color:var(--fg-soft)] ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          <ThemeToggle />
          <a
            href="/logout"
            aria-label="Sign out"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] transition hover:border-[color:var(--border-strong)]"
          >
            <LogOut size={15} className="text-[color:var(--fg-soft)]" />
          </a>
        </div>
      </div>
    </header>
  );
}

/**
 * Minimal Bajablue swimmer mark — stylized freestyle silhouette in white
 * on top of the teal ocean-accent dot. Kept inline so the topbar logo
 * paints with the chrome and never blocks on a separate file fetch.
 */
function BajablueSwimmerMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {/* head */}
      <circle cx="15.5" cy="7.5" r="1.6" fill="currentColor" />
      {/* arm extended forward */}
      <path
        d="M5 9c1.7-1.4 3.6-2 5.6-1.8L13 7.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* torso + trailing leg */}
      <path
        d="M9.8 11.2c2.4.3 4.6 1 6.5 1.9 1.4.7 2.6 1 3.7.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* wave under swimmer */}
      <path
        d="M3.5 16.5c1.8-1.2 3.5-1.2 5.3 0s3.5 1.2 5.3 0 3.5-1.2 5.3 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.7"
        fill="none"
      />
    </svg>
  );
}

"use client";

import * as React from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { AccountSwitcher } from "./AccountSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { relativeTimeFromNow } from "@/lib/format";

interface TopBarProps {
  pulledAt: string;
  accountId: string;
}

export function TopBar({ pulledAt, accountId }: TopBarProps) {
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
        <div className="flex min-w-0 items-center gap-3">
          <AccountSwitcher activeId={accountId} />
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

"use client";

import * as React from "react";
import { HeroMetricCard } from "./HeroMetricCard";
import type { Snapshot } from "@/types/dashboard";
import { liveSinceLabel, shortDate } from "@/lib/format";
import { projectTomorrowConversions } from "@/lib/projections";

interface HeroBandProps {
  snapshot: Snapshot;
}

export function HeroBand({ snapshot }: HeroBandProps) {
  const { leads, meta, campaigns } = snapshot;
  const tomorrow = projectTomorrowConversions(snapshot);
  const launch = campaigns[0]?.launchedAt;
  const liveLabel = launch ? liveSinceLabel(launch) : null;

  return (
    <section
      aria-label="Headline metrics"
      className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3"
    >
      <HeroMetricCard
        label={`Yesterday · ${shortDate(meta.yesterday)}`}
        primary={leads.yesterday.bookings}
        sublabel={
          <>
            <span className="tabular">{leads.yesterday.inquiries}</span>{" "}
            inquiries ·{" "}
            <span className="tabular">{leads.yesterday.bookings}</span> bookings
          </>
        }
        footnote={
          <>
            <span className="tabular">{leads.yesterday.clicks ?? 0}</span> clicks
            · <span className="tabular">{leads.yesterday.impressions ?? 0}</span>{" "}
            impressions
          </>
        }
        delay={0}
      />

      <HeroMetricCard
        label={`Today · ${shortDate(meta.today)}`}
        primary={leads.today.bookings}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[color:var(--fg-soft)]">
            <span className="live-dot" /> Live
          </span>
        }
        sublabel={
          <>
            <span className="tabular">{leads.today.inquiries}</span>{" "}
            inquiries ·{" "}
            <span className="tabular">{leads.today.bookings}</span> bookings
          </>
        }
        footnote={
          leads.today.asOfHour !== undefined
            ? `As of ${formatHour(leads.today.asOfHour)} local`
            : null
        }
        delay={0.07}
        tone="accent"
      />

      <HeroMetricCard
        label="Projected · Tomorrow"
        primary={tomorrow.low}
        primaryHigh={tomorrow.high}
        sublabel={
          tomorrow.hasHistory ? (
            <>Expected bookings range</>
          ) : (
            <span className="text-[color:var(--fg-soft)]">
              {liveLabel ?? "Launching"} · learning phase
            </span>
          )
        }
        footnote={
          <span className="text-[color:var(--fg-faint)]">{tomorrow.note}</span>
        }
        delay={0.14}
        tone="positive"
      />
    </section>
  );
}

function formatHour(h: number): string {
  // Render a 0-23 hour as "7pm" / "12am" — keeps the dashboard skimmable.
  const period = h >= 12 ? "pm" : "am";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
}

"use client";

import * as React from "react";
import { FrostedCard } from "./FrostedCard";
import { ActivateEmpty } from "./ActivateEmpty";
import type { AiVisibilityBlock, SourceState } from "@/types/dashboard";

interface AISearchVisibilityProps {
  aiVisibility?: AiVisibilityBlock;
  dataforseoSource: SourceState;
}

type Status = "green" | "yellow" | "red" | "pending";

function statusFor(pct: number): Status {
  if (pct >= 0.5) return "green";
  if (pct >= 0.2) return "yellow";
  return "red";
}

const STATUS_STYLES: Record<Status, { dot: string; ring: string; label: string }> = {
  green: {
    dot: "#30D158",
    ring: "rgba(48, 209, 88, 0.35)",
    label: "Healthy",
  },
  yellow: {
    dot: "#FF9F0A",
    ring: "rgba(255, 159, 10, 0.35)",
    label: "Partial",
  },
  red: {
    dot: "#FF453A",
    ring: "rgba(255, 69, 58, 0.35)",
    label: "Invisible",
  },
  pending: {
    dot: "#6b7280",
    ring: "rgba(107, 114, 128, 0.35)",
    label: "Coming soon",
  },
};

interface CardData {
  engine: string;
  description: string;
  state: Status;
  metric: string;
  detail: string;
}

export function AISearchVisibility({
  aiVisibility,
  dataforseoSource,
}: AISearchVisibilityProps) {
  if (!aiVisibility) {
    return (
      <ActivateEmpty
        title="AI search visibility"
        source="DataForSEO"
        missing={
          dataforseoSource.missing.length
            ? dataforseoSource.missing
            : ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"]
        }
        pitch="Are you cited in Google AI Overviews, Perplexity, and ChatGPT search? Three live indicators showing how often your domain shows up as a source."
        error={dataforseoSource.error}
      />
    );
  }

  const total = aiVisibility.totalKeywords || 1;
  const pct = aiVisibility.cited / total;

  const cards: CardData[] = [
    {
      engine: "Google AI Overviews",
      description: "Citations across tracked keywords",
      state: total === 0 ? "pending" : statusFor(pct),
      metric: `${aiVisibility.cited} / ${aiVisibility.totalKeywords}`,
      detail: `${Math.round(pct * 100)}% citation rate`,
    },
    {
      engine: "Perplexity",
      description: "Sonar source-tracking",
      state: "pending",
      metric: "—",
      detail: "Sonar API integration coming",
    },
    {
      engine: "ChatGPT search",
      description: "Browsing-mode citation tracking",
      state: "pending",
      metric: "—",
      detail: "Brave/Bing fallback in scope",
    },
  ];

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          AI search visibility
        </h2>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          {aiVisibility.totalKeywords} keywords · {aiVisibility.yourDomain}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <EngineCard key={card.engine} card={card} />
        ))}
      </div>

      {/* Sample of citations — only when AI Overviews has data */}
      {aiVisibility.citations.some((c) => c.sources.length > 0) ? (
        <details className="group mt-6">
          <summary className="cursor-pointer text-xs text-[color:var(--fg-mute)] hover:text-[color:var(--fg-soft)]">
            See AI Overview sources for {aiVisibility.totalKeywords} tracked queries
          </summary>
          <ul className="mt-3 space-y-2.5">
            {aiVisibility.citations.slice(0, 6).map((c) => (
              <li
                key={c.keyword}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-soft)] px-3 py-2.5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm text-[color:var(--fg)]">
                    {c.keyword}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      c.cited
                        ? "bg-[color:var(--positive)]/15 text-[color:var(--positive)]"
                        : "bg-[color:var(--border)] text-[color:var(--fg-faint)]"
                    }`}
                  >
                    {c.cited ? "Cited" : "Not cited"}
                  </span>
                </div>
                {c.sources.length ? (
                  <p className="mt-1.5 truncate font-mono text-[10px] text-[color:var(--fg-mute)]">
                    {c.sources.slice(0, 5).join(" · ")}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[10px] text-[color:var(--fg-faint)]">
                    No AI Overview returned for this query
                  </p>
                )}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </FrostedCard>
  );
}

function EngineCard({ card }: { card: CardData }) {
  const s = STATUS_STYLES[card.state];
  return (
    <div className="relative rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-soft)] px-4 py-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-[color:var(--fg-soft)]">
            {card.engine}
          </p>
          <p className="mt-0.5 text-[10px] text-[color:var(--fg-faint)]">
            {card.description}
          </p>
        </div>
        <span
          aria-hidden
          className="relative grid h-3 w-3 shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: s.dot,
            boxShadow: `0 0 0 4px ${s.ring}`,
          }}
        />
      </div>
      <p className="font-display mt-4 text-2xl font-semibold tabular text-[color:var(--fg)]">
        {card.metric}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
        {s.label} · {card.detail}
      </p>
    </div>
  );
}

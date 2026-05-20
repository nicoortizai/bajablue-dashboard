"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { ActivateEmpty } from "./ActivateEmpty";
import type { CompetitorBlock, SourceState } from "@/types/dashboard";

interface CompetitorSoVProps {
  competitors?: CompetitorBlock;
  dataforseoSource: SourceState;
}

export function CompetitorSoV({
  competitors,
  dataforseoSource,
}: CompetitorSoVProps) {
  if (!competitors) {
    return (
      <ActivateEmpty
        title="Competitor share of voice"
        source="DataForSEO"
        missing={
          dataforseoSource.missing.length
            ? dataforseoSource.missing
            : ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"]
        }
        pitch="Weighted ranking of you and your top organic competitors across 10 commercial keywords. Updates every 4 hours once DataForSEO is wired."
        error={dataforseoSource.error}
      />
    );
  }

  const rows = competitors.rows;
  const max = Math.max(0.01, ...rows.map((r) => r.score));

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Competitor share of voice
        </h2>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          {competitors.totals.keywordCount} keywords · top 20
        </p>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-[color:var(--fg-mute)]">
        Weighted by SERP position (pos&nbsp;1 = 1.0, pos&nbsp;2 = 0.55, etc.).
        Your domain is highlighted.
      </p>

      <ul className="mt-6 space-y-3.5">
        {rows.map((r, i) => {
          const pct = (r.score / max) * 100;
          const isYou = r.domain === competitors.yourDomain;
          return (
            <li key={r.domain}>
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={`truncate text-sm ${
                    isYou
                      ? "font-semibold text-[color:var(--fg)]"
                      : "font-medium text-[color:var(--fg-soft)]"
                  }`}
                >
                  {r.domain}
                  {isYou ? (
                    <span className="ml-2 rounded-full border border-[color:var(--accent-2)]/40 bg-[color:var(--accent-2)]/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[color:var(--accent-2)]">
                      You
                    </span>
                  ) : null}
                </p>
                <div className="shrink-0 text-right">
                  <p className="text-sm tabular text-[color:var(--fg-soft)]">
                    {r.score.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-[color:var(--fg-faint)]">
                    pos&nbsp;{r.topRank === 100 ? "—" : r.topRank} · {r.appearances}/
                    {competitors.totals.keywordCount}
                  </p>
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.max(pct, 3)}%` }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 1.1,
                    delay: 0.05 * i,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: isYou
                      ? "linear-gradient(90deg, #36859A 0%, #0A84FF 100%)"
                      : "linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)",
                    opacity: isYou ? 1 : 0.55,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {competitors.totals.yourScore === 0 ? (
        <p className="mt-6 text-xs text-[color:var(--fg-faint)]">
          You&apos;re not yet ranking in the top 20 for any tracked keyword. Bars
          show where the competitive field sits today.
        </p>
      ) : null}
    </FrostedCard>
  );
}

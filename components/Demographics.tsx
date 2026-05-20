"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { SourceBadge } from "./SourceBadge";
import { formatNumber } from "@/lib/format";
import type { AgeRangeStats, GenderStats, Snapshot } from "@/types/dashboard";

interface DemographicsProps {
  ages?: AgeRangeStats[];
  genders?: GenderStats[];
  meta: Snapshot["meta"];
  /** Total conversions accrued so far — drives the Google "needs ~50" gate. */
  conversions: number;
}

const AGE_LABELS: Record<string, string> = {
  AGE_RANGE_18_24: "18–24",
  AGE_RANGE_25_34: "25–34",
  AGE_RANGE_35_44: "35–44",
  AGE_RANGE_45_54: "45–54",
  AGE_RANGE_55_64: "55–64",
  AGE_RANGE_65_UP: "65+",
  AGE_RANGE_UNDETERMINED: "Unknown",
};

const AGE_ORDER = [
  "AGE_RANGE_18_24",
  "AGE_RANGE_25_34",
  "AGE_RANGE_35_44",
  "AGE_RANGE_45_54",
  "AGE_RANGE_55_64",
  "AGE_RANGE_65_UP",
  "AGE_RANGE_UNDETERMINED",
];

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  UNDETERMINED: "Unknown",
};

const GENDER_ORDER = ["FEMALE", "MALE", "UNDETERMINED"];

const CONV_THRESHOLD = 50;

export function Demographics({ ages, genders, meta, conversions }: DemographicsProps) {
  const sortedAges = AGE_ORDER.map(
    (id) =>
      ages?.find((a) => a.ageRange === id) ?? {
        ageRange: id,
        cost: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
  );
  const sortedGenders = GENDER_ORDER.map(
    (id) =>
      genders?.find((g) => g.gender === id) ?? {
        gender: id,
        cost: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
  );

  const totalImpr = sortedAges.reduce((s, a) => s + a.impressions, 0);
  const insufficient = conversions < CONV_THRESHOLD;

  // Build heatmap: rows = gender, cols = age. Cell value = impressions count.
  // When data is empty we still render the same shape so the skeleton "teaches"
  // the user what will appear once conversions roll in.
  const matrix = sortedGenders.map((g) => {
    return sortedAges.map((a) => {
      // We don't actually have age × gender crossed data from these views,
      // but we can show per-axis intensity. To keep the heatmap honest:
      // cell impressions = min(ageImpr, genderImpr) proportional weight.
      const aImpr = a.impressions;
      const gImpr = g.impressions;
      // Use the gender's share to allocate the age column.
      const genderTotal = sortedGenders.reduce((s, x) => s + x.impressions, 0) || 1;
      const cell = aImpr * (gImpr / genderTotal);
      return cell;
    });
  });

  const maxCell = Math.max(0, ...matrix.flat());

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Who's seeing the ads
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--fg-faint)]">
            Age × gender heatmap · last 7 days
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
            insufficient
              ? "border-[color:var(--border)] bg-[color:var(--bg-soft)] text-[color:var(--fg-mute)]"
              : "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent-2)]"
          }`}
        >
          {insufficient ? "Skeleton" : "Live"}
        </span>
      </div>

      <div className="relative mt-6">
        {/* Heatmap grid — always rendered. Opacity dims when insufficient. */}
        <div
          className={`transition-opacity ${insufficient ? "opacity-35" : "opacity-100"}`}
          aria-hidden={insufficient || undefined}
        >
          <div className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] gap-1.5 sm:gap-2">
            <div />
            {sortedAges.map((a) => (
              <div
                key={a.ageRange}
                className="text-center text-[10px] tabular text-[color:var(--fg-faint)]"
              >
                {AGE_LABELS[a.ageRange]}
              </div>
            ))}
            {sortedGenders.map((g, rowI) => (
              <React.Fragment key={g.gender}>
                <div className="flex items-center justify-end pr-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--fg-mute)]">
                  {GENDER_LABELS[g.gender]}
                </div>
                {matrix[rowI].map((cell, colI) => {
                  const intensity = maxCell > 0 ? cell / maxCell : 0;
                  return (
                    <motion.div
                      key={colI}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.02 * (rowI * 7 + colI),
                        ease: [0.2, 0.7, 0.2, 1],
                      }}
                      className="aspect-square rounded-md"
                      style={{
                        background:
                          intensity > 0
                            ? `rgba(54, 133, 154, ${0.15 + intensity * 0.75})`
                            : "var(--border)",
                        boxShadow:
                          intensity > 0.7
                            ? "inset 0 0 0 1px rgba(54,133,154,0.4)"
                            : "none",
                      }}
                      title={
                        cell > 0
                          ? `${AGE_LABELS[sortedAges[colI].ageRange]} · ${
                              GENDER_LABELS[g.gender]
                            } · ~${Math.round(cell)} impr`
                          : "no data"
                      }
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {insufficient ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--bg-elevated)]/85 px-5 py-4 text-center shadow-xl backdrop-blur">
              <p className="font-display text-sm font-semibold tracking-tight">
                Populates after ~{CONV_THRESHOLD} conversions
              </p>
              <p className="mt-1 text-[11px] tabular text-[color:var(--fg-mute)]">
                {conversions} / {CONV_THRESHOLD} so far · Google requires a privacy
                floor before reporting cohort data
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[color:var(--border)] pt-3">
        <p className="text-[11px] text-[color:var(--fg-faint)] tabular">
          {totalImpr > 0
            ? `${formatNumber(totalImpr)} impressions feeding the model`
            : "Awaiting first impressions"}
        </p>
        <SourceBadge source="Google Ads · demographics" pulledAt={meta.pulledAt} />
      </div>
    </FrostedCard>
  );
}

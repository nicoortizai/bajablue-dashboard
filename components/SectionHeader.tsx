"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  /** "01" — small tabular ordinal printed above the heading. */
  ordinal?: string;
  eyebrow: string;
  title: string;
  /** Optional lede paragraph. Keep it short — one sentence. */
  lede?: string;
  /** Right-side annotation, e.g. timestamp or filter chips. */
  trailing?: React.ReactNode;
}

/**
 * Narrative section header. Used to chapter the dashboard into a story so it
 * reads top-to-bottom instead of as a wall of cards.
 */
export function SectionHeader({
  ordinal,
  eyebrow,
  title,
  lede,
  trailing,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      className="mt-14 mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="max-w-2xl">
        <div className="flex items-baseline gap-2">
          {ordinal ? (
            <span className="font-display text-sm tabular text-[color:var(--fg-faint)]">
              {ordinal}
            </span>
          ) : null}
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--fg-faint)]">
            {eyebrow}
          </p>
        </div>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {lede ? (
          <p className="mt-2 text-sm text-[color:var(--fg-mute)]">{lede}</p>
        ) : null}
      </div>
      {trailing}
    </motion.div>
  );
}

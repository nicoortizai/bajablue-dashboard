"use client";

import * as React from "react";
import { FrostedCard } from "./FrostedCard";

interface ActivateEmptyProps {
  title: string;
  source: string;
  /** Env var names that need to be set on Vercel for this section to light up. */
  missing: string[];
  /** One-line description of what this section will show once activated. */
  pitch: string;
  /** Optional surfaced runtime error from a failed live pull. */
  error?: string;
  /** Optional icon glyph (renders as quiet outlined badge). */
  glyph?: React.ReactNode;
  className?: string;
}

/**
 * Empty-state for a section that is wired but not yet activated.
 * Reads as intentional, not broken — quiet "Activate" affordance with the
 * exact env var names the operator needs to set on Vercel.
 */
export function ActivateEmpty({
  title,
  source,
  missing,
  pitch,
  error,
  glyph,
  className = "",
}: ActivateEmptyProps) {
  return (
    <FrostedCard className={`px-6 py-7 sm:px-8 sm:py-8 ${className}`}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {glyph ? (
              <span className="grid h-7 w-7 place-items-center rounded-full border border-[color:var(--border)] text-[color:var(--fg-mute)]">
                {glyph}
              </span>
            ) : null}
            <h2 className="font-display text-lg font-semibold tracking-tight text-[color:var(--fg)]">
              {title}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-dashed border-[color:var(--border-strong)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
            Activate
          </span>
        </div>

        <p className="text-sm leading-relaxed text-[color:var(--fg-soft)]">
          {pitch}
        </p>

        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--bg-soft)] px-4 py-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
            {error ? "Connection error" : `Add to Vercel → ${source}`}
          </p>
          {error ? (
            <p className="mt-2 text-xs leading-relaxed text-[color:var(--negative)]">
              {error.slice(0, 200)}
            </p>
          ) : (
            <ul className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-[color:var(--fg-soft)]">
              {missing.map((key) => (
                <li key={key} className="tabular">
                  {key}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </FrostedCard>
  );
}

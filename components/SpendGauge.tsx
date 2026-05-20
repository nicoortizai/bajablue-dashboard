"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FrostedCard } from "./FrostedCard";
import { AnimatedNumber } from "./AnimatedNumber";
import { projectMtd } from "@/lib/projections";
import { formatCurrency } from "@/lib/format";
import type { Snapshot } from "@/types/dashboard";

interface SpendGaugeProps {
  snapshot: Snapshot;
}

export function SpendGauge({ snapshot }: SpendGaugeProps) {
  const mtd = projectMtd(snapshot);
  const progress = mtd.monthlyBudget > 0
    ? Math.min(1, mtd.mtdSpend / mtd.monthlyBudget)
    : 0;

  return (
    <FrostedCard className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
            Month-to-date spend
          </p>
          <p className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            <AnimatedNumber
              value={mtd.mtdSpend}
              immediate
              format={(v) => formatCurrency(v)}
            />
            <span className="ml-2 text-base font-medium text-[color:var(--fg-mute)]">
              of {formatCurrency(mtd.monthlyBudget)}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
            Day {mtd.dayOfMonth} of {mtd.daysInMonth}
          </p>
          <p className="mt-2 text-sm text-[color:var(--fg-soft)] tabular">
            Run rate {formatCurrency(mtd.dailyRunRate, { precise: true })}
            <span className="text-[color:var(--fg-faint)]"> /day</span>
          </p>
          <p className="text-xs text-[color:var(--fg-faint)] tabular">
            Projected EOM {formatCurrency(mtd.projectedEomSpend)}
          </p>
        </div>
      </div>

      <div className="relative mt-6 h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--border)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #36859A 0%, #0A84FF 60%, #5e9bff 100%)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.06), 0 6px 18px -6px rgba(10,132,255,0.6)",
          }}
        />
        {/* Pace marker — where we should be by today */}
        <PaceMarker dayOfMonth={mtd.dayOfMonth} daysInMonth={mtd.daysInMonth} />
      </div>

      <p className="mt-3 text-xs text-[color:var(--fg-faint)]">
        Vertical tick shows on-pace position for today
      </p>
    </FrostedCard>
  );
}

function PaceMarker({
  dayOfMonth,
  daysInMonth,
}: {
  dayOfMonth: number;
  daysInMonth: number;
}) {
  const pct = Math.min(100, Math.max(0, (dayOfMonth / daysInMonth) * 100));
  return (
    <div
      aria-hidden
      className="absolute inset-y-0"
      style={{ left: `${pct}%` }}
    >
      <div className="-ml-px h-full w-px bg-[color:var(--fg)] opacity-50" />
    </div>
  );
}

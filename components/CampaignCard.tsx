"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { FrostedCard } from "./FrostedCard";
import type { Campaign, DailyPoint } from "@/types/dashboard";
import { formatCurrency, formatNumber, liveSinceLabel } from "@/lib/format";

interface CampaignCardProps {
  campaign: Campaign;
  spend7d: number;
  clicks7d: number;
  conv7d: number;
  trend?: DailyPoint[];
  delay?: number;
}

export function CampaignCard({
  campaign,
  spend7d,
  clicks7d,
  conv7d,
  trend,
  delay = 0,
}: CampaignCardProps) {
  const cpa = conv7d > 0 ? spend7d / conv7d : 0;
  const enabled = campaign.status === "ENABLED";
  const hasData = (trend ?? []).length > 0 && spend7d > 0;
  const launchLabel = liveSinceLabel(campaign.launchedAt);

  return (
    <FrostedCard delay={delay} className="overflow-hidden">
      <div className="px-6 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold tracking-tight text-[color:var(--fg)] sm:text-lg">
              {campaign.name}
            </h3>
            <p className="mt-0.5 text-xs text-[color:var(--fg-faint)]">
              {campaign.channel} · {humanBidding(campaign.biddingStrategy)} · target CPA{" "}
              {formatCurrency(campaign.targetCpa)}
            </p>
          </div>
          <StatusPill enabled={enabled} />
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3 sm:gap-4">
          <Stat label="Spend 7d" value={formatCurrency(spend7d)} />
          <Stat label="Clicks" value={formatNumber(clicks7d)} />
          <Stat label="Conv" value={formatNumber(conv7d)} />
          <Stat
            label="CPA"
            value={cpa > 0 ? formatCurrency(cpa) : "—"}
            tone={cpa > 0 && cpa > campaign.targetCpa * 1.2 ? "warn" : "default"}
          />
        </div>
      </div>

      <div className="h-16 px-2">
        {hasData ? (
          <Sparkline data={trend ?? []} />
        ) : (
          <ZeroSparkline launchLabel={launchLabel} />
        )}
      </div>
    </FrostedCard>
  );
}

function StatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
        enabled
          ? "border-[color:var(--positive)]/30 text-[color:var(--positive)]"
          : "border-[color:var(--border)] text-[color:var(--fg-faint)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-[color:var(--positive)]" : "bg-[color:var(--fg-faint)]"}`}
      />
      {enabled ? "Enabled" : "Paused"}
    </span>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
        {label}
      </p>
      <p
        className={`font-display mt-1 text-lg font-semibold tabular ${
          tone === "warn" ? "text-[color:var(--accent-warm)]" : "text-[color:var(--fg)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Sparkline({ data }: { data: DailyPoint[] }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const series = data.map((d) => ({ date: d.date, spend: d.spend ?? 0 }));
  if (!mounted) return <div className="h-full w-full" />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series} margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#0A84FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="spend"
          stroke="#0A84FF"
          strokeWidth={1.5}
          fill="url(#sparkFill)"
          isAnimationActive
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ZeroSparkline({ launchLabel }: { launchLabel: string }) {
  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute inset-0 flex items-center justify-between px-5"
      >
        <span className="inline-flex items-center gap-2 text-xs text-[color:var(--fg-soft)]">
          <span className="live-dot" />
          <span>{launchLabel}</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--fg-faint)]">
          Data accumulating
        </span>
      </motion.div>
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--border-strong), transparent)",
        }}
      />
    </div>
  );
}

function humanBidding(strategy: string): string {
  return strategy
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

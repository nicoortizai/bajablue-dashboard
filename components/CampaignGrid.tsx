"use client";

import * as React from "react";
import { CampaignCard } from "./CampaignCard";
import type { Snapshot } from "@/types/dashboard";

interface CampaignGridProps {
  snapshot: Snapshot;
}

export function CampaignGrid({ snapshot }: CampaignGridProps) {
  // For now, all 7d metrics ride on the snapshot.byAdGroup7d rollups
  // (single campaign in seed). When we extend to multi-campaign, we'll
  // index by campaign.id.
  const totalSpend7d = snapshot.byAdGroup7d.reduce((acc, r) => acc + r.cost, 0);
  const totalClicks7d = snapshot.byAdGroup7d.reduce((acc, r) => acc + r.clicks, 0);
  const totalConv7d = snapshot.byAdGroup7d.reduce((acc, r) => acc + r.conv, 0);
  const trend7d = snapshot.thirtyDay.dailySeries.slice(-7);

  return (
    <section
      aria-label="Campaigns"
      className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-2"
    >
      {snapshot.campaigns.map((c, i) => (
        <CampaignCard
          key={c.id}
          campaign={c}
          spend7d={totalSpend7d}
          clicks7d={totalClicks7d}
          conv7d={totalConv7d}
          trend={trend7d}
          delay={i * 0.06}
        />
      ))}
    </section>
  );
}

import { loadLiveSnapshot } from "@/lib/data";
import { TopBar } from "@/components/TopBar";
import { HeroBand } from "@/components/HeroBand";
import { SpendGauge } from "@/components/SpendGauge";
import { CampaignGrid } from "@/components/CampaignGrid";
import { AdGroupBarChart } from "@/components/AdGroupBarChart";
import { ConversionDonut } from "@/components/ConversionDonut";
import { Footer } from "@/components/Footer";
import { TrendCharts } from "@/components/TrendCharts";
import { OrganicVsPaid } from "@/components/OrganicVsPaid";
import { TopOrganicQueries } from "@/components/TopOrganicQueries";
import { CompetitorSoV } from "@/components/CompetitorSoV";
import { AISearchVisibility } from "@/components/AISearchVisibility";
import { liveSinceLabel } from "@/lib/format";

// Server-rendered. Each live data source is independent — if its env vars
// aren't set, the corresponding section renders an "Activate" empty-state.
// We never crash a render because of a missing credential.
export const revalidate = 0;

export default async function DashboardPage() {
  const snapshot = await loadLiveSnapshot();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_SHA;
  const launchedAt = snapshot.campaigns[0]?.launchedAt;
  const liveLabel = launchedAt ? liveSinceLabel(launchedAt) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-10">
      <TopBar pulledAt={snapshot.meta.pulledAt} accountId="bajablue" />

      {/* Title block */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--fg-faint)]">
            {snapshot.meta.accountName} · Operator view
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Today, in three numbers.
          </h1>
        </div>
        {liveLabel ? (
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--border)] bg-[color:var(--bg-soft)] px-3 py-1.5 text-xs text-[color:var(--fg-soft)] backdrop-blur sm:self-auto">
            <span className="live-dot" />
            {liveLabel} · check back in a few hours
          </span>
        ) : null}
      </div>

      <HeroBand snapshot={snapshot} />

      <div className="mt-6 sm:mt-8">
        <SpendGauge snapshot={snapshot} />
      </div>

      <h2 className="font-display mt-12 mb-5 text-xl font-semibold tracking-tight sm:text-2xl">
        Campaigns
      </h2>
      <CampaignGrid snapshot={snapshot} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <AdGroupBarChart rows={snapshot.byAdGroup7d} />
        <ConversionDonut actions={snapshot.conversionActions} />
      </div>

      <h2 className="font-display mt-12 mb-5 text-xl font-semibold tracking-tight sm:text-2xl">
        30-day trend
      </h2>
      <TrendCharts data={snapshot.thirtyDay.dailySeries} />

      <div className="mt-12 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
          Search & AI visibility
        </h2>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
          Organic · Competitive · Generative
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <OrganicVsPaid
          organic={snapshot.organic}
          thirtyDay={snapshot.thirtyDay}
          gscSource={snapshot.sources.gsc}
          adsSource={snapshot.sources.ads}
        />
        <TopOrganicQueries
          organic={snapshot.organic}
          gscSource={snapshot.sources.gsc}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <CompetitorSoV
          competitors={snapshot.competitors}
          dataforseoSource={snapshot.sources.dataforseo}
        />
        <AISearchVisibility
          aiVisibility={snapshot.aiVisibility}
          dataforseoSource={snapshot.sources.dataforseo}
        />
      </div>

      <Footer pulledAt={snapshot.meta.pulledAt} commit={commit} />
    </div>
  );
}

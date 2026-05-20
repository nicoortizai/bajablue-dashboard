import { loadSnapshot } from "@/lib/data";
import { TopBar } from "@/components/TopBar";
import { HeroBand } from "@/components/HeroBand";
import { SpendGauge } from "@/components/SpendGauge";
import { CampaignGrid } from "@/components/CampaignGrid";
import { AdGroupBarChart } from "@/components/AdGroupBarChart";
import { ConversionDonut } from "@/components/ConversionDonut";
import { Footer } from "@/components/Footer";
import { TrendCharts } from "@/components/TrendCharts";
import { liveSinceLabel } from "@/lib/format";

export default function DashboardPage() {
  const snapshot = loadSnapshot();
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

      <Footer pulledAt={snapshot.meta.pulledAt} commit={commit} />
    </div>
  );
}

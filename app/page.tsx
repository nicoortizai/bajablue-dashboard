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
import { DeviceBreakdown } from "@/components/DeviceBreakdown";
import { Demographics } from "@/components/Demographics";
import { ScheduleHeatmap } from "@/components/ScheduleHeatmap";
import { KeywordTable } from "@/components/KeywordTable";
import { AdGallery } from "@/components/AdGallery";
import { SearchTermsLog } from "@/components/SearchTermsLog";
import { GeoMap } from "@/components/GeoMap";
import { SectionHeader } from "@/components/SectionHeader";
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
  const pulledAt = snapshot.meta.pulledAt;
  const meta = snapshot.meta;
  const totalConv = snapshot.thirtyDay?.totalConversions ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-10">
      <TopBar pulledAt={pulledAt} />

      {/* Title block */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--fg-faint)]">
            {snapshot.meta.accountName} · Performance view
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

      {/* ──────────── 01 · Campaigns & ad groups ──────────── */}
      <SectionHeader
        ordinal="01"
        eyebrow="The plumbing"
        title="Campaigns & ad groups"
        lede="One Search campaign, five ad groups. The auction is still picking its first horses."
      />
      <CampaignGrid snapshot={snapshot} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <AdGroupBarChart
          rows={snapshot.byAdGroup7d}
          pulledAt={pulledAt}
          currencyMeta={meta}
        />
        <ConversionDonut
          actions={snapshot.conversionActions}
          pulledAt={pulledAt}
        />
      </div>

      {/* ──────────── 02 · Device & audience ──────────── */}
      <SectionHeader
        ordinal="02"
        eyebrow="Who & where"
        title="Device, age, and gender"
        lede="Almost everything is mobile. Age/gender takes ~50 conversions before Google will report it."
      />
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <DeviceBreakdown
          today={snapshot.byDeviceToday}
          last7d={snapshot.byDevice7d}
          meta={meta}
        />
        <Demographics
          ages={snapshot.byAge7d}
          genders={snapshot.byGender7d}
          meta={meta}
          conversions={totalConv}
        />
      </div>

      {/* ──────────── 03 · Time ──────────── */}
      <SectionHeader
        ordinal="03"
        eyebrow="Timing"
        title="When the ads run"
        lede="Day-of-week × hour-of-day. The peak windows tell you when to hold budget back versus push."
      />
      <ScheduleHeatmap hourly={snapshot.byHour7d} meta={meta} />

      {/* ──────────── 04 · 30-day trend ──────────── */}
      <SectionHeader
        ordinal="04"
        eyebrow="The arc"
        title="30-day trend"
        lede="Spend, clicks, impressions — what shape is the campaign drawing?"
      />
      <TrendCharts
        data={snapshot.thirtyDay.dailySeries}
        pulledAt={pulledAt}
        currencyMeta={meta}
      />

      {/* ──────────── 05 · Keywords & ads ──────────── */}
      <SectionHeader
        ordinal="05"
        eyebrow="The bait"
        title="Every keyword. Every ad."
        lede="What we're bidding on, and the headlines Google's mixing in real time."
      />
      <KeywordTable keywords={snapshot.byKeyword7d} meta={meta} />
      <div className="mt-5">
        <AdGallery ads={snapshot.byAd7d} meta={meta} />
      </div>

      {/* ──────────── 06 · The catch ──────────── */}
      <SectionHeader
        ordinal="06"
        eyebrow="The catch"
        title="Search terms & geography"
        lede="What people actually typed, and where they typed it from."
      />
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <SearchTermsLog terms={snapshot.searchTerms7d} meta={meta} />
        <GeoMap geo={snapshot.geo7d} meta={meta} />
      </div>

      {/* ──────────── 07 · Search & AI visibility ──────────── */}
      <SectionHeader
        ordinal="07"
        eyebrow="The neighborhood"
        title="Search & AI visibility"
        lede="Organic, competitive, and generative — paid ads are only one current in the channel."
        trailing={
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--fg-faint)]">
            Organic · Competitive · Generative
          </p>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <OrganicVsPaid
          organic={snapshot.organic}
          thirtyDay={snapshot.thirtyDay}
          gscSource={snapshot.sources.gsc}
          adsSource={snapshot.sources.ads}
          pulledAt={pulledAt}
        />
        <TopOrganicQueries
          organic={snapshot.organic}
          gscSource={snapshot.sources.gsc}
          pulledAt={pulledAt}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <CompetitorSoV
          competitors={snapshot.competitors}
          dataforseoSource={snapshot.sources.dataforseo}
          pulledAt={pulledAt}
        />
        <AISearchVisibility
          aiVisibility={snapshot.aiVisibility}
          dataforseoSource={snapshot.sources.dataforseo}
          pulledAt={pulledAt}
        />
      </div>

      <Footer pulledAt={pulledAt} commit={commit} />
    </div>
  );
}

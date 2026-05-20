import { shortDate } from "@/lib/format";

interface FooterProps {
  pulledAt: string;
  commit?: string;
}

export function Footer({ pulledAt, commit }: FooterProps) {
  const shortCommit = commit ? commit.slice(0, 7) : "dev";
  const pulled = new Date(pulledAt);
  const pulledLabel = `${shortDate(pulledAt)} ${pulled.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  })}`;
  return (
    <footer className="mt-12 border-t border-[color:var(--border)] pt-6 pb-10 text-[11px] text-[color:var(--fg-faint)]">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <p>
          Data refreshed hourly via Google Ads API · last pull {pulledLabel}
        </p>
        <p className="tabular">
          build <span className="opacity-80">{shortCommit}</span>
        </p>
      </div>
    </footer>
  );
}

import seedJson from "@/seed-snapshot.json";
import type { Snapshot } from "@/types/dashboard";

// Cast at the boundary. The JSON shape is hand-curated to match
// the Snapshot type. If they drift, TS will surface the mismatch
// when we extend the type rather than silently coerce.
const seed: Snapshot = seedJson as unknown as Snapshot;

export function loadSnapshot(): Snapshot {
  return seed;
}

export type { Snapshot } from "@/types/dashboard";

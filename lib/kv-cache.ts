// Tiny cache abstraction over Vercel KV with graceful fallback.
//
// • If KV_REST_API_URL + KV_REST_API_TOKEN are set, we use Vercel KV (Upstash).
// • Otherwise we fall back to an in-process Map. Edge functions cold-start
//   often so the Map is not durable, but it removes the "must have KV"
//   blocker and still saves duplicate calls within a single invocation.
//
// Keys are namespaced by source ("ads:campaigns_30d"), values JSON-serialized.

import { checkSource } from "./env";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Lazy KV client — only imported when env is present so projects without
// KV don't pay the bundle cost (@vercel/kv is a thin wrapper around fetch).
async function kv(): Promise<{
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown, opts: { ex: number }) => Promise<unknown>;
} | null> {
  if (!checkSource("kv").ready) return null;
  try {
    const mod = await import("@vercel/kv");
    return mod.kv as unknown as {
      get: <T>(key: string) => Promise<T | null>;
      set: (
        key: string,
        value: unknown,
        opts: { ex: number },
      ) => Promise<unknown>;
    };
  } catch {
    return null;
  }
}

// In-memory fallback (per isolate). Edge isolates may be reused for a few
// minutes which is enough to dedupe a render burst.
const memory = new Map<string, CacheEntry<unknown>>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = await kv();
  if (client) {
    try {
      const v = await client.get<T>(key);
      return v ?? null;
    } catch {
      // Fall through to memory cache on transient KV failure.
    }
  }
  const entry = memory.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds = 60 * 60 * 4,
): Promise<void> {
  const client = await kv();
  if (client) {
    try {
      await client.set(key, value, { ex: ttlSeconds });
    } catch {
      // Fall through — still cache in memory below.
    }
  }
  memory.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Run `fetcher` only on miss. Returns cached value when fresh, otherwise
 * fetches, caches, and returns. Errors from the fetcher are NOT cached —
 * callers see the raw rejection.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

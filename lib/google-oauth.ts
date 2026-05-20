// Minimal OAuth2 refresh-token → access-token exchange.
//
// We exchange the long-lived refresh token for a short-lived access token
// against Google's token endpoint. The result is cached for ~50 minutes
// (Google issues 1h tokens) so concurrent calls share one exchange.

import { withCache } from "./kv-cache";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

/**
 * Exchange a refresh token for an access token. Cached for 50 minutes.
 * `cacheKey` lets callers segregate Ads vs GSC tokens when they use
 * different OAuth clients.
 */
export async function getAccessToken(opts: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  cacheKey: string;
}): Promise<string> {
  return withCache(
    `oauth:${opts.cacheKey}`,
    50 * 60,
    async () => {
      const body = new URLSearchParams({
        client_id: opts.clientId,
        client_secret: opts.clientSecret,
        refresh_token: opts.refreshToken,
        grant_type: "refresh_token",
      });
      const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        // Don't let Next cache this — the response is short-lived.
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `OAuth token exchange failed: ${res.status} ${res.statusText} ${text}`,
        );
      }
      const json = (await res.json()) as TokenResponse;
      return json.access_token;
    },
  );
}

// Lightweight cookie-based gate. Single shared password lives in
// ADMIN_PASSWORD env var. Cookie stores a deterministic token derived
// from the password so it survives restarts but can be revoked by
// rotating the env var.

const COOKIE_NAME = "auth-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p || p.length === 0) {
    // Dev fallback so the gate works locally without env wiring.
    // In production, set ADMIN_PASSWORD on Vercel.
    return "bajablue";
  }
  return p;
}

// Web Crypto digest — works in both edge and node runtimes.
async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

export async function tokenForPassword(pw: string): Promise<string> {
  // Salted so the token isn't a bare password hash.
  return sha256(`bajaswarm.v1.${pw}`);
}

export async function expectedToken(): Promise<string> {
  return tokenForPassword(getAdminPassword());
}

export async function verifyPassword(pw: string): Promise<boolean> {
  return pw === getAdminPassword();
}

export async function verifyToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedToken();
  // Constant-time-ish compare. Lengths are equal hex strings.
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export const AUTH_COOKIE = COOKIE_NAME;
export const AUTH_MAX_AGE = COOKIE_MAX_AGE;

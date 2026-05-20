import { signIn } from "./actions";

export const metadata = {
  title: "Sign in · Bajablue Performance",
};

interface LoginPageProps {
  searchParams: Promise<{ from?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const from = sp.from ?? "/";
  const hasError = sp.error === "1";

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#0a1c24] px-6 text-[#f4efe7]">
      {/* Atmospheric background — ocean dive wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 20%, rgba(54,133,154,0.45) 0%, rgba(10,28,36,0) 60%), radial-gradient(45% 40% at 75% 80%, rgba(228,168,83,0.18) 0%, rgba(10,28,36,0) 60%), linear-gradient(180deg, #0a1c24 0%, #061318 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(244,239,231,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#36859A]/15 backdrop-blur-2xl">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="15.5" cy="7.5" r="1.7" fill="#36859A" />
              <path
                d="M5 9c1.7-1.4 3.6-2 5.6-1.8L13 7.7"
                stroke="#36859A"
                strokeWidth="1.7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M9.8 11.2c2.4.3 4.6 1 6.5 1.9 1.4.7 2.6 1 3.7.7"
                stroke="#36859A"
                strokeWidth="1.7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M3.5 16.5c1.8-1.2 3.5-1.2 5.3 0s3.5 1.2 5.3 0 3.5-1.2 5.3 0"
                stroke="#4ea3b9"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.75"
                fill="none"
              />
            </svg>
          </span>
          <h1
            className="font-display text-3xl font-semibold tracking-tight"
            style={{
              fontFamily:
                "var(--font-display, 'Fraunces'), Georgia, ui-serif, serif",
            }}
          >
            Bajablue Performance
          </h1>
          <p className="text-sm text-white/55">Enter password to continue</p>
        </div>

        <form
          action={signIn}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          <input type="hidden" name="from" value={from} />
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="mt-2 block w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-[#36859A] focus:bg-black/50 focus:ring-2 focus:ring-[#36859A]/30"
              placeholder="••••••••"
            />
          </label>

          {hasError ? (
            <p className="mt-3 text-sm text-[#e36a5e]">
              Incorrect password. Try again.
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#36859A] to-[#2a6c80] px-4 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:from-[#3f95ab] hover:to-[#2f7a91] active:scale-[0.99]"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/35">
          Bajablue · operator only
        </p>
      </div>
    </main>
  );
}

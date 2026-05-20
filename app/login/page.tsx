import { signIn } from "./actions";

export const metadata = {
  title: "Sign in · BajaSwarm",
};

interface LoginPageProps {
  searchParams: Promise<{ from?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const from = sp.from ?? "/";
  const hasError = sp.error === "1";

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[#06090f] px-6 text-white">
      {/* Atmospheric background — soft aurora wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 20%, rgba(54,133,154,0.35) 0%, rgba(6,9,15,0) 60%), radial-gradient(45% 40% at 75% 80%, rgba(10,132,255,0.28) 0%, rgba(6,9,15,0) 60%), linear-gradient(180deg, #06090f 0%, #03050a 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl">
            <span
              className="bg-gradient-to-br from-[#0A84FF] to-[#36859A] bg-clip-text text-xl font-semibold tracking-tight text-transparent"
              style={{ fontFamily: "var(--font-display)" }}
            >
              B
            </span>
          </div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            BajaSwarm Dashboard
          </h1>
          <p className="text-sm text-white/50">Enter password to continue</p>
        </div>

        <form
          action={signIn}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          <input type="hidden" name="from" value={from} />
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="mt-2 block w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder-white/30 outline-none transition focus:border-[#0A84FF] focus:bg-black/50 focus:ring-2 focus:ring-[#0A84FF]/30"
              placeholder="••••••••"
            />
          </label>

          {hasError ? (
            <p className="mt-3 text-sm text-[#FF6B6B]">
              Incorrect password. Try again.
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#0A84FF] to-[#0964c8] px-4 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:from-[#1d92ff] hover:to-[#0a6fd6] active:scale-[0.99]"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          Operator-only · Nico Ortiz
        </p>
      </div>
    </main>
  );
}

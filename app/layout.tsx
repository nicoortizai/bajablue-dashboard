import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeBootScript, ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  // Fraunces is a variable font — let the weight axis stay continuous so we
  // can use 500/600/700 across the dashboard without re-fetching subsets.
  // The optical-size axis ("opsz") subtly nudges headings to look less soft.
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Bajablue Performance",
  description:
    "Bajablue Performance — Google Ads dashboard. Daily campaign pulse, honest data, source-attributed metrics.",
  applicationName: "Bajablue Performance",
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Bajablue Performance",
    description: "Bajablue Performance — Google Ads dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Bajablue Performance",
    description: "Bajablue Performance — Google Ads dashboard.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1c24" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      style={{
        // Body uses Inter, display uses Fraunces — Bajablue brand pairing.
        // System fallbacks keep the layout tight if the font fetch is delayed.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...({
          "--font-body-stack":
            "var(--font-body), -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          "--font-display-stack":
            "var(--font-display), 'Fraunces', Georgia, ui-serif, 'Iowan Old Style', 'Apple Garamond', serif",
        } as React.CSSProperties),
      }}
    >
      <head>
        <ThemeBootScript />
      </head>
      <body className="min-h-full bg-atmosphere">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

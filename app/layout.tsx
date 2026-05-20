import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeBootScript, ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BajaSwarm · Ad Dashboard",
  description:
    "Daily Google Ads pulse across Nico's operator portfolio. Apple-style. Single page. No browser tabs needed.",
  applicationName: "BajaSwarm Dashboard",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "BajaSwarm · Ad Dashboard",
    description: "Daily ad pulse, operator-style.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#06090f" },
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
      className={`${inter.variable} h-full antialiased`}
      style={{
        // Provide font stacks to globals.css via custom props.
        // Body uses Inter; display falls back to SF Pro Display on Apple
        // devices so the dashboard inherits the system feel automatically.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...({
          "--font-body-stack":
            "var(--font-body), -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
          "--font-display-stack":
            "var(--font-body), -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
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

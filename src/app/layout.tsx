import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";
import ThemeProvider from "@/components/providers/ThemeProvider";

/* Inter drives the UI. It was built for dense product interfaces — its tall
   x-height and tabular figures stay legible at the 11–13px used across the
   dashboards, where Montserrat's wide geometric letterforms lose clarity. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* Montserrat is retained for brand/marketing headlines via `font-display`. */
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "ZeeShaoor.pk",
    template: "%s · ZeeShaoor.pk",
  },
  description: "Pakistan's No. 1 Educational Software and Paper Generator.",
};

/* `themeColor` responds to the active palette so mobile browser chrome
   matches the app instead of flashing white behind a dark UI. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#08080d" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${montserrat.variable} bg-bg font-sans text-fg antialiased`}
      >
        <ThemeProvider>
          <a href="#main-content" className="zs-sr-only zs-focus-reveal">
            Skip to main content
          </a>
          <SessionWrapper>{children}</SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

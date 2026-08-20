import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";
import ThemeProvider from "@/components/providers/ThemeProvider";

/* ================================================================
   SITE CONSTANTS — brand ki har jagah repeat na karni pare
   ================================================================ */
const SITE_URL = "https://zeeshaoor.pk";
const SITE_NAME = "ZeeShaoor.pk";
const SITE_DESC =
  "A paper-generation workspace for Pakistani classrooms. Choose the board, class, subject and chapters — get a board-pattern paper with its answer key, in English or Urdu.";

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

/* ================================================================
   THEME — runs before first paint, so the correct theme is on <html>
   before anything renders. Lives in the root layout (not in a page),
   because a <script> rendered inside a page component is never
   executed on client-side navigation.
   ================================================================ */
const THEME_INIT = `(function(){try{
var s=localStorage.getItem('zeeshaoor-theme');
var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
document.documentElement.dataset.theme=t;
}catch(e){document.documentElement.dataset.theme='dark';}})();`;

/* ================================================================
   STRUCTURED DATA — how Google understands the product
   ================================================================ */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      slogan: "Awakening intellect, anchoring truth",
      email: "zeeshaoorofficial@gmail.com",
      telephone: "+92-316-0404585",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESC,
      inLanguage: ["en-PK", "ur-PK"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESC,
      offers: [
        {
          "@type": "Offer",
          name: "ZeeShaoor Pro",
          price: "1000",
          priceCurrency: "PKR",
          category: "Subscription",
        },
        {
          "@type": "Offer",
          name: "Institute",
          price: "2000",
          priceCurrency: "PKR",
          category: "Subscription",
        },
      ],
    },
  ],
};

/* ================================================================
   METADATA
   ================================================================ */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ZeeShaoor.pk — Set a full board paper in ninety seconds",
    template: "%s · ZeeShaoor.pk",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  generator: "Next.js",
  category: "education",
  keywords: [
    "paper generator Pakistan",
    "BISE past papers",
    "board paper generator",
    "Class 9 Physics paper",
    "Class 10 Chemistry paper",
    "Urdu English question paper",
    "school management software Pakistan",
    "online test system",
    "matric preparation",
    "FBISE",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "ZeeShaoor.pk — Set a full board paper in ninety seconds",
    description: SITE_DESC,
    locale: "en_PK",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ZeeShaoor.pk — paper generation workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeeShaoor.pk — Set a full board paper in ninety seconds",
    description: SITE_DESC,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* `themeColor` responds to the active palette so mobile browser chrome
   matches the app instead of flashing white behind a dark UI. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#08080d" },
  ],
  colorScheme: "dark light",
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
        {/* Theme first — before any painted content is parsed */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />

        <ThemeProvider>
          <a href="#main-content" className="zs-sr-only zs-focus-reveal">
            Skip to main content
          </a>
          <SessionWrapper>{children}</SessionWrapper>
        </ThemeProvider>

        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </body>
    </html>
  );
}
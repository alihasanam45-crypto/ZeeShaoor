import withBundleAnalyzer from "@next/bundle-analyzer";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` on style-src is required by Tailwind's runtime style
 * injection and the framer-motion / recharts inline transforms; styles are not
 * a script execution vector, so this is an accepted residual.
 *
 * `'unsafe-eval'` is allowed in development only — the Turbopack dev runtime
 * and React Refresh need it. Production gets no eval. script-src still carries
 * `'unsafe-inline'` because Next.js emits its hydration bootstrap inline
 * without a nonce; moving to a per-request nonce requires opting every route
 * out of static rendering and is tracked as a follow-up in the report.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // XHR/fetch targets. Same-origin only — no third-party exfiltration channel.
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  // Clickjacking: the modern replacement for X-Frame-Options.
  "frame-ancestors 'none'",
  // Blocks <base href> hijacking of every relative URL on the page.
  "base-uri 'self'",
  // Forms may only post back to this origin — kills injected exfil forms.
  "form-action 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Kept alongside CSP frame-ancestors for pre-CSP3 browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Never leak a full path (which can carry record ids) to a third-party origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny hardware and ambient capabilities the platform never uses.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
  },
  // Cross-origin isolation: stops other origins referencing our windows or
  // reading our resources.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

// NOTE: X-XSS-Protection was removed deliberately. The legacy auditor it
// enabled is gone from every current browser, and its filter was itself
// exploitable as a cross-site leak vector. CSP replaces it.

if (isProd) {
  // Production-only: sending HSTS from localhost would pin developers out of
  // their own http:// dev server for two years.
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const config = {
  reactStrictMode: true,

  // Do not advertise the server technology in every response.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Authenticated JSON must never be stored by a shared or browser cache.
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default analyzer(config);

/** Security headers applied to all routes in production and preview. */
const isProduction = process.env.NODE_ENV === "production";

export const securityHeaders: { key: string; value: string }[] = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paymongo.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://utfs.io https://images.unsplash.com https://lh3.googleusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://api.paymongo.com https://api.resend.com https://uploadthing.com https://utfs.io",
      "frame-src 'self' https://js.paymongo.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

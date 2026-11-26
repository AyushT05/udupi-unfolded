const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];
// Photos and sounds keep their file names when you replace them, so they get a short cache plus background refresh; fonts never change.
const cache = (v) => [{ key: "Cache-Control", value: v }];
export default {
  reactStrictMode: true, poweredByHeader: false, compress: true,
  async headers() {
    return [
      { source: "/:path*", headers: security },
      { source: "/img/:path*", headers: cache("public, max-age=86400, stale-while-revalidate=604800") },
      { source: "/sfx/:path*", headers: cache("public, max-age=86400, stale-while-revalidate=604800") },
      { source: "/fonts/:path*", headers: cache("public, max-age=31536000, immutable") },
    ];
  },
};

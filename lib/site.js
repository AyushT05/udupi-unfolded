// The public address of the site, used for canonical links, the sitemap and social cards.
// Set NEXT_PUBLIC_SITE_URL (for example https://udupi.example.com) in production; on Vercel the production domain is picked up automatically.
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000")).replace(/\/$/, "");

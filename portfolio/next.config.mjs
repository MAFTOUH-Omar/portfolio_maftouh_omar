/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Streaming metadata puts <title>, canonical, hreflang and robots at the end
  // of <body> on dynamic pages (/blog reads ?q=) for every client not on
  // Next's "HTML-limited bot" list — Googlebot, GPTBot, ClaudeBot,
  // PerplexityBot and SEO crawlers included. Always block on metadata so it
  // lands in <head>; static pages are unaffected (resolved at build time).
  htmlLimitedBots: /.*/,
  experimental: {
    agentUpgrade: "security",
    // Required by app/global-not-found.tsx (two root layouts: fr and en).
    globalNotFound: true,
  },
  images: {
    // AVIF first (~20-30% smaller than WebP), WebP fallback.
    formats: ["image/avif", "image/webp"],
    // Optimized images stay cached on Vercel's CDN for 31 days.
    minimumCacheTTL: 2678400,
  },
  async headers() {
    // Files in /public are not content-hashed, so Vercel serves them with
    // max-age=0 by default. Tech icons almost never change: cache them for a
    // month in the browser, refreshed in the background after that.
    const longCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=2592000, stale-while-revalidate=604800",
      },
    ];
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    return [
      { source: "/icons/:file*", headers: longCache },
      { source: "/flags/:file*", headers: longCache },
      { source: "/:path*", headers: securityHeaders },
      // /admin isn't a target for clickjacking framing of anything valuable
      // elsewhere, but there's no reason to allow it to be framed at all.
      { source: "/admin/:path*", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
    ];
  },
};

export default nextConfig;

import fs from "node:fs";
import path from "node:path";

/**
 * The site used to be English-only at /blog/<slug>. French now owns /blog,
 * so any post that exists only in English gets a permanent redirect to
 * /en/blog/<slug> to keep old links and indexed URLs working.
 */
function legacyBlogRedirects() {
  const slugs = (locale) => {
    const dir = path.join(process.cwd(), "content", locale);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.slice(0, -".mdx".length));
  };
  const fr = new Set(slugs("fr"));
  return slugs("en")
    .filter((slug) => !fr.has(slug))
    .map((slug) => ({
      source: `/blog/${slug}`,
      destination: `/en/blog/${slug}`,
      permanent: true,
    }));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
    return [
      { source: "/icons/:file*", headers: longCache },
      { source: "/flags/:file*", headers: longCache },
    ];
  },
  async redirects() {
    return legacyBlogRedirects();
  },
};

export default nextConfig;

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
  async redirects() {
    return legacyBlogRedirects();
  },
};

export default nextConfig;

import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

/**
 * Everything is public, including /og (social cards) — Twitterbot and
 * LinkedInBot honour robots.txt, so blocking it would break link previews.
 * AI search crawlers are allowed too: being cited by ChatGPT / Perplexity /
 * Claude when someone asks for "a full stack developer in Morocco" is a plus.
 *
 * /api/ only serves JSON (infinite scroll), the visit beacon and the MCP
 * endpoint — nothing a page needs to render, nothing worth indexing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

/**
 * Everything is public, including /og (social cards) — Twitterbot and
 * LinkedInBot honour robots.txt, so blocking it would break link previews.
 * AI search crawlers are allowed too: being cited by ChatGPT / Perplexity /
 * Claude when someone asks for "a full stack developer in Morocco" is a plus.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

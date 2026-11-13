import { getBlogPosts, getPostLocales } from "@/data/blog";
import { DATA } from "@/data/resume";
import { languageAlternates, localizePath, locales, type Locale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

/**
 * One <url> per locale, each listing its translations (xhtml:link hreflang)
 * so Google pairs / and /en. Only canonical, indexable URLs are listed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date().toISOString().split("T")[0];

  // Home page images help the portfolio show up in Google Images.
  const homeImages = [
    DATA.avatarUrl,
    ...DATA.projects.flatMap((project) => project.images),
  ].map((src) => absoluteUrl(src));

  const home: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: absoluteUrl(localizePath(locale, "/")),
    lastModified: buildDate,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages: languageAlternates("/") },
    images: homeImages,
  }));

  const postsByLocale = await Promise.all(
    locales.map(async (locale) => [locale, await getBlogPosts(locale)] as const)
  );
  const localesWithPosts: Locale[] = postsByLocale
    .filter(([, posts]) => posts.length > 0)
    .map(([locale]) => locale);

  // Empty blog listings are noindex, so they stay out of the sitemap.
  const blogIndexes: MetadataRoute.Sitemap = postsByLocale
    .filter(([, posts]) => posts.length > 0)
    .map(([locale, posts]) => ({
      url: absoluteUrl(localizePath(locale, "/blog")),
      lastModified: posts[0].metadata.updatedAt ?? posts[0].metadata.publishedAt,
      changeFrequency: "weekly",
      priority: 0.7,
      ...(localesWithPosts.length > 1
        ? { alternates: { languages: languageAlternates("/blog", localesWithPosts) } }
        : {}),
    }));

  const posts: MetadataRoute.Sitemap = postsByLocale.flatMap(([locale, list]) =>
    list.map((post) => {
      const translations = getPostLocales(post.slug);
      return {
        url: absoluteUrl(localizePath(locale, `/blog/${post.slug}`)),
        lastModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
        changeFrequency: "yearly" as const,
        priority: 0.6,
        ...(translations.length > 1
          ? { alternates: { languages: languageAlternates(`/blog/${post.slug}`, translations) } }
          : {}),
      };
    })
  );

  return [...home, ...blogIndexes, ...posts];
}

import { getBlogPosts } from "@/data/blog";
import { getSiteData } from "@/data/resume";
import { localizePath, locales } from "@/lib/i18n";
import { absoluteUrl, SITE_URL } from "@/lib/site";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const data = await getSiteData();
  const postsByLocale = await Promise.all(locales.map((locale) => getBlogPosts(locale)));
  const items = postsByLocale
    .flatMap((posts, index) =>
      posts.map((post) => ({ post, locale: locales[index] }))
    )
    .sort(
      (a, b) =>
        new Date(b.post.metadata.publishedAt).getTime() -
        new Date(a.post.metadata.publishedAt).getTime()
    );

  const itemsXml = items
    .map(({ post, locale }) => {
      const url = absoluteUrl(localizePath(locale, `/blog/${post.slug}`));
      return `
    <item>
      <title>${escapeXml(post.metadata.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.metadata.summary)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(data.fullName)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(data.description.en)}</description>${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

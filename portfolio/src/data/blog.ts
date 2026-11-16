import { and, desc, eq } from "drizzle-orm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { db } from "@/db/client";
import { postTags, posts as postsTable, tags as tagsTable } from "@/db/schema";
import { locales, type Locale } from "@/lib/i18n";

type Metadata = {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
  image?: string;
};

export type PostTag = { slug: string; name: string };

export type Post = {
  source: string;
  metadata: Metadata;
  slug: string;
  locale: Locale;
  tags: PostTag[];
};

/** Everything a post list item renders — skips the markdown->HTML pass,
 *  which only the single-post page actually needs. */
export type PostSummary = Omit<Post, "source">;

type PostRow = typeof postsTable.$inferSelect;

export async function markdownToHTML(markdown: string) {
  const p = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      // https://rehype-pretty.pages.dev/#usage
      theme: {
        light: "min-light",
        dark: "min-dark",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return p.toString();
}

async function toPostSummary(row: PostRow): Promise<PostSummary> {
  const tagRows = await db
    .select({ slug: tagsTable.slug, nameFr: tagsTable.nameFr, nameEn: tagsTable.nameEn })
    .from(postTags)
    .innerJoin(tagsTable, eq(postTags.tagId, tagsTable.id))
    .where(eq(postTags.postId, row.id));

  const publishedAt = (row.publishedAt ?? row.updatedAt).toISOString();

  return {
    metadata: {
      title: row.title,
      summary: row.summary,
      publishedAt,
      updatedAt: row.updatedAt.toISOString(),
      image: row.coverImage ?? undefined,
    },
    slug: row.slug,
    locale: row.locale as Locale,
    tags: tagRows.map((tag) => ({
      slug: tag.slug,
      name: row.locale === "fr" ? tag.nameFr : tag.nameEn,
    })),
  };
}

async function toPost(row: PostRow): Promise<Post> {
  const summary = await toPostSummary(row);
  return { ...summary, source: await markdownToHTML(row.contentMd) };
}

export async function postExists(locale: Locale, slug: string): Promise<boolean> {
  // Slugs come from the URL: only accept plain file names.
  if (!/^[a-z0-9-]+$/i.test(slug)) return false;
  const [row] = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(and(eq(postsTable.slug, slug), eq(postsTable.locale, locale), eq(postsTable.status, "published")))
    .limit(1);
  return !!row;
}

/** Returns null when the post doesn't exist (or isn't published) in that locale. */
export async function getPost(locale: Locale, slug: string): Promise<Post | null> {
  const [row] = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.slug, slug), eq(postsTable.locale, locale), eq(postsTable.status, "published")))
    .limit(1);
  if (!row) return null;
  return toPost(row);
}

/** Published posts of a locale, newest first. */
export async function getBlogPosts(locale: Locale): Promise<Post[]> {
  const rows = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.locale, locale), eq(postsTable.status, "published")))
    .orderBy(desc(postsTable.publishedAt));
  return Promise.all(rows.map(toPost));
}

/** Published posts of a locale, newest first — metadata only, no markdown
 *  render. Used by list views (index, tag archive, infinite scroll). */
export async function getBlogPostSummaries(locale: Locale): Promise<PostSummary[]> {
  const rows = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.locale, locale), eq(postsTable.status, "published")))
    .orderBy(desc(postsTable.publishedAt));
  return Promise.all(rows.map(toPostSummary));
}

/** One page of `limit` published posts starting at `offset`, newest first,
 *  plus whether more remain — backs the blog index's infinite scroll. */
export async function getBlogPostsPage(
  locale: Locale,
  offset: number,
  limit: number
): Promise<{ posts: PostSummary[]; hasMore: boolean }> {
  const rows = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.locale, locale), eq(postsTable.status, "published")))
    .orderBy(desc(postsTable.publishedAt))
    .limit(limit + 1)
    .offset(offset);
  const hasMore = rows.length > limit;
  const posts = await Promise.all(rows.slice(0, limit).map(toPostSummary));
  return { posts, hasMore };
}

/** Published posts of a locale carrying the given tag, newest first. */
export async function getBlogPostsByTag(locale: Locale, tagSlug: string): Promise<PostSummary[]> {
  const posts = await getBlogPostSummaries(locale);
  return posts.filter((post) => post.tags.some((tag) => tag.slug === tagSlug));
}

/** All distinct tag slugs used by at least one published post in that locale. */
export async function getUsedTagSlugs(locale: Locale): Promise<string[]> {
  const posts = await getBlogPostSummaries(locale);
  const slugs = new Set(posts.flatMap((post) => post.tags.map((tag) => tag.slug)));
  return [...slugs];
}

/** Locales in which a given slug is published (used for hreflang). */
export async function getPostLocales(slug: string): Promise<Locale[]> {
  const rows = await db
    .select({ locale: postsTable.locale })
    .from(postsTable)
    .where(and(eq(postsTable.slug, slug), eq(postsTable.status, "published")));
  const found = new Set(rows.map((row) => row.locale));
  return locales.filter((locale) => found.has(locale));
}

/** Slugs published in every locale, i.e. posts the language switcher can map 1:1. */
export async function getTranslatedSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: postsTable.slug, locale: postsTable.locale })
    .from(postsTable)
    .where(eq(postsTable.status, "published"));

  const bySlug = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = bySlug.get(row.slug) ?? new Set<string>();
    set.add(row.locale);
    bySlug.set(row.slug, set);
  }
  return [...bySlug.entries()]
    .filter(([, present]) => locales.every((locale) => present.has(locale)))
    .map(([slug]) => slug);
}

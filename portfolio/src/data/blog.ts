import { cache } from "react";
import { and, count, desc, eq, ilike, max, or } from "drizzle-orm";
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
  /** Optional <title> override set in the admin / MCP (falls back to `title`). */
  seoTitle?: string;
  /** Optional meta description override (falls back to `summary`). */
  seoDescription?: string;
};

export type PostTag = { slug: string; name: string };

/** A tag plus how many published posts of a locale carry it. */
export type TagWithCount = PostTag & { count: number; lastModified: string };

/**
 * A tag page becomes an indexable hub once this many posts share the tag.
 * Below that, the listing only repeats the single post it links to (thin,
 * duplicate content), so it stays `noindex` and isn't linked from the site.
 */
export const TAG_HUB_MIN_POSTS = 2;

export type Post = {
  /** DB id — keys the post's likes and comments (/api/blog/posts/[id]/…). */
  id: string;
  source: string;
  metadata: Metadata;
  slug: string;
  locale: Locale;
  tags: PostTag[];
  wordCount: number;
};

/** Everything a post list item renders — skips the markdown->HTML pass,
 *  which only the single-post page actually needs. */
export type PostSummary = Omit<Post, "source" | "wordCount">;

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
    id: row.id,
    metadata: {
      title: row.title,
      summary: row.summary,
      publishedAt,
      updatedAt: row.updatedAt.toISOString(),
      image: row.coverImage ?? undefined,
      seoTitle: row.metaTitle?.trim() || undefined,
      seoDescription: row.metaDescription?.trim() || undefined,
    },
    slug: row.slug,
    locale: row.locale as Locale,
    tags: tagRows.map((tag) => ({
      slug: tag.slug,
      name: row.locale === "fr" ? tag.nameFr : tag.nameEn,
    })),
  };
}

/** Rough word count of a Markdown body (code fences included — they are
 *  read too). Drives the reading-time label and BlogPosting.wordCount. */
function countWords(markdown: string): number {
  return markdown
    .replace(/[#>*_`~[\]()!|-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

async function toPost(row: PostRow): Promise<Post> {
  const summary = await toPostSummary(row);
  return {
    ...summary,
    source: await markdownToHTML(row.contentMd),
    wordCount: countWords(row.contentMd),
  };
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

/** Returns null when the post doesn't exist (or isn't published) in that locale.
 *  Memoized per request: generateMetadata and the page share one query and
 *  one Markdown render. */
export const getPost = cache(async (locale: Locale, slug: string): Promise<Post | null> => {
  const [row] = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.slug, slug), eq(postsTable.locale, locale), eq(postsTable.status, "published")))
    .limit(1);
  if (!row) return null;
  return toPost(row);
});

/** Number of published posts in a locale — a COUNT, no row loading. */
export async function countPublishedPosts(locale: Locale): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(postsTable)
    .where(and(eq(postsTable.locale, locale), eq(postsTable.status, "published")));
  return Number(row?.total ?? 0);
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
 *  plus whether more remain — backs the blog index's infinite scroll.
 *  `query` matches against the title and summary (case-insensitive). */
export async function getBlogPostsPage(
  locale: Locale,
  offset: number,
  limit: number,
  query?: string
): Promise<{ posts: PostSummary[]; hasMore: boolean }> {
  const needle = query?.trim();
  const conditions = [eq(postsTable.locale, locale), eq(postsTable.status, "published")];
  if (needle) {
    conditions.push(
      or(ilike(postsTable.title, `%${needle}%`), ilike(postsTable.summary, `%${needle}%`))!
    );
  }

  const rows = await db
    .select()
    .from(postsTable)
    .where(and(...conditions))
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

/** Every tag used by at least one published post in that locale, with its
 *  post count and latest post update — one grouped query, sorted by name. */
export async function getTagCounts(locale: Locale): Promise<TagWithCount[]> {
  const rows = await db
    .select({
      slug: tagsTable.slug,
      nameFr: tagsTable.nameFr,
      nameEn: tagsTable.nameEn,
      count: count(),
      lastModified: max(postsTable.updatedAt),
    })
    .from(postTags)
    .innerJoin(postsTable, eq(postTags.postId, postsTable.id))
    .innerJoin(tagsTable, eq(postTags.tagId, tagsTable.id))
    .where(and(eq(postsTable.locale, locale), eq(postsTable.status, "published")))
    .groupBy(tagsTable.slug, tagsTable.nameFr, tagsTable.nameEn);

  return rows
    .map((row) => ({
      slug: row.slug,
      name: locale === "fr" ? row.nameFr : row.nameEn,
      count: Number(row.count),
      lastModified: new Date(row.lastModified ?? Date.now()).toISOString(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** All distinct tag slugs used by at least one published post in that locale. */
export async function getUsedTagSlugs(locale: Locale): Promise<string[]> {
  return (await getTagCounts(locale)).map((tag) => tag.slug);
}

/** Tags with enough posts to deserve an indexable page (see TAG_HUB_MIN_POSTS)
 *  — the only tag pages linked from the site and listed in the sitemap. */
export async function getHubTags(locale: Locale): Promise<TagWithCount[]> {
  return (await getTagCounts(locale)).filter((tag) => tag.count >= TAG_HUB_MIN_POSTS);
}

/** Locales with at least one published post — a single DISTINCT query. */
export async function getLocalesWithPosts(): Promise<Locale[]> {
  const rows = await db
    .selectDistinct({ locale: postsTable.locale })
    .from(postsTable)
    .where(eq(postsTable.status, "published"));
  const found = new Set(rows.map((row) => row.locale));
  return locales.filter((locale) => found.has(locale));
}

/**
 * Up to `limit` other posts of the same locale, the ones sharing the most
 * tags first, topped up with the newest posts — every post links to a few
 * siblings, so none is left reachable only through the paginated index.
 */
export async function getRelatedPosts(
  locale: Locale,
  slug: string,
  tagSlugs: readonly string[],
  limit = 3
): Promise<PostSummary[]> {
  const wanted = new Set(tagSlugs);
  const candidates = (await getBlogPostSummaries(locale)).filter((post) => post.slug !== slug);
  const shared = (post: PostSummary) => post.tags.filter((tag) => wanted.has(tag.slug)).length;

  // getBlogPostSummaries is newest-first and Array#sort is stable, so equal
  // scores keep that order.
  return candidates
    .map((post) => ({ post, score: shared(post) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
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

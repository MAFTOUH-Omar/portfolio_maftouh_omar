import BlurFade from "@/components/magicui/blur-fade";
import { JsonLd } from "@/components/json-ld";
import { BlogHero } from "@/components/blog-hero";
import { BlogSearch } from "@/components/blog-search";
import { BlogPostList } from "@/components/blog-post-list";
import { PostListItem } from "@/components/blog-post-item";
import { ContactCta } from "@/components/contact-cta";
import { PostComments } from "@/components/engagement/post-comments";
import { PostReactions } from "@/components/engagement/post-reactions";
import { SectionHeading } from "@/components/section-heading";
import { Input } from "@/components/ui/input";
import {
  countPublishedPosts,
  getBlogPostSummaries,
  getBlogPostsByTag,
  getBlogPostsPage,
  getHubTags,
  getLocalesWithPosts,
  getPost,
  getPostLocales,
  getRelatedPosts,
  getUsedTagSlugs,
  TAG_HUB_MIN_POSTS,
  type PostSummary,
  type PostTag,
} from "@/data/blog";
import { getDictionary } from "@/data/dictionaries";
import { getSiteData } from "@/data/resume";
import { languageAlternates, localeConfig, localizePath, locales, type Locale } from "@/lib/i18n";
import { ogImageUrl, openGraphFor, PERSON_ID, WEBSITE_ID } from "@/lib/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { accentsFor, toneFor } from "@/lib/tag-colors";
import { cn, fill, formatDate, formatShortDate } from "@/lib/utils";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const BLUR_FADE_DELAY = 0.04;
const PAGE_SIZE = 10;
/** Average adult silent-reading speed for technical prose. */
const WORDS_PER_MINUTE = 200;

const chipClass = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium";

/**
 * Tag chip, tinted with the tag's own color (same hue on every page). Only
 * hub tags (see TAG_HUB_MIN_POSTS) are links: a single-post tag page is
 * `noindex`, and linking to it would just feed Search Console "Excluded by
 * 'noindex' tag" entries without helping readers.
 */
function TagChip({
  tag,
  locale,
  href,
  count,
}: {
  tag: PostTag;
  locale: Locale;
  href?: boolean;
  count?: number;
}) {
  const tone = toneFor(tag.slug);
  const content = (
    <>
      <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
      {tag.name}
      {count !== undefined && <span className="tabular-nums opacity-60">{count}</span>}
    </>
  );
  if (!href) return <span className={cn(chipClass, tone.chip)}>{content}</span>;
  return (
    <Link
      href={localizePath(locale, `/blog/tag/${tag.slug}`)}
      className={cn(chipClass, tone.chip, tone.chipHover, "transition-colors")}
    >
      {content}
    </Link>
  );
}

/* ------------------------------------------------------------------ index */

export async function blogIndexMetadata(locale: Locale): Promise<Metadata> {
  const t = getDictionary(locale);
  const path = localizePath(locale, "/blog");

  // Only locales that actually have posts get an indexable blog page.
  const [withPosts, data] = await Promise.all([getLocalesWithPosts(), getSiteData()]);
  const indexable = withPosts.includes(locale);
  const title = `${t.blog.title} | ${data.fullName}`;
  const ogImage = ogImageUrl(t.blog.title);

  return {
    title: t.blog.title,
    description: t.blog.description,
    alternates: {
      canonical: path,
      ...(indexable && withPosts.length > 1
        ? { languages: languageAlternates("/blog", withPosts) }
        : {}),
    },
    openGraph: await openGraphFor(locale, {
      title,
      description: t.blog.description,
      url: path,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    }),
    // Page-level `twitter` replaces the layout's, so it needs the full set.
    twitter: {
      card: "summary_large_image",
      title,
      description: t.blog.description,
      images: [ogImage],
    },
    // An empty listing is thin content: keep it out of the index until it has posts.
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

function blogIndexJsonLd(
  locale: Locale,
  t: ReturnType<typeof getDictionary>,
  posts: PostSummary[]
) {
  const pageUrl = absoluteUrl(localizePath(locale, "/blog"));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${pageUrl}#blog`,
        url: pageUrl,
        name: t.blog.title,
        description: t.blog.description,
        inLanguage: localeConfig[locale].htmlLang,
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
        ...(posts.length > 0
          ? {
              blogPost: posts.map((post) => {
                const postUrl = absoluteUrl(localizePath(locale, `/blog/${post.slug}`));
                return {
                  "@type": "BlogPosting",
                  "@id": `${postUrl}#article`,
                  url: postUrl,
                  headline: post.metadata.title,
                  datePublished: post.metadata.publishedAt,
                  dateModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
                };
              }),
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t.nav.home,
            item: absoluteUrl(localizePath(locale, "/")),
          },
          { "@type": "ListItem", position: 2, name: t.blog.title, item: pageUrl },
        ],
      },
    ],
  };
}

export async function BlogIndex({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams?: Promise<{ q?: string }>;
}) {
  const t = getDictionary(locale);
  const { q } = (await searchParams) ?? {};
  const query = q?.trim() || undefined;

  const [{ posts, hasMore }, totalCount, hubTags] = await Promise.all([
    getBlogPostsPage(locale, 0, PAGE_SIZE, query),
    countPublishedPosts(locale),
    getHubTags(locale),
  ]);

  return (
    <main className="flex flex-col gap-y-6">
      <JsonLd data={blogIndexJsonLd(locale, t, posts)} />
      <BlogHero
        title={t.blog.title}
        description={t.blog.description}
        postCount={t.blog.postCount.replace("{n}", String(totalCount))}
      />
      {totalCount > 0 && (
        <div className="flex flex-col gap-4">
          <Suspense
            fallback={
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input disabled placeholder={t.blog.searchPlaceholder} className="h-11 rounded-lg pl-11" />
              </div>
            }
          >
            <BlogSearch placeholder={t.blog.searchPlaceholder} />
          </Suspense>
          {hubTags.length > 0 && (
            <nav aria-label={t.blog.tagsHeading} className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{t.blog.tagsHeading}</span>
              {hubTags.map((tag) => (
                <TagChip key={tag.slug} tag={tag} locale={locale} href count={tag.count} />
              ))}
            </nav>
          )}
        </div>
      )}
      {posts.length === 0 ? (
        <BlurFade delay={BLUR_FADE_DELAY}>
          <p className="text-sm text-muted-foreground">{query ? t.blog.noResults : t.blog.empty}</p>
        </BlurFade>
      ) : (
        <BlogPostList
          key={query ?? ""}
          locale={locale}
          initialPosts={posts}
          initialHasMore={hasMore}
          query={query}
          labels={{
            loadMore: t.blog.loadMore,
            loading: t.blog.loading,
            endOfList: t.blog.endOfList,
            loadError: t.blog.loadError,
            retry: t.blog.retry,
          }}
        />
      )}
      <ContactCta locale={locale} showHeading={false} />
    </main>
  );
}

/* ------------------------------------------------------------------- post */

export async function blogPostStaticParams(locale: Locale) {
  // Summaries only: listing slugs doesn't need every post's Markdown rendered.
  const posts = await getBlogPostSummaries(locale);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function blogPostMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const post = await getPost(locale, slug);
  if (!post) return {};

  const data = await getSiteData();
  const { title, summary, publishedAt, updatedAt, image, seoTitle, seoDescription } = post.metadata;
  // The admin / MCP "SEO meta title/description" win over the visible title
  // and the listing excerpt when they're set.
  const metaTitle = seoTitle ?? title;
  const description = seoDescription ?? summary;
  const path = localizePath(locale, `/blog/${slug}`);
  const ogImage = image ?? ogImageUrl(title);
  const translations = await getPostLocales(slug);

  return {
    // Don't append "| Omar Maftouh" to a meta title that already names him.
    title: metaTitle.includes(data.fullName) ? { absolute: metaTitle } : metaTitle,
    description,
    alternates: {
      canonical: path,
      ...(translations.length > 1
        ? { languages: languageAlternates(`/blog/${slug}`, translations) }
        : {}),
    },
    openGraph: await openGraphFor(locale, {
      title: metaTitle,
      description,
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: updatedAt ?? publishedAt,
      authors: [SITE_URL],
      tags: post.tags.map((tag) => tag.name),
      url: path,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    }),
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [ogImage],
    },
  };
}

/** True when two ISO timestamps fall on different calendar days (UTC). */
function differentDay(a: string, b: string) {
  return a.slice(0, 10) !== b.slice(0, 10);
}

export async function BlogPost({ locale, slug }: { locale: Locale; slug: string }) {
  const post = await getPost(locale, slug);
  if (!post) notFound();

  const t = getDictionary(locale);
  const [data, hubTags, related] = await Promise.all([
    getSiteData(),
    getHubTags(locale),
    getRelatedPosts(locale, post.slug, post.tags.map((tag) => tag.slug)),
  ]);
  const hubSlugs = new Set(hubTags.map((tag) => tag.slug));
  const url = absoluteUrl(localizePath(locale, `/blog/${post.slug}`));
  const blogUrl = absoluteUrl(localizePath(locale, "/blog"));
  const image = absoluteUrl(post.metadata.image ?? ogImageUrl(post.metadata.title));
  const { publishedAt, updatedAt } = post.metadata;
  const modified = updatedAt && differentDay(updatedAt, publishedAt) ? updatedAt : undefined;
  const readingMinutes = Math.max(1, Math.round(post.wordCount / WORDS_PER_MINUTE));
  const dateLocale = localeConfig[locale].dateLocale;
  const relatedAccents = accentsFor(related.map((relatedPost) => relatedPost.slug));

  return (
    <main>
      <section id="blog" className="flex flex-col gap-y-6">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BlogPosting",
                "@id": `${url}#article`,
                headline: post.metadata.title,
                description: post.metadata.seoDescription ?? post.metadata.summary,
                datePublished: publishedAt,
                dateModified: updatedAt ?? publishedAt,
                ...(post.tags.length > 0
                  ? { keywords: post.tags.map((tag) => tag.name).join(", ") }
                  : {}),
                wordCount: post.wordCount,
                inLanguage: localeConfig[locale].htmlLang,
                image,
                url,
                mainEntityOfPage: url,
                isPartOf: { "@id": `${blogUrl}#blog` },
                author: { "@type": "Person", "@id": PERSON_ID, name: data.fullName, url: SITE_URL },
                publisher: { "@type": "Person", "@id": PERSON_ID, name: data.fullName, url: SITE_URL },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: t.nav.home,
                    item: absoluteUrl(localizePath(locale, "/")),
                  },
                  { "@type": "ListItem", position: 2, name: t.blog.title, item: blogUrl },
                  { "@type": "ListItem", position: 3, name: post.metadata.title, item: url },
                ],
              },
            ],
          }}
        />
        <BlurFade delay={BLUR_FADE_DELAY}>
          <Link
            href={localizePath(locale, "/blog")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {t.blog.back}
          </Link>
        </BlurFade>
        <div className="space-y-4">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <h1 className="text-pretty text-2xl font-bold tracking-tight sm:text-3xl">
              {post.metadata.title}
            </h1>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            {/* Visible byline: matches the BlogPosting author and tells readers
                (and search engines) who wrote it and how fresh it is. */}
            <Suspense fallback={<p className="h-5" />}>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
                <span>
                  {t.blog.by}{" "}
                  <Link
                    href={localizePath(locale, "/")}
                    rel="author"
                    className="font-medium text-foreground hover:underline"
                  >
                    {data.fullName}
                  </Link>
                </span>
                <span aria-hidden>·</span>
                <time dateTime={publishedAt}>{formatDate(publishedAt, dateLocale)}</time>
                <span aria-hidden>·</span>
                <span>{fill(t.blog.readingTime, { n: readingMinutes })}</span>
                {modified && (
                  <>
                    <span aria-hidden>·</span>
                    <time dateTime={modified}>
                      {fill(t.blog.updated, { date: formatShortDate(modified, dateLocale) })}
                    </time>
                  </>
                )}
              </p>
            </Suspense>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <TagChip key={tag.slug} tag={tag} locale={locale} href={hubSlugs.has(tag.slug)} />
                  ))}
                </div>
              )}
              <PostReactions postId={post.id} locale={locale} />
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            {/* Justified body text (hyphenated in the page language); headings,
                tables and code keep their natural left alignment. */}
            <article
              className="prose max-w-full text-justify text-pretty hyphens-auto dark:prose-invert prose-headings:text-left prose-headings:hyphens-manual prose-pre:text-left prose-table:text-left"
              dangerouslySetInnerHTML={{ __html: post.source }}
            ></article>
          </BlurFade>
        </div>
      </section>
      {/* Renders nothing until there is a comment (or the reader opens the form). */}
      <PostComments
        postId={post.id}
        locale={locale}
        authorName={data.fullName}
        authorInitials={data.initials}
      />
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-12 flex flex-col gap-3">
          <SectionHeading
            id="related-heading"
            index={<BookOpen className="size-4 sm:size-5" />}
            title={t.blog.related}
          />
          {related.map((relatedPost, id) => (
            <PostListItem
              key={relatedPost.slug}
              post={relatedPost}
              locale={locale}
              delay={0}
              accent={relatedAccents[id]}
              headingLevel={3}
            />
          ))}
        </section>
      )}
      <ContactCta locale={locale} showHeading={false} />
    </main>
  );
}

/* --------------------------------------------------------------------- tag */

export async function tagPageStaticParams(locale: Locale) {
  const slugs = await getUsedTagSlugs(locale);
  return slugs.map((tag) => ({ tag }));
}

function tagNameOf(posts: PostSummary[], tagSlug: string): string {
  return posts[0]?.tags.find((tag) => tag.slug === tagSlug)?.name ?? tagSlug;
}

/** Locales in which this tag has a hub (indexable) page — drives hreflang. */
async function tagHubLocales(tagSlug: string): Promise<Locale[]> {
  const hubs = await Promise.all(locales.map((locale) => getHubTags(locale)));
  return locales.filter((_, index) => hubs[index].some((tag) => tag.slug === tagSlug));
}

export async function tagPageMetadata(locale: Locale, tagSlug: string): Promise<Metadata> {
  const t = getDictionary(locale);
  const posts = await getBlogPostsByTag(locale, tagSlug);
  if (posts.length === 0) return {};

  const data = await getSiteData();
  const tagName = tagNameOf(posts, tagSlug);
  const path = localizePath(locale, `/blog/tag/${tagSlug}`);
  const isHub = posts.length >= TAG_HUB_MIN_POSTS;
  const hubLocales = isHub ? await tagHubLocales(tagSlug) : [];
  const title = fill(t.blog.tagTitle, { tag: tagName });
  const description = isHub
    ? fill(t.blog.tagDescription, { n: posts.length, tag: tagName, latest: posts[0].metadata.title })
    : t.blog.description;
  const ogImage = ogImageUrl(title);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(hubLocales.length > 1
        ? { languages: languageAlternates(`/blog/tag/${tagSlug}`, hubLocales) }
        : {}),
    },
    openGraph: await openGraphFor(locale, {
      title: `${title} | ${data.fullName}`,
      description,
      url: path,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    }),
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${data.fullName}`,
      description,
      images: [ogImage],
    },
    // A topic with several posts is a real hub page worth ranking ("articles
    // DevOps"); a single-post tag would only duplicate that post.
    ...(isHub ? {} : { robots: { index: false, follow: true } }),
  };
}

function tagJsonLd(
  locale: Locale,
  t: ReturnType<typeof getDictionary>,
  tagSlug: string,
  tagName: string,
  posts: PostSummary[]
) {
  const pageUrl = absoluteUrl(localizePath(locale, `/blog/tag/${tagSlug}`));
  const title = fill(t.blog.tagTitle, { tag: tagName });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: title,
        inLanguage: localeConfig[locale].htmlLang,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@type": "Thing", name: tagName },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(localizePath(locale, `/blog/${post.slug}`)),
            name: post.metadata.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t.nav.home,
            item: absoluteUrl(localizePath(locale, "/")),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t.blog.title,
            item: absoluteUrl(localizePath(locale, "/blog")),
          },
          { "@type": "ListItem", position: 3, name: tagName, item: pageUrl },
        ],
      },
    ],
  };
}

export async function TagPage({ locale, tag }: { locale: Locale; tag: string }) {
  const t = getDictionary(locale);
  const posts = await getBlogPostsByTag(locale, tag);
  if (posts.length === 0) notFound();
  const tagName = tagNameOf(posts, tag);
  const isHub = posts.length >= TAG_HUB_MIN_POSTS;
  const accents = accentsFor(posts.map((post) => post.slug));

  return (
    <main className="flex flex-col gap-y-6">
      <JsonLd data={tagJsonLd(locale, t, tag, tagName, posts)} />
      <BlurFade delay={BLUR_FADE_DELAY}>
        <Link
          href={localizePath(locale, "/blog")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t.blog.back}
        </Link>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 2} className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-xl font-bold tracking-tight sm:text-2xl">
          <span
            aria-hidden
            className="rounded-md bg-hero-ink px-2 py-0.5 font-mono text-sm font-semibold text-hero-panel dark:ring-1 dark:ring-white/10"
          >
            #
          </span>
          {tagName}
        </h1>
        {isHub && (
          <p className="text-justify text-pretty text-sm text-muted-foreground hyphens-auto">
            {fill(t.blog.tagIntro, { n: posts.length, tag: tagName })}
          </p>
        )}
      </BlurFade>
      <div className="flex flex-col gap-3">
        {posts.map((post, id) => (
          <PostListItem
            key={post.slug}
            post={post}
            locale={locale}
            delay={BLUR_FADE_DELAY * 3 + id * 0.05}
            accent={accents[id]}
          />
        ))}
      </div>
      <ContactCta locale={locale} showHeading={false} />
    </main>
  );
}

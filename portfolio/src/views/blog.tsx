import BlurFade from "@/components/magicui/blur-fade";
import { JsonLd } from "@/components/json-ld";
import { BlogHero } from "@/components/blog-hero";
import { BlogPostList } from "@/components/blog-post-list";
import { PostListItem } from "@/components/blog-post-item";
import { ContactCta } from "@/components/contact-cta";
import {
  getBlogPosts,
  getBlogPostSummaries,
  getBlogPostsByTag,
  getBlogPostsPage,
  getPost,
  getPostLocales,
  getUsedTagSlugs,
} from "@/data/blog";
import { getDictionary } from "@/data/dictionaries";
import { getSiteData } from "@/data/resume";
import { languageAlternates, localeConfig, localizePath, locales, type Locale } from "@/lib/i18n";
import { ogImageUrl, openGraphFor, PERSON_ID } from "@/lib/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const BLUR_FADE_DELAY = 0.04;
const PAGE_SIZE = 10;

/* ------------------------------------------------------------------ index */

export async function blogIndexMetadata(locale: Locale): Promise<Metadata> {
  const t = getDictionary(locale);
  const path = localizePath(locale, "/blog");

  // Only locales that actually have posts get an indexable blog page.
  const withPosts: Locale[] = [];
  for (const l of locales) {
    if ((await getBlogPostSummaries(l)).length > 0) withPosts.push(l);
  }
  const indexable = withPosts.includes(locale);
  const data = await getSiteData();

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
      title: `${t.blog.title} | ${data.fullName}`,
      description: t.blog.description,
      url: path,
    }),
    // An empty listing is thin content: keep it out of the index until it has posts.
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

export async function BlogIndex({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [{ posts, hasMore }, totalCount] = await Promise.all([
    getBlogPostsPage(locale, 0, PAGE_SIZE),
    getBlogPostSummaries(locale).then((all) => all.length),
  ]);

  return (
    <main className="flex flex-col gap-y-6">
      <BlogHero
        title={t.blog.title}
        description={t.blog.description}
        postCount={t.blog.postCount.replace("{n}", String(totalCount))}
      />
      {posts.length === 0 ? (
        <BlurFade delay={BLUR_FADE_DELAY}>
          <p className="text-sm text-muted-foreground">{t.blog.empty}</p>
        </BlurFade>
      ) : (
        <BlogPostList
          locale={locale}
          initialPosts={posts}
          initialHasMore={hasMore}
          labels={{ loadMore: t.blog.loadMore, loading: t.blog.loading, endOfList: t.blog.endOfList }}
        />
      )}
      <ContactCta locale={locale} showHeading={false} />
    </main>
  );
}

/* ------------------------------------------------------------------- post */

export async function blogPostStaticParams(locale: Locale) {
  const posts = await getBlogPosts(locale);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function blogPostMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const post = await getPost(locale, slug);
  if (!post) return {};

  const { title, summary: description, publishedAt, updatedAt, image } = post.metadata;
  const path = localizePath(locale, `/blog/${slug}`);
  const ogImage = image ?? ogImageUrl(title);
  const translations = await getPostLocales(slug);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(translations.length > 1
        ? { languages: languageAlternates(`/blog/${slug}`, translations) }
        : {}),
    },
    openGraph: await openGraphFor(locale, {
      title,
      description,
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: updatedAt ?? publishedAt,
      authors: [SITE_URL],
      url: path,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export async function BlogPost({ locale, slug }: { locale: Locale; slug: string }) {
  const post = await getPost(locale, slug);
  if (!post) notFound();

  const t = getDictionary(locale);
  const data = await getSiteData();
  const url = absoluteUrl(localizePath(locale, `/blog/${post.slug}`));
  const image = absoluteUrl(post.metadata.image ?? ogImageUrl(post.metadata.title));

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
                description: post.metadata.summary,
                datePublished: post.metadata.publishedAt,
                dateModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
                ...(post.tags.length > 0
                  ? { keywords: post.tags.map((tag) => tag.name).join(", ") }
                  : {}),
                inLanguage: localeConfig[locale].htmlLang,
                image,
                url,
                mainEntityOfPage: url,
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
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: t.blog.title,
                    item: absoluteUrl(localizePath(locale, "/blog")),
                  },
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
        <div className="max-w-[680px] space-y-4">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              {post.metadata.title}
            </h1>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <Suspense fallback={<p className="h-5" />}>
              <time
                dateTime={post.metadata.publishedAt}
                className="font-mono text-xs text-muted-foreground"
              >
                {formatDate(post.metadata.publishedAt, localeConfig[locale].dateLocale)}
              </time>
            </Suspense>
          </BlurFade>
          {post.tags.length > 0 ? (
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={localizePath(locale, `/blog/tag/${tag.slug}`)}
                    className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </BlurFade>
          ) : null}
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <article
              className="prose max-w-full text-pretty dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.source }}
            ></article>
          </BlurFade>
        </div>
      </section>
      <ContactCta locale={locale} showHeading={false} />
    </main>
  );
}

/* --------------------------------------------------------------------- tag */

export async function tagPageStaticParams(locale: Locale) {
  const slugs = await getUsedTagSlugs(locale);
  return slugs.map((tag) => ({ tag }));
}

export async function tagPageMetadata(locale: Locale, tagSlug: string): Promise<Metadata> {
  const t = getDictionary(locale);
  const posts = await getBlogPostsByTag(locale, tagSlug);
  const tagName = posts[0]?.tags.find((tag) => tag.slug === tagSlug)?.name ?? tagSlug;
  const path = localizePath(locale, `/blog/tag/${tagSlug}`);

  return {
    title: `${tagName} — ${t.blog.title}`,
    description: t.blog.description,
    alternates: { canonical: path },
    openGraph: await openGraphFor(locale, {
      title: `${tagName} — ${t.blog.title}`,
      description: t.blog.description,
      url: path,
    }),
    // Thin, duplicative listing pages: index the post itself, not every tag facet.
    robots: { index: false, follow: true },
  };
}

export async function TagPage({ locale, tag }: { locale: Locale; tag: string }) {
  const t = getDictionary(locale);
  const posts = await getBlogPostsByTag(locale, tag);
  if (posts.length === 0) notFound();
  const tagName = posts[0].tags.find((postTag) => postTag.slug === tag)?.name ?? tag;

  return (
    <main className="flex flex-col gap-y-6">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <Link
          href={localizePath(locale, "/blog")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t.blog.back}
        </Link>
      </BlurFade>
      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <h1 className="flex items-center gap-3 text-xl font-bold tracking-tight sm:text-2xl">
          <span
            aria-hidden
            className="rounded-md bg-hero-ink px-2 py-0.5 font-mono text-sm font-semibold text-hero-panel dark:ring-1 dark:ring-white/10"
          >
            #
          </span>
          {tagName}
        </h1>
      </BlurFade>
      <div className="flex flex-col gap-3">
        {posts.map((post, id) => (
          <PostListItem
            key={post.slug}
            post={post}
            locale={locale}
            delay={BLUR_FADE_DELAY * 3 + id * 0.05}
          />
        ))}
      </div>
      <ContactCta locale={locale} showHeading={false} />
    </main>
  );
}

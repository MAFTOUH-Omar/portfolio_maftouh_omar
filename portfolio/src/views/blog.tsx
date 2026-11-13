import BlurFade from "@/components/magicui/blur-fade";
import { JsonLd } from "@/components/json-ld";
import { getBlogPosts, getPost, getPostLocales } from "@/data/blog";
import { getDictionary } from "@/data/dictionaries";
import { DATA } from "@/data/resume";
import { languageAlternates, localeConfig, localizePath, locales, type Locale } from "@/lib/i18n";
import { ogImageUrl, openGraphFor, PERSON_ID } from "@/lib/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const BLUR_FADE_DELAY = 0.04;

/* ------------------------------------------------------------------ index */

export async function blogIndexMetadata(locale: Locale): Promise<Metadata> {
  const t = getDictionary(locale);
  const path = localizePath(locale, "/blog");

  // Only locales that actually have posts get an indexable blog page.
  const withPosts: Locale[] = [];
  for (const l of locales) {
    if ((await getBlogPosts(l)).length > 0) withPosts.push(l);
  }
  const indexable = withPosts.includes(locale);

  return {
    title: t.blog.title,
    description: t.blog.description,
    alternates: {
      canonical: path,
      ...(indexable && withPosts.length > 1
        ? { languages: languageAlternates("/blog", withPosts) }
        : {}),
    },
    openGraph: openGraphFor(locale, {
      title: `${t.blog.title} | ${DATA.fullName}`,
      description: t.blog.description,
      url: path,
    }),
    // An empty listing is thin content: keep it out of the index until it has posts.
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

export async function BlogIndex({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const posts = await getBlogPosts(locale);

  return (
    <main>
      <section>
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h1 className="font-medium text-2xl mb-8 tracking-tighter">{t.blog.heading}</h1>
        </BlurFade>
        {posts.length === 0 && (
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <p className="text-sm text-muted-foreground">{t.blog.empty}</p>
          </BlurFade>
        )}
        {posts.map((post, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
            <Link
              className="flex flex-col space-y-1 mb-4"
              href={localizePath(locale, `/blog/${post.slug}`)}
            >
              <div className="w-full flex flex-col">
                <p className="tracking-tight">{post.metadata.title}</p>
                <p className="h-6 text-xs text-muted-foreground">
                  {post.metadata.publishedAt}
                </p>
              </div>
            </Link>
          </BlurFade>
        ))}
      </section>
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
  const translations = getPostLocales(slug);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(translations.length > 1
        ? { languages: languageAlternates(`/blog/${slug}`, translations) }
        : {}),
    },
    openGraph: openGraphFor(locale, {
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
  const url = absoluteUrl(localizePath(locale, `/blog/${post.slug}`));
  const image = absoluteUrl(post.metadata.image ?? ogImageUrl(post.metadata.title));

  return (
    <main>
      <section id="blog">
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
                inLanguage: localeConfig[locale].htmlLang,
                image,
                url,
                mainEntityOfPage: url,
                author: { "@type": "Person", "@id": PERSON_ID, name: DATA.fullName, url: SITE_URL },
                publisher: { "@type": "Person", "@id": PERSON_ID, name: DATA.fullName, url: SITE_URL },
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
        <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
          {post.metadata.title}
        </h1>
        <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
          <Suspense fallback={<p className="h-5" />}>
            <time
              dateTime={post.metadata.publishedAt}
              className="text-sm text-neutral-600 dark:text-neutral-400"
            >
              {formatDate(post.metadata.publishedAt, localeConfig[locale].dateLocale)}
            </time>
          </Suspense>
        </div>
        <article
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.source }}
        ></article>
      </section>
    </main>
  );
}

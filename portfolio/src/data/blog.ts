import fs from "fs";
import matter from "gray-matter";
import path from "path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { locales, type Locale } from "@/lib/i18n";

type Metadata = {
  title: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
  image?: string;
};

export type Post = {
  source: string;
  metadata: Metadata;
  slug: string;
  locale: Locale;
};

/** Posts live in content/<locale>/<slug>.mdx — the same slug in both folders marks a translation. */
const CONTENT_DIR = path.join(process.cwd(), "content");

function localeDir(locale: Locale) {
  return path.join(CONTENT_DIR, locale);
}

function getSlugs(locale: Locale): string[] {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => path.extname(file) === ".mdx")
    .map((file) => path.basename(file, ".mdx"));
}

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

export function postExists(locale: Locale, slug: string): boolean {
  // Slugs come from the URL: only accept plain file names.
  if (!/^[a-z0-9-]+$/i.test(slug)) return false;
  return fs.existsSync(path.join(localeDir(locale), `${slug}.mdx`));
}

/** Returns null when the post doesn't exist in that locale. */
export async function getPost(locale: Locale, slug: string): Promise<Post | null> {
  if (!postExists(locale, slug)) return null;
  const source = fs.readFileSync(path.join(localeDir(locale), `${slug}.mdx`), "utf-8");
  const { content: rawContent, data } = matter(source);
  return {
    source: await markdownToHTML(rawContent),
    metadata: data as Metadata,
    slug,
    locale,
  };
}

/** Posts of a locale, newest first. */
export async function getBlogPosts(locale: Locale): Promise<Post[]> {
  const posts = await Promise.all(getSlugs(locale).map((slug) => getPost(locale, slug)));
  return posts
    .filter((post): post is Post => post !== null)
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime()
    );
}

/** Locales in which a given slug is published (used for hreflang). */
export function getPostLocales(slug: string): Locale[] {
  return locales.filter((locale) => postExists(locale, slug));
}

/** Slugs published in every locale, i.e. posts the language switcher can map 1:1. */
export function getTranslatedSlugs(): string[] {
  const [first, ...rest] = locales;
  return getSlugs(first).filter((slug) => rest.every((locale) => postExists(locale, slug)));
}

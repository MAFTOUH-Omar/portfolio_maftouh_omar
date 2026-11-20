import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { CardDecor } from "@/components/card-decor";
import { PostCardStats } from "@/components/engagement/post-card-stats";
import { Card } from "@/components/ui/card";
import type { PostSummary } from "@/data/blog";
import { localeConfig, localizePath, type Locale } from "@/lib/i18n";
import { accentFor, toneFor, type Accent } from "@/lib/tag-colors";
import { cn, formatDate } from "@/lib/utils";

/** One row in the post list — shared by the index, the tag archive, the
 *  home page and related posts, so every post card reads with the same
 *  rhythm regardless of where it renders.
 *
 *  The whole card is clickable through the title's stretched link (an
 *  `after:` overlay), which leaves the vote buttons as real buttons above
 *  it instead of nesting them inside an <a>. */
export function PostListItem({
  post,
  locale,
  delay,
  accent,
  animate = true,
  headingLevel = 2,
}: {
  post: PostSummary;
  locale: Locale;
  delay: number;
  /** Card color + shape; lists pass accentsFor() so neighbours differ. */
  accent?: Accent;
  /** False for cards restored on back-navigation: no entrance replay. */
  animate?: boolean;
  /** 2 directly under a page's H1 (index, tag archive); 3 inside a section
   *  that already has its own H2 (home "latest posts", related posts). */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const look = accent ?? accentFor(post.slug);
  const href = localizePath(locale, `/blog/${post.slug}`);

  const card = (
    <Card className="group/card relative isolate flex flex-col gap-2 overflow-hidden p-4 transition-colors hover:border-primary/60 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring sm:p-5">
      <CardDecor accent={look} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Heading className="text-pretty text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {post.metadata.title}
            </Link>
          </Heading>
          <time
            dateTime={post.metadata.publishedAt}
            className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", look.tone.dot)} />
            {formatDate(post.metadata.publishedAt, localeConfig[locale].dateLocale)}
          </time>
        </div>
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-primary group-hover/card:opacity-100" />
      </div>
      <p className="line-clamp-2 text-justify text-sm text-pretty text-muted-foreground hyphens-auto">
        {post.metadata.summary}
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag.slug}
                className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium", toneFor(tag.slug).chip)}
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <PostCardStats postId={post.id} postHref={href} locale={locale} />
      </div>
    </Card>
  );

  return animate ? <BlurFade delay={delay}>{card}</BlurFade> : card;
}

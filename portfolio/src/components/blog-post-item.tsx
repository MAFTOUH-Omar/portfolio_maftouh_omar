import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { Card } from "@/components/ui/card";
import type { PostSummary } from "@/data/blog";
import { localeConfig, localizePath, type Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

/** One row in the post list — shared by the index, the tag archive, and
 *  the infinite-scroll client list, so every post card reads with the
 *  same rhythm regardless of where it renders. */
export function PostListItem({
  post,
  locale,
  delay,
}: {
  post: PostSummary;
  locale: Locale;
  delay: number;
}) {
  return (
    <BlurFade delay={delay}>
      <Link href={localizePath(locale, `/blog/${post.slug}`)} className="group block">
        <Card className="group flex flex-col gap-2 p-4 transition-colors hover:border-primary/60 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <h3 className="text-balance text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
                {post.metadata.title}
              </h3>
              <time
                dateTime={post.metadata.publishedAt}
                className="font-mono text-[11px] text-muted-foreground"
              >
                {formatDate(post.metadata.publishedAt, localeConfig[locale].dateLocale)}
              </time>
            </div>
            <ArrowUpRight className="size-4 shrink-0 translate-x-0 text-muted-foreground opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100" />
          </div>
          <p className="line-clamp-2 text-pretty text-sm text-muted-foreground">
            {post.metadata.summary}
          </p>
          {post.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag.slug}
                  className="rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </Card>
      </Link>
    </BlurFade>
  );
}

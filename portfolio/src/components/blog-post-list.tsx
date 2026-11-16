"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { PostListItem } from "@/components/blog-post-item";
import type { PostSummary } from "@/data/blog";
import type { Locale } from "@/lib/i18n";

const PAGE_SIZE = 10;

/** Renders the first page of posts (already fetched on the server) and
 *  fetches the next ones 10-at-a-time as the sentinel at the bottom of the
 *  list scrolls into view — no "page 2" link, no full reload. */
export function BlogPostList({
  locale,
  initialPosts,
  initialHasMore,
  labels,
}: {
  locale: Locale;
  initialPosts: PostSummary[];
  initialHasMore: boolean;
  labels: { loadMore: string; loading: string; endOfList: string };
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/blog/posts?locale=${locale}&offset=${posts.length}&limit=${PAGE_SIZE}`
      );
      if (!response.ok) return;
      const data: { posts: PostSummary[]; hasMore: boolean } = await response.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch {
      // Transient network error: the sentinel stays in view, so the next
      // scroll tick (or a manual retry) will simply try again.
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, locale, posts.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "500px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post, id) => (
        <PostListItem key={post.slug} post={post} locale={locale} delay={Math.min(id, 9) * 0.05} />
      ))}
      <div ref={sentinelRef} aria-hidden className="h-1" />
      {loading && (
        <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {labels.loading}
        </p>
      )}
      {!hasMore && posts.length > 0 && !loading && (
        <p className="py-4 text-center text-sm text-muted-foreground">{labels.endOfList}</p>
      )}
    </div>
  );
}

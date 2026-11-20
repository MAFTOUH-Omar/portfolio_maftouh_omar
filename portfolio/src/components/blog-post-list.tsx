"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { PostListItem } from "@/components/blog-post-item";
import { Button } from "@/components/ui/button";
import type { PostSummary } from "@/data/blog";
import type { Locale } from "@/lib/i18n";
import { accentsFor } from "@/lib/tag-colors";

const PAGE_SIZE = 10;
/** Start fetching this far before the reader reaches the end of the list. */
const PREFETCH_MARGIN = "800px 0px";
/** A remembered list older than this is dropped: the reader gets fresh posts. */
const CACHE_TTL = 15 * 60_000;
const RETRY_DELAY = 1500;

/** `enter` is the entrance-animation delay, or null to show the card as is. */
type Item = { post: PostSummary; enter: number | null };
type Saved = { posts: PostSummary[]; hasMore: boolean; savedAt: number };

/**
 * Lists already scrolled through, per locale + query, for this tab's
 * lifetime. Going back from a post remounts the list: it comes back whole in
 * its very first render, so the browser restores the scroll position on the
 * right card, with no reload and no entrance animation replay.
 */
const memory = new Map<string, Saved>();

function remembered(key: string, initialPosts: PostSummary[]): Saved | null {
  const saved = memory.get(key);
  if (!saved || Date.now() - saved.savedAt > CACHE_TTL) return null;
  // Only while the server's first page is unchanged (no post published since).
  const unchanged = initialPosts.every((post, index) => saved.posts[index]?.slug === post.slug);
  return unchanged && saved.posts.length > initialPosts.length ? saved : null;
}

/** Placeholder with a post card's footprint, shown while the next page loads. */
function CardSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-3 rounded-lg border p-4 sm:p-5">
      <div className="h-5 w-2/3 rounded bg-muted" />
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-full bg-muted" />
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
    </div>
  );
}

/** Renders the first page of posts (already fetched on the server) and
 *  appends the next ones 10-at-a-time as the reader nears the end — no
 *  "page 2" link, no navigation, no full reload. */
export function BlogPostList({
  locale,
  initialPosts,
  initialHasMore,
  query,
  labels,
}: {
  locale: Locale;
  initialPosts: PostSummary[];
  initialHasMore: boolean;
  /** Current search query, if any — threaded into the "load more" requests
   *  so pagination keeps matching the filtered set. */
  query?: string;
  labels: { loadMore: string; loading: string; endOfList: string; loadError: string; retry: string };
}) {
  const memoryKey = `${locale}|${query ?? ""}`;
  // Lazy initial state: on a client-side back navigation the module memory
  // is filled; on a full page load it's empty, so hydration matches the server.
  const [state, setState] = useState<{ items: Item[]; hasMore: boolean }>(() => {
    const saved = remembered(memoryKey, initialPosts);
    if (saved) {
      return { items: saved.posts.map((post) => ({ post, enter: null })), hasMore: saved.hasMore };
    }
    return {
      items: initialPosts.map((post, index) => ({ post, enter: Math.min(index, 9) * 0.05 })),
      hasMore: initialHasMore,
    };
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const { items, hasMore } = state;

  const fetchPage = useCallback(
    async (offset: number) => {
      const q = query ? `&q=${encodeURIComponent(query)}` : "";
      const response = await fetch(`/api/blog/posts?locale=${locale}&offset=${offset}&limit=${PAGE_SIZE}${q}`);
      if (!response.ok) throw new Error(String(response.status));
      return (await response.json()) as { posts: PostSummary[]; hasMore: boolean };
    },
    [locale, query]
  );

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore) return;
    busyRef.current = true;
    setStatus("loading");
    const offset = items.length;
    let page: { posts: PostSummary[]; hasMore: boolean } | null = null;
    try {
      page = await fetchPage(offset);
    } catch {
      // One quiet retry (dropped connection, cold database), then ask.
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      page = await fetchPage(offset).catch(() => null);
    }
    busyRef.current = false;
    if (!page) {
      setStatus("error");
      return;
    }
    const known = new Set(items.map((item) => item.post.slug));
    const fresh = page.posts.filter((post) => !known.has(post.slug));
    const more = page.hasMore;
    setState((previous) => ({
      // Stagger only within the new batch, quickly.
      items: [...previous.items, ...fresh.map((post, index) => ({ post, enter: Math.min(index, 5) * 0.04 }))],
      hasMore: more,
    }));
    setStatus("idle");
  }, [fetchPage, hasMore, items]);

  // Remember what has been loaded, for the back button.
  useEffect(() => {
    if (items.length > initialPosts.length) {
      memory.set(memoryKey, { posts: items.map((item) => item.post), hasMore, savedAt: Date.now() });
    }
  }, [items, hasMore, initialPosts.length, memoryKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || status === "error") return;

    // Re-created after every page, so a sentinel still in view (tall screen)
    // triggers the next page right away.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: PREFETCH_MARGIN }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, status]);

  const accents = useMemo(() => accentsFor(items.map((item) => item.post.slug)), [items]);

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ post, enter }, index) => (
        <PostListItem
          key={post.slug}
          post={post}
          locale={locale}
          delay={enter ?? 0}
          animate={enter !== null}
          accent={accents[index]}
        />
      ))}
      <div ref={sentinelRef} aria-hidden className="h-px" />
      <div aria-live="polite" className="contents">
        {status === "loading" && (
          <>
            <span className="sr-only">{labels.loading}</span>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            {labels.loadError}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus("idle");
                loadMore();
              }}
            >
              <RotateCw className="size-3.5" />
              {labels.retry}
            </Button>
          </div>
        )}
        {!hasMore && items.length > 0 && status === "idle" && (
          <p className="py-4 text-center text-sm text-muted-foreground">{labels.endOfList}</p>
        )}
      </div>
    </div>
  );
}

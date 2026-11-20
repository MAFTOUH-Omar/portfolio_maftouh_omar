"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { VoteValue } from "@/data/engagement";
import { getDictionary } from "@/data/dictionaries";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePostStats, vote } from "./store";
import { VoteButtons } from "./vote-buttons";

/**
 * "⇧ 24 ⇩ · 💬 3" on a post card — votes work right from the card. Sits
 * above the card's stretched link (z-10); only the buttons catch clicks, the
 * rest of the pill lets them through to the link. Space is reserved up front
 * so the card doesn't shift when the numbers land.
 */
export function PostCardStats({
  postId,
  postHref,
  locale,
}: {
  postId: string;
  postHref: string;
  locale: Locale;
}) {
  const stats = usePostStats(postId);
  const t = getDictionary(locale).engagement;
  const [busy, setBusy] = useState(false);

  async function handleVote(next: VoteValue) {
    setBusy(true);
    await vote(postId, next);
    setBusy(false);
  }

  const comments = (
    <>
      <MessageCircle aria-hidden className="size-3.5" />
      <span className="font-semibold tabular-nums">
        {stats?.comments ?? 0}
        <span className="sr-only"> {t.comments}</span>
      </span>
    </>
  );

  return (
    <div
      className={cn(
        "pointer-events-none relative z-10 inline-flex h-7 shrink-0 items-center gap-0.5 rounded-md border bg-card/85 px-0.5 text-xs backdrop-blur-sm transition-opacity duration-300",
        stats ? "opacity-100" : "invisible opacity-0"
      )}
    >
      <VoteButtons
        size="sm"
        score={stats?.score ?? 0}
        myVote={stats?.myVote ?? 0}
        disabled={!stats || busy}
        onVote={handleVote}
        labels={t}
      />
      <span aria-hidden className="px-0.5 text-muted-foreground">
        ·
      </span>
      {stats && stats.comments > 0 ? (
        <Link
          href={`${postHref}#comments`}
          title={t.goToComments}
          className="pointer-events-auto flex h-6 items-center gap-1 rounded px-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {comments}
        </Link>
      ) : (
        <span className="flex h-6 items-center gap-1 px-1.5 text-muted-foreground">{comments}</span>
      )}
    </div>
  );
}

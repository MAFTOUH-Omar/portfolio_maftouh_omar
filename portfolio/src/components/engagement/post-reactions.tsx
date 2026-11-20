"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { VoteValue } from "@/data/engagement";
import { getDictionary } from "@/data/dictionaries";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { setComposerOpen, useEngagement, vote } from "./store";
import { VoteButtons } from "./vote-buttons";

/**
 * "⇧ 24 ⇩ · 💬 14" under the post title. With no comment yet, the bubble
 * becomes a "Comment" button that opens the (otherwise hidden) comment form.
 */
export function PostReactions({ postId, locale }: { postId: string; locale: Locale }) {
  const { data, failed } = useEngagement(postId);
  const t = getDictionary(locale).engagement;
  const [busy, setBusy] = useState(false);

  // Engagement unavailable (e.g. database not migrated): show nothing rather
  // than a widget that can't work.
  if (failed) return null;

  async function handleVote(next: VoteValue) {
    setBusy(true);
    await vote(postId, next);
    setBusy(false);
  }

  const hasComments = !!data && (data.comments > 0 || data.threads.length > 0);
  const bubble =
    "flex h-8 items-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border bg-card p-1 text-sm transition-opacity duration-300",
        data ? "opacity-100" : "opacity-60"
      )}
    >
      <VoteButtons
        score={data?.score ?? null}
        myVote={data?.myVote ?? 0}
        disabled={!data || busy}
        onVote={handleVote}
        labels={t}
      />
      <span aria-hidden className="px-1 text-muted-foreground">
        ·
      </span>
      {hasComments ? (
        <a href="#comments" aria-label={t.goToComments} title={t.goToComments} className={bubble}>
          <MessageCircle className="size-4" />
          <span className="font-semibold tabular-nums">{data.comments}</span>
        </a>
      ) : (
        <button
          type="button"
          disabled={!data}
          onClick={() => setComposerOpen(postId, true)}
          className={cn(bubble, "disabled:opacity-50")}
        >
          <MessageCircle className="size-4" />
          <span className="font-medium">{t.comment}</span>
        </button>
      )}
    </div>
  );
}

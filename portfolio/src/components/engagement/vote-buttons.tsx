"use client";

import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import type { VoteValue } from "@/data/engagement";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { button: "size-6 rounded", icon: "size-4", score: "min-w-5 text-xs" },
  md: { button: "size-8 rounded-md", icon: "size-5", score: "min-w-7 text-sm" },
} as const;

/**
 * "⇧ 24 ⇩" — like / net score / dislike. Clicking the active arrow again
 * withdraws the vote. Shared by the post page's reactions bar and the cards.
 */
export function VoteButtons({
  score,
  myVote,
  disabled,
  onVote,
  labels,
  size = "md",
}: {
  score: number | null;
  myVote: VoteValue;
  disabled: boolean;
  onVote: (next: VoteValue) => void;
  labels: { like: string; dislike: string; score: string };
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];
  const button = cn(
    "pointer-events-auto flex items-center justify-center transition-colors disabled:cursor-default disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    s.button
  );

  return (
    <>
      <button
        type="button"
        onClick={() => onVote(myVote === 1 ? 0 : 1)}
        disabled={disabled}
        aria-pressed={myVote === 1}
        aria-label={labels.like}
        title={labels.like}
        className={cn(
          button,
          myVote === 1
            ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
            : "text-muted-foreground hover:bg-emerald-600/10 hover:text-emerald-700 dark:hover:text-emerald-400"
        )}
      >
        <ArrowBigUp className={cn(s.icon, myVote === 1 && "fill-current")} />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center font-semibold tabular-nums",
          s.score,
          myVote === 1 && "text-emerald-700 dark:text-emerald-400",
          myVote === -1 && "text-rose-700 dark:text-rose-400"
        )}
      >
        <span className="sr-only">{labels.score} </span>
        {score ?? "·"}
      </span>
      <button
        type="button"
        onClick={() => onVote(myVote === -1 ? 0 : -1)}
        disabled={disabled}
        aria-pressed={myVote === -1}
        aria-label={labels.dislike}
        title={labels.dislike}
        className={cn(
          button,
          myVote === -1
            ? "bg-rose-600/10 text-rose-700 dark:text-rose-400"
            : "text-muted-foreground hover:bg-rose-600/10 hover:text-rose-700 dark:hover:text-rose-400"
        )}
      >
        <ArrowBigDown className={cn(s.icon, myVote === -1 && "fill-current")} />
      </button>
    </>
  );
}

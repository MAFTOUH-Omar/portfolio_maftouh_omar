"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, MessageCircle, X } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PostEngagement, PublicComment, PublicThread } from "@/data/engagement";
import { getDictionary } from "@/data/dictionaries";
import { localeConfig, type Locale } from "@/lib/i18n";
import { toneFor } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import { postJson, setComposerOpen, setEngagement, useComposerOpen, useEngagement } from "./store";

type Labels = ReturnType<typeof getDictionary>["engagement"];
type Notice = { kind: "ok" | "error"; text: string } | null;

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/**
 * Comment section: one comment per visitor and post (signature-based, no
 * account), the author's replies, and the visitor's single follow-up once
 * the author has answered. All rules are enforced server-side; this only
 * shows the form when it would be accepted.
 *
 * Nothing renders while loading, on error, or when the post has no comment
 * yet — the reactions bar's "Comment" button opens the form on demand.
 */
export function PostComments({
  postId,
  locale,
  authorName,
  authorInitials,
}: {
  postId: string;
  locale: Locale;
  authorName: string;
  authorInitials: string;
}) {
  const { data } = useEngagement(postId);
  const composerOpen = useComposerOpen(postId);
  const t = getDictionary(locale).engagement;
  const dateLocale = localeConfig[locale].dateLocale;
  const [notice, setNotice] = useState<Notice>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const ready = !!data;
  const hasThreads = !!data && data.threads.length > 0;

  // Opened from the reactions bar: bring the form into view and focus it.
  useEffect(() => {
    if (!composerOpen || !ready) return;
    const section = sectionRef.current;
    section?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    section?.querySelector("textarea")?.focus({ preventScroll: true });
  }, [composerOpen, ready]);

  // Arriving from a card's "💬 3" link: the section only exists once the
  // threads have loaded, too late for the browser's own #comments jump.
  useEffect(() => {
    if (hasThreads && window.location.hash === "#comments") {
      sectionRef.current?.scrollIntoView({ block: "start" });
    }
  }, [hasThreads]);

  if (!data || (!hasThreads && !composerOpen)) return null;

  async function send(payload: { name?: string; body: string; parentId?: string; website?: string }) {
    const { status, data: fresh } = await postJson<PostEngagement>(
      `/api/blog/posts/${postId}/comments`,
      payload
    );
    if (status === 201 && fresh) {
      setEngagement(postId, fresh);
      setNotice({ kind: "ok", text: fresh.moderation ? `${t.sent} ${t.moderation}` : t.sent });
      return true;
    }
    setNotice({
      kind: "error",
      text: status === 429 ? t.rateLimited : status === 409 ? t.already : t.error,
    });
    return false;
  }

  return (
    <section
      ref={sectionRef}
      id="comments"
      aria-labelledby="comments-heading"
      className="mt-12 flex scroll-mt-8 flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <SectionHeading
          id="comments-heading"
          index={<MessageCircle className="size-4 sm:size-5" />}
          title={data.comments > 0 ? `${t.heading} (${data.comments})` : t.heading}
        />
        {!hasThreads && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.close}
            title={t.close}
            onClick={() => setComposerOpen(postId, false)}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {data.canComment ? (
        <CommentForm labels={t} onSubmit={send} withName rule={t.rule} />
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">{t.already}</p>
      )}

      {notice && (
        <p
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm",
            notice.kind === "ok"
              ? "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-600/10 text-rose-800 dark:text-rose-300"
          )}
        >
          {notice.kind === "ok" && <CheckCircle2 className="size-4 shrink-0" />}
          {notice.text}
        </p>
      )}

      {hasThreads ? (
        <ol className="flex flex-col gap-3">
          {data.threads.map((thread) => (
            <Thread
              key={thread.id}
              thread={thread}
              labels={t}
              dateLocale={dateLocale}
              authorName={authorName}
              authorInitials={authorInitials}
              onFollowUp={(body) => send({ body, parentId: thread.id })}
            />
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      )}
    </section>
  );
}

function Thread({
  thread,
  labels,
  dateLocale,
  authorName,
  authorInitials,
  onFollowUp,
}: {
  thread: PublicThread;
  labels: Labels;
  dateLocale: string;
  authorName: string;
  authorInitials: string;
  onFollowUp: (body: string) => Promise<boolean>;
}) {
  const common = { labels, dateLocale, authorName, authorInitials };
  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-4",
        thread.mine && "border-primary/40"
      )}
    >
      <Message comment={thread} mine={thread.mine} {...common} />
      {thread.replies.length > 0 && (
        <ol className="mt-4 flex flex-col gap-3 sm:ml-11">
          {thread.replies.map((reply) => (
            <li key={reply.id} className="rounded-md bg-muted/60 p-3">
              <Message comment={reply} mine={thread.mine && reply.author === "visitor"} {...common} />
            </li>
          ))}
        </ol>
      )}
      {thread.canFollowUp && (
        <div className="mt-3 rounded-md border border-dashed p-3 sm:ml-11">
          <CommentForm labels={labels} onSubmit={(payload) => onFollowUp(payload.body)} rule={labels.followUpRule} followUp />
        </div>
      )}
    </li>
  );
}

function Message({
  comment,
  mine,
  labels,
  dateLocale,
  authorName,
  authorInitials,
}: {
  comment: PublicComment;
  mine: boolean;
  labels: Labels;
  dateLocale: string;
  authorName: string;
  authorInitials: string;
}) {
  const isAuthor = comment.author === "admin";
  const name = isAuthor ? authorName : comment.name || labels.anonymous;
  const date = new Date(comment.createdAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="flex gap-3">
      <span
        aria-hidden
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold",
          isAuthor
            ? "bg-hero-ink text-hero-panel dark:ring-1 dark:ring-white/10"
            : cn(toneFor(comment.name ?? comment.id).solid, "text-white")
        )}
      >
        {isAuthor ? authorInitials : name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-semibold">{name}</span>
          {isAuthor && (
            <span className="rounded-md bg-hero-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-hero-panel">
              {labels.author}
            </span>
          )}
          {mine && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {labels.you}
            </span>
          )}
          <time dateTime={comment.createdAt} className="font-mono text-[11px] text-muted-foreground">
            {date}
          </time>
          {comment.pending && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
              <Clock className="size-3" />
              {labels.pending}
            </span>
          )}
        </header>
        <p className="whitespace-pre-line break-words text-justify text-sm text-pretty text-foreground/90 hyphens-auto">{comment.body}</p>
      </div>
    </article>
  );
}

function CommentForm({
  labels,
  onSubmit,
  rule,
  withName = false,
  followUp = false,
}: {
  labels: Labels;
  onSubmit: (payload: { name?: string; body: string; website?: string }) => Promise<boolean>;
  rule: string;
  withName?: boolean;
  followUp?: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    if (body.length < 2) return;
    setPending(true);
    const ok = await onSubmit({
      name: withName ? String(formData.get("name") ?? "") : undefined,
      body,
      website: String(formData.get("website") ?? "") || undefined,
    });
    setPending(false);
    if (ok) form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Honeypot: invisible to people and screen readers, catches form-filling bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {withName && (
        <Input
          name="name"
          maxLength={60}
          autoComplete="nickname"
          placeholder={labels.namePlaceholder}
          aria-label={labels.namePlaceholder}
          className="sm:max-w-xs"
        />
      )}
      <Textarea
        name="body"
        required
        minLength={2}
        maxLength={2000}
        rows={followUp ? 2 : 4}
        placeholder={followUp ? labels.followUpPlaceholder : labels.bodyPlaceholder}
        aria-label={followUp ? labels.followUpPlaceholder : labels.bodyPlaceholder}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{rule}</p>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? labels.sending : followUp ? labels.followUp : labels.submit}
        </Button>
      </div>
    </form>
  );
}

import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db/client";
import { postComments, posts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/components/admin/action-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { ListPagination } from "@/components/admin/list-pagination";
import { ListSearch } from "@/components/admin/list-search";
import { getSiteData } from "@/data/resume";
import { COMMENTS_REQUIRE_APPROVAL, engagementTablesReady } from "@/data/engagement";
import { EngagementMigrationNotice } from "@/components/admin/migration-notice";
import { localizePath, type Locale } from "@/lib/i18n";
import { paginate } from "@/lib/paginate";
import { cn } from "@/lib/utils";
import { shortSignature } from "@/lib/visitor";
import { deleteComment, replyToComment, setCommentStatus } from "./actions";

type CommentRow = typeof postComments.$inferSelect;
type Thread = {
  root: CommentRow;
  replies: CommentRow[];
  post: { title: string; slug: string; locale: string };
  lastActivity: number;
};

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "hidden", label: "Hidden" },
  { value: "all", label: "All" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

const STATUS_VARIANT = {
  pending: "outline",
  approved: "default",
  hidden: "secondary",
} as const;

function formatDateTime(date: Date) {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function matches(thread: Thread, filter: Filter) {
  const all = [thread.root, ...thread.replies];
  switch (filter) {
    case "pending":
      return all.some((comment) => comment.status === "pending");
    case "hidden":
      return all.some((comment) => comment.status === "hidden");
    case "approved":
      return thread.root.status === "approved";
    default:
      return true;
  }
}

function Meta({ comment }: { comment: CommentRow }) {
  const place = [comment.city, comment.country].filter(Boolean).join(", ");
  const client = [comment.browser, comment.os, comment.device].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
      <span title="Visitor signature (HMAC of IP + user agent)">sig {shortSignature(comment.visitorHash)}</span>
      {place && <span>{place}</span>}
      {client && <span>{client}</span>}
      <span>{formatDateTime(comment.createdAt)} UTC</span>
    </div>
  );
}

function Message({ comment, authorName }: { comment: CommentRow; authorName: string }) {
  const isAdmin = comment.authorType === "admin";
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold">
          {isAdmin ? authorName : comment.authorName || "Anonymous"}
        </span>
        {isAdmin ? (
          <Badge className="bg-hero-ink text-hero-panel">You</Badge>
        ) : (
          <Badge variant={STATUS_VARIANT[comment.status]}>{comment.status}</Badge>
        )}
      </div>
      {!isAdmin && <Meta comment={comment} />}
      <p className="whitespace-pre-line break-words text-sm">{comment.body}</p>
      <div className="flex flex-wrap gap-2">
        {!isAdmin && comment.status !== "approved" && (
          <ActionButton
            label="Approve"
            successMessage="Approved."
            action={setCommentStatus.bind(null, comment.id, "approved")}
          />
        )}
        {!isAdmin && comment.status !== "hidden" && (
          <ActionButton
            label="Hide"
            variant="ghost"
            successMessage="Hidden."
            action={setCommentStatus.bind(null, comment.id, "hidden")}
          />
        )}
        <DeleteButton
          action={deleteComment.bind(null, comment.id)}
          confirmMessage={
            comment.parentId
              ? "Delete this reply? This cannot be undone."
              : "Delete this comment and its whole thread? This cannot be undone."
          }
        />
      </div>
    </div>
  );
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status: statusParam, q = "", page: pageParam } = await searchParams;
  const filter: Filter = FILTERS.some((f) => f.value === statusParam) ? (statusParam as Filter) : "pending";

  if (!(await engagementTablesReady())) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
        <EngagementMigrationNotice />
      </div>
    );
  }

  const [rows, data] = await Promise.all([
    db
      .select({
        comment: postComments,
        post: { title: posts.title, slug: posts.slug, locale: posts.locale },
      })
      .from(postComments)
      .innerJoin(posts, eq(postComments.postId, posts.id))
      .orderBy(desc(postComments.createdAt)),
    getSiteData(),
  ]);

  const threadsById = new Map<string, Thread>();
  for (const { comment, post } of rows) {
    if (comment.parentId === null) {
      threadsById.set(comment.id, {
        root: comment,
        replies: [],
        post,
        lastActivity: comment.createdAt.getTime(),
      });
    }
  }
  for (const { comment } of rows) {
    if (!comment.parentId) continue;
    const thread = threadsById.get(comment.parentId);
    if (!thread) continue;
    thread.replies.push(comment);
    thread.lastActivity = Math.max(thread.lastActivity, comment.createdAt.getTime());
  }
  for (const thread of threadsById.values()) {
    thread.replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  const allThreads = [...threadsById.values()].sort((a, b) => b.lastActivity - a.lastActivity);
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.value, allThreads.filter((thread) => matches(thread, f.value)).length])
  ) as Record<Filter, number>;

  const needle = q.trim().toLowerCase();
  const filtered = allThreads.filter(
    (thread) =>
      matches(thread, filter) &&
      (!needle ||
        [thread.root, ...thread.replies].some(
          (comment) =>
            comment.body.toLowerCase().includes(needle) ||
            (comment.authorName ?? "").toLowerCase().includes(needle)
        ) ||
        thread.post.title.toLowerCase().includes(needle))
  );
  const { items, page, totalPages } = paginate(filtered, Number(pageParam) || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
          <p className="text-sm text-muted-foreground">
            One comment per visitor and post; once you reply, the visitor may answer once.
            {COMMENTS_REQUIRE_APPROVAL
              ? " New comments wait here until approved — replying approves them."
              : " New comments are published immediately."}
          </p>
        </div>
        <ListSearch placeholder="Search comments…" />
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "pending" ? "/admin/comments" : `/admin/comments?status=${f.value}`}
            className={cn(
              buttonVariants({ variant: filter === f.value ? "default" : "outline", size: "sm" }),
              "gap-2"
            )}
          >
            {f.label}
            <span className="tabular-nums opacity-70">{counts[f.value]}</span>
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No comments here.</Card>
      ) : (
        <div className="space-y-4">
          {items.map((thread) => {
            const visitorFollowUp = thread.replies.some((reply) => reply.authorType === "visitor");
            const adminReplied = thread.replies.some((reply) => reply.authorType === "admin");
            return (
              <Card key={thread.root.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <Link
                    href={localizePath(thread.post.locale as Locale, `/blog/${thread.post.slug}`)}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                  >
                    {thread.post.title}
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{thread.post.locale}</Badge>
                    <EntityDialog
                      trigger="Reply"
                      title="Reply to this comment"
                      description="Published immediately under your name; the visitor can then answer once."
                      action={replyToComment.bind(null, thread.root.id)}
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`reply-${thread.root.id}`}>Your reply</Label>
                        <Textarea id={`reply-${thread.root.id}`} name="body" required rows={5} />
                      </div>
                    </EntityDialog>
                  </div>
                </div>
                <Message comment={thread.root} authorName={data.fullName} />
                {thread.replies.length > 0 && (
                  <div className="space-y-4 border-l-2 border-primary/30 pl-4">
                    {thread.replies.map((reply) => (
                      <Message key={reply.id} comment={reply} authorName={data.fullName} />
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {visitorFollowUp
                    ? "The visitor has used their one follow-up."
                    : adminReplied
                      ? "Waiting on the visitor: they may reply once."
                      : "No reply from you yet."}
                </p>
              </Card>
            );
          })}
        </div>
      )}
      <ListPagination
        basePath="/admin/comments"
        page={page}
        totalPages={totalPages}
        query={{ q, status: filter === "pending" ? undefined : filter }}
      />
    </div>
  );
}

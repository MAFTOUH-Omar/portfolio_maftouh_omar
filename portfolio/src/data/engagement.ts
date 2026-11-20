import { and, asc, count, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { postComments, postVotes, posts } from "@/db/schema";
import { pgErrorCode } from "@/lib/db-errors";
import { newId } from "@/lib/id";
import type { Visitor } from "@/lib/visitor";

/**
 * Visitor comments (and their one follow-up) wait in /admin/comments until
 * approved; replying to a thread approves its root. Set to false to publish
 * immediately — the one-per-visitor rules and rate limit still apply.
 */
export const COMMENTS_REQUIRE_APPROVAL = true;

const RATE_WINDOW_MINUTES = 10;
const RATE_MAX_MESSAGES = 3;

export type VoteValue = -1 | 0 | 1;

/** Aggregate numbers for one post. */
export type PostStats = { score: number; comments: number };

/** What a post card shows: the aggregates plus this visitor's own vote. */
export type CardStats = PostStats & { myVote: VoteValue };

export type PublicComment = {
  id: string;
  author: "visitor" | "admin";
  name: string | null;
  body: string;
  createdAt: string;
  /** Only ever true on the requesting visitor's own messages. */
  pending: boolean;
};

export type PublicThread = PublicComment & {
  mine: boolean;
  /** The visitor may post their single follow-up (author replied, none yet). */
  canFollowUp: boolean;
  replies: PublicComment[];
};

export type PostEngagement = PostStats & {
  myVote: VoteValue;
  threads: PublicThread[];
  canComment: boolean;
  /** Mirrors COMMENTS_REQUIRE_APPROVAL for the client's wording. */
  moderation: boolean;
};

export type CommentError = "rate_limited" | "already_commented" | "not_allowed";

/** False until drizzle/0002_post_engagement.sql has been applied. */
export async function engagementTablesReady(): Promise<boolean> {
  const result = await db.execute<{ ready: boolean }>(
    sql`select (to_regclass('public.post_votes') is not null and to_regclass('public.post_comments') is not null) as ready`
  );
  return Boolean(result.rows[0]?.ready);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function isPublishedPost(postId: string): Promise<boolean> {
  if (!isUuid(postId)) return false;
  const [row] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.status, "published")))
    .limit(1);
  return !!row;
}

/** An approved message whose thread is visible (an approved reply under a
 *  hidden root must not be counted). */
const visibleApproved = sql`${postComments.status} = 'approved' and (${postComments.parentId} is null or ${postComments.parentId} in (select id from post_comments where status = 'approved'))`;

/** Net score (likes − dislikes) and visible comment count, per post. */
export async function getPostStats(postIds: string[]): Promise<Record<string, PostStats>> {
  const ids = postIds.filter(isUuid);
  const result: Record<string, PostStats> = {};
  for (const id of ids) result[id] = { score: 0, comments: 0 };
  if (ids.length === 0) return result;

  const [votes, comments] = await Promise.all([
    db
      .select({ postId: postVotes.postId, score: sql<string>`coalesce(sum(${postVotes.value}), 0)` })
      .from(postVotes)
      .where(inArray(postVotes.postId, ids))
      .groupBy(postVotes.postId),
    db
      .select({ postId: postComments.postId, total: count() })
      .from(postComments)
      .where(and(inArray(postComments.postId, ids), visibleApproved))
      .groupBy(postComments.postId),
  ]);
  for (const row of votes) result[row.postId].score = Number(row.score);
  for (const row of comments) result[row.postId].comments = Number(row.total);
  return result;
}

/** Card counters for a batch of posts, with the visitor's vote on each. */
export async function getCardStats(
  postIds: string[],
  visitorHash: string
): Promise<Record<string, CardStats>> {
  const ids = postIds.filter(isUuid);
  if (ids.length === 0) return {};
  const [stats, mine] = await Promise.all([
    getPostStats(ids),
    db
      .select({ postId: postVotes.postId, value: postVotes.value })
      .from(postVotes)
      .where(and(inArray(postVotes.postId, ids), eq(postVotes.visitorHash, visitorHash))),
  ]);
  const myVotes = new Map(mine.map((row) => [row.postId, row.value as VoteValue]));
  return Object.fromEntries(
    Object.entries(stats).map(([id, value]) => [id, { ...value, myVote: myVotes.get(id) ?? 0 }])
  );
}

async function getMyVote(postId: string, visitorHash: string): Promise<VoteValue> {
  const [row] = await db
    .select({ value: postVotes.value })
    .from(postVotes)
    .where(and(eq(postVotes.postId, postId), eq(postVotes.visitorHash, visitorHash)))
    .limit(1);
  return (row?.value ?? 0) as VoteValue;
}

/** Sets (1 / -1) or clears (0) the visitor's vote — one row per visitor. */
export async function castVote(postId: string, visitor: Visitor, value: VoteValue): Promise<void> {
  if (value === 0) {
    await db
      .delete(postVotes)
      .where(and(eq(postVotes.postId, postId), eq(postVotes.visitorHash, visitor.hash)));
    return;
  }
  await db
    .insert(postVotes)
    .values({ id: newId(), postId, visitorHash: visitor.hash, value, ...visitor.meta })
    .onConflictDoUpdate({
      target: [postVotes.postId, postVotes.visitorHash],
      set: { value, updatedAt: new Date(), ...visitor.meta },
    });
}

/** Everything the post page's reactions bar and comment section need, as
 *  seen by this visitor (their own pending messages included). */
export async function getPostEngagement(postId: string, visitorHash: string): Promise<PostEngagement> {
  const [rows, stats, myVote] = await Promise.all([
    db
      .select()
      .from(postComments)
      .where(and(eq(postComments.postId, postId), sql`${postComments.status} <> 'hidden'`))
      .orderBy(asc(postComments.createdAt)),
    getPostStats([postId]),
    getMyVote(postId, visitorHash),
  ]);

  const toPublic = (row: (typeof rows)[number]): PublicComment => ({
    id: row.id,
    author: row.authorType,
    name: row.authorType === "admin" ? null : row.authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    pending: row.status === "pending",
  });
  const visibleTo = (row: (typeof rows)[number]) =>
    row.status === "approved" || row.visitorHash === visitorHash;

  const threads: PublicThread[] = [];
  let hasOwnRoot = false;
  for (const root of rows.filter((row) => row.parentId === null && row.authorType === "visitor")) {
    const mine = root.visitorHash === visitorHash;
    if (mine) hasOwnRoot = true;
    if (!visibleTo(root)) continue;
    const children = rows.filter((row) => row.parentId === root.id);
    const authorReplied = children.some((row) => row.authorType === "admin");
    const followedUp = children.some((row) => row.authorType === "visitor");
    threads.push({
      ...toPublic(root),
      mine,
      canFollowUp: mine && authorReplied && !followedUp,
      replies: children.filter(visibleTo).map(toPublic),
    });
  }

  // Hidden own root still counts: the "one comment per post" rule holds.
  if (!hasOwnRoot) {
    const [hidden] = await db
      .select({ id: postComments.id })
      .from(postComments)
      .where(
        and(
          eq(postComments.postId, postId),
          eq(postComments.visitorHash, visitorHash),
          isNull(postComments.parentId)
        )
      )
      .limit(1);
    hasOwnRoot = !!hidden;
  }

  return {
    ...stats[postId],
    myVote,
    threads,
    canComment: !hasOwnRoot,
    moderation: COMMENTS_REQUIRE_APPROVAL,
  };
}

async function isRateLimited(visitorHash: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000);
  const [row] = await db
    .select({ total: count() })
    .from(postComments)
    .where(and(eq(postComments.visitorHash, visitorHash), gte(postComments.createdAt, since)));
  return Number(row?.total ?? 0) >= RATE_MAX_MESSAGES;
}

function isUniqueViolation(error: unknown): boolean {
  return pgErrorCode(error) === "23505";
}

/** A visitor's root comment — at most one per post. */
export async function addComment(
  postId: string,
  visitor: Visitor,
  name: string | null,
  body: string
): Promise<CommentError | null> {
  if (await isRateLimited(visitor.hash)) return "rate_limited";
  try {
    await db.insert(postComments).values({
      id: newId(),
      postId,
      authorType: "visitor",
      authorName: name,
      visitorHash: visitor.hash,
      body,
      status: COMMENTS_REQUIRE_APPROVAL ? "pending" : "approved",
      ...visitor.meta,
    });
    return null;
  } catch (error) {
    if (isUniqueViolation(error)) return "already_commented";
    throw error;
  }
}

/** The visitor's single follow-up, only once the author has replied. */
export async function addFollowUp(
  postId: string,
  rootId: string,
  visitor: Visitor,
  body: string
): Promise<CommentError | null> {
  if (!isUuid(rootId)) return "not_allowed";
  const [root] = await db
    .select()
    .from(postComments)
    .where(and(eq(postComments.id, rootId), eq(postComments.postId, postId), isNull(postComments.parentId)))
    .limit(1);
  if (!root || root.visitorHash !== visitor.hash || root.status === "hidden") return "not_allowed";

  const children = await db
    .select({ authorType: postComments.authorType, status: postComments.status })
    .from(postComments)
    .where(eq(postComments.parentId, rootId));
  const authorReplied = children.some((row) => row.authorType === "admin" && row.status === "approved");
  if (!authorReplied || children.some((row) => row.authorType === "visitor")) return "not_allowed";
  if (await isRateLimited(visitor.hash)) return "rate_limited";

  try {
    await db.insert(postComments).values({
      id: newId(),
      postId,
      parentId: rootId,
      authorType: "visitor",
      authorName: root.authorName,
      visitorHash: visitor.hash,
      body,
      status: COMMENTS_REQUIRE_APPROVAL ? "pending" : "approved",
      ...visitor.meta,
    });
    return null;
  } catch (error) {
    if (isUniqueViolation(error)) return "not_allowed";
    throw error;
  }
}

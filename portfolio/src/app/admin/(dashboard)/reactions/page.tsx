import Link from "next/link";
import { count, desc, eq, max, sql } from "drizzle-orm";
import { ArrowLeft, ExternalLink, ThumbsDown, ThumbsUp, Users } from "lucide-react";
import { db } from "@/db/client";
import { postComments, postVotes, posts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListPagination } from "@/components/admin/list-pagination";
import { engagementTablesReady, isUuid } from "@/data/engagement";
import { EngagementMigrationNotice } from "@/components/admin/migration-notice";
import { localizePath, type Locale } from "@/lib/i18n";
import { paginate } from "@/lib/paginate";
import { shortSignature } from "@/lib/visitor";

const likes = sql<string>`coalesce(sum(case when ${postVotes.value} = 1 then 1 else 0 end), 0)`;
const dislikes = sql<string>`coalesce(sum(case when ${postVotes.value} = -1 then 1 else 0 end), 0)`;

function formatDateTime(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toISOString().slice(0, 16).replace("T", " ");
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Users }) {
  return (
    <Card className="p-4 sm:p-5">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function BarList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const maxCount = Math.max(1, ...rows.map((row) => row.count));
  return (
    <Card className="p-4 sm:p-5">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 truncate" title={row.label}>{row.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(row.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums">{row.count}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------- one post */

async function PostVotes({ postId, pageParam }: { postId: string; pageParam?: string }) {
  const [post] = await db
    .select({ id: posts.id, title: posts.title, slug: posts.slug, locale: posts.locale })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) {
    return <Card className="p-8 text-center text-sm text-muted-foreground">Post not found.</Card>;
  }

  const votes = await db
    .select()
    .from(postVotes)
    .where(eq(postVotes.postId, postId))
    .orderBy(desc(postVotes.updatedAt));
  const likeCount = votes.filter((vote) => vote.value === 1).length;
  const dislikeCount = votes.length - likeCount;

  const breakdown = (key: "country" | "device" | "browser") => {
    const tally = new Map<string, number>();
    for (const vote of votes) {
      const label = vote[key] ?? "Unknown";
      tally.set(label, (tally.get(label) ?? 0) + 1);
    }
    return [...tally.entries()]
      .map(([label, value]) => ({ label, count: value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  const { items, page, totalPages } = paginate(votes, Number(pageParam) || 1, 20);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/reactions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All posts
        </Link>
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">
          {post.title}
          <Badge variant="outline">{post.locale}</Badge>
          <Link
            href={localizePath(post.locale as Locale, `/blog/${post.slug}`)}
            target="_blank"
            aria-label="Open the post"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
          </Link>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Likes" value={likeCount} icon={ThumbsUp} />
        <StatCard label="Dislikes" value={dislikeCount} icon={ThumbsDown} />
        <StatCard label="Net score" value={likeCount - dislikeCount} icon={ThumbsUp} />
        <StatCard
          label="Approval"
          value={votes.length ? `${Math.round((likeCount / votes.length) * 100)}%` : "—"}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BarList title="Countries" rows={breakdown("country")} />
        <BarList title="Devices" rows={breakdown("device")} />
        <BarList title="Browsers" rows={breakdown("browser")} />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vote</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="text-right">Last change (UTC)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No votes yet.
                </TableCell>
              </TableRow>
            )}
            {items.map((vote) => (
              <TableRow key={vote.id}>
                <TableCell>
                  {vote.value === 1 ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <ThumbsUp className="size-4" /> Like
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                      <ThumbsDown className="size-4" /> Dislike
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs" title={vote.visitorHash}>
                  {shortSignature(vote.visitorHash)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {[vote.city, vote.country].filter(Boolean).join(", ") || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {[vote.browser, vote.os, vote.device].filter(Boolean).join(" · ") || "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">{formatDateTime(vote.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ListPagination
          basePath="/admin/reactions"
          page={page}
          totalPages={totalPages}
          query={{ post: post.id }}
        />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------- all posts */

async function AllPosts({ pageParam }: { pageParam?: string }) {
  const [rows, commentRows, [totals]] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        locale: posts.locale,
        likes,
        dislikes,
        lastVote: max(postVotes.updatedAt),
      })
      .from(posts)
      .leftJoin(postVotes, eq(postVotes.postId, posts.id))
      .where(eq(posts.status, "published"))
      .groupBy(posts.id, posts.title, posts.locale),
    db
      .select({ postId: postComments.postId, total: count() })
      .from(postComments)
      .where(eq(postComments.authorType, "visitor"))
      .groupBy(postComments.postId),
    db
      .select({
        likes,
        dislikes,
        voters: sql<string>`count(distinct ${postVotes.visitorHash})`,
      })
      .from(postVotes),
  ]);

  const commentsByPost = new Map(commentRows.map((row) => [row.postId, Number(row.total)]));
  const postsWithStats = rows
    .map((row) => ({
      ...row,
      likes: Number(row.likes),
      dislikes: Number(row.dislikes),
      comments: commentsByPost.get(row.id) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.likes + b.dislikes - (a.likes + a.dislikes) ||
        new Date(b.lastVote ?? 0).getTime() - new Date(a.lastVote ?? 0).getTime()
    );
  const { items, page, totalPages } = paginate(postsWithStats, Number(pageParam) || 1, 15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Likes &amp; dislikes</h1>
        <p className="text-sm text-muted-foreground">
          Anonymous votes — one per visitor signature (HMAC of IP + user agent, never the raw IP). The
          public site only shows the net score.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Likes" value={Number(totals?.likes ?? 0)} icon={ThumbsUp} />
        <StatCard label="Dislikes" value={Number(totals?.dislikes ?? 0)} icon={ThumbsDown} />
        <StatCard
          label="Net score"
          value={Number(totals?.likes ?? 0) - Number(totals?.dislikes ?? 0)}
          icon={ThumbsUp}
        />
        <StatCard label="Unique voters" value={Number(totals?.voters ?? 0)} icon={Users} />
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Dislikes</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Score</TableHead>
              <TableHead className="hidden text-right md:table-cell">Comments</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Last vote (UTC)</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-72">
                  <span className="line-clamp-2">{row.title}</span>
                  <Badge variant="outline" className="mt-1">{row.locale}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-700 dark:text-emerald-400">{row.likes}</TableCell>
                <TableCell className="text-right tabular-nums text-rose-700 dark:text-rose-400">{row.dislikes}</TableCell>
                <TableCell className="hidden text-right font-semibold tabular-nums sm:table-cell">
                  {row.likes - row.dislikes}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">{row.comments}</TableCell>
                <TableCell className="hidden text-right font-mono text-xs lg:table-cell">
                  {formatDateTime(row.lastVote)}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/reactions?post=${row.id}`} className="text-sm font-medium text-primary hover:underline">
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ListPagination basePath="/admin/reactions" page={page} totalPages={totalPages} />
      </Card>
    </div>
  );
}

export default async function AdminReactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string; page?: string }>;
}) {
  const { post, page } = await searchParams;
  if (!(await engagementTablesReady())) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Likes &amp; dislikes</h1>
        <EngagementMigrationNotice />
      </div>
    );
  }
  if (post && isUuid(post)) return <PostVotes postId={post} pageParam={page} />;
  return <AllPosts pageParam={page} />;
}

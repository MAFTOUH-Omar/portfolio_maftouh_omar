import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { postTags, posts as postsTable, tags as tagsTable } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EntityDialog } from "@/components/admin/entity-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { createPost, deletePost, updatePost } from "./actions";

type PostRow = typeof postsTable.$inferSelect;
type TagRow = typeof tagsTable.$inferSelect;

function toDateInput(value: Date | null) {
  return (value ?? new Date()).toISOString().slice(0, 10);
}

function PostFields({
  post,
  allTags,
  selectedTagIds,
}: {
  post?: PostRow;
  allTags: TagRow[];
  selectedTagIds: Set<string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" required defaultValue={post?.slug} placeholder="my-post" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="locale">Locale</Label>
        <select
          id="locale"
          name="locale"
          required
          defaultValue={post?.locale ?? "fr"}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="fr">French (/blog)</option>
          <option value="en">English (/en/blog)</option>
        </select>
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={post?.title} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" required rows={2} defaultValue={post?.summary} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="contentMd">Content (Markdown)</Label>
        <Textarea id="contentMd" name="contentMd" required rows={14} className="font-mono text-xs" defaultValue={post?.contentMd} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="coverImage">Cover image URL (optional)</Label>
        <Input id="coverImage" name="coverImage" defaultValue={post?.coverImage ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          required
          defaultValue={post?.status ?? "draft"}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="publishedAt">Published date</Label>
        <Input id="publishedAt" name="publishedAt" type="date" required defaultValue={toDateInput(post?.publishedAt ?? null)} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="metaTitle">SEO meta title (optional)</Label>
        <Input id="metaTitle" name="metaTitle" defaultValue={post?.metaTitle ?? ""} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="metaDescription">SEO meta description (optional)</Label>
        <Textarea id="metaDescription" name="metaDescription" rows={2} defaultValue={post?.metaDescription ?? ""} />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-3 rounded-md border p-3">
          {allTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet — create some in Tags first.</p>
          ) : (
            allTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={selectedTagIds.has(tag.id)}
                  className="size-4 rounded border-input"
                />
                {tag.nameEn}
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AdminPostsPage() {
  const [postRows, allTags, tagLinks] = await Promise.all([
    db.select().from(postsTable).orderBy(desc(postsTable.updatedAt)),
    db.select().from(tagsTable),
    db.select().from(postTags),
  ]);

  const tagsByPost = new Map<string, Set<string>>();
  for (const link of tagLinks) {
    const set = tagsByPost.get(link.postId) ?? new Set<string>();
    set.add(link.tagId);
    tagsByPost.set(link.postId, set);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog posts</h1>
        <EntityDialog
          trigger="New post"
          title="New post"
          action={createPost}
          contentClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
        >
          <PostFields allTags={allTags} selectedTagIds={new Set()} />
        </EntityDialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Locale</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {postRows.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.locale}</TableCell>
              <TableCell>
                <Badge variant={post.status === "published" ? "default" : "outline"}>{post.status}</Badge>
              </TableCell>
              <TableCell>{post.updatedAt.toISOString().slice(0, 10)}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <EntityDialog
                  trigger="Edit"
                  triggerVariant="outline"
                  title="Edit post"
                  action={updatePost.bind(null, post.id)}
                  contentClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
                >
                  <PostFields post={post} allTags={allTags} selectedTagIds={tagsByPost.get(post.id) ?? new Set()} />
                </EntityDialog>
                <DeleteButton action={deletePost.bind(null, post.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

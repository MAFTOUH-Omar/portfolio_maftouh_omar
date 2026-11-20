"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { postComments } from "@/db/schema";
import { newId } from "@/lib/id";
import { getSession } from "@/lib/session";

// Public comment lists are fetched live by the post page (no cached HTML to
// refresh), so only the admin view needs revalidating.

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");
}

const statusSchema = z.enum(["pending", "approved", "hidden"]);

export async function setCommentStatus(id: string, status: "pending" | "approved" | "hidden") {
  await requireSession();
  await db.update(postComments).set({ status: statusSchema.parse(status) }).where(eq(postComments.id, id));
  revalidatePath("/admin/comments");
}

/** Deleting a root removes its whole thread (FK cascade). */
export async function deleteComment(id: string) {
  await requireSession();
  await db.delete(postComments).where(eq(postComments.id, id));
  revalidatePath("/admin/comments");
}

const replySchema = z.object({ body: z.string().trim().min(1).max(4000) });

/**
 * The author's reply to a visitor thread. Published immediately, and it
 * approves the visitor's comment it answers — replying is moderating. The
 * visitor can then post their single follow-up.
 */
export async function replyToComment(rootId: string, formData: FormData) {
  await requireSession();
  const { body } = replySchema.parse({ body: formData.get("body") });

  const [root] = await db
    .select({ id: postComments.id, postId: postComments.postId, status: postComments.status })
    .from(postComments)
    .where(and(eq(postComments.id, rootId), isNull(postComments.parentId)))
    .limit(1);
  if (!root) throw new Error("Comment not found.");

  await db.insert(postComments).values({
    id: newId(),
    postId: root.postId,
    parentId: root.id,
    authorType: "admin",
    body,
    status: "approved",
  });
  if (root.status === "pending") {
    await db.update(postComments).set({ status: "approved" }).where(eq(postComments.id, root.id));
  }
  revalidatePath("/admin/comments");
}

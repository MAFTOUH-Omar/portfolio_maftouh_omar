"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { postTags, posts } from "@/db/schema";
import { newId } from "@/lib/id";
import { getSession } from "@/lib/session";

const postSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only."),
  locale: z.enum(["fr", "en"]),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  contentMd: z.string().min(1),
  coverImage: z.string().trim().max(500).optional(),
  status: z.enum(["draft", "published"]),
  metaTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(300).optional(),
  publishedAt: z.string().min(1),
});

function parseTagIds(formData: FormData): string[] {
  return formData.getAll("tagIds").map((value) => String(value));
}

async function syncTags(postId: string, tagIds: string[]) {
  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (tagIds.length > 0) {
    await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
  }
}

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");
}

function revalidatePosts(slug?: string, locale?: string) {
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/en/blog");
  if (slug && locale) {
    revalidatePath(`/${locale === "fr" ? "" : "en/"}blog/${slug}`);
  }
}

function parsePostForm(formData: FormData) {
  const data = postSchema.parse({
    slug: formData.get("slug"),
    locale: formData.get("locale"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    contentMd: formData.get("contentMd"),
    coverImage: formData.get("coverImage") || undefined,
    status: formData.get("status"),
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    publishedAt: formData.get("publishedAt"),
  });

  return {
    slug: data.slug,
    locale: data.locale,
    title: data.title,
    summary: data.summary,
    contentMd: data.contentMd,
    coverImage: data.coverImage || null,
    status: data.status,
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
    publishedAt: new Date(data.publishedAt),
    updatedAt: new Date(),
  };
}

export async function createPost(formData: FormData) {
  await requireSession();
  const data = parsePostForm(formData);
  const id = newId();
  await db.insert(posts).values({ id, ...data });
  await syncTags(id, parseTagIds(formData));
  revalidatePosts(data.slug, data.locale);
}

export async function updatePost(id: string, formData: FormData) {
  await requireSession();
  const data = parsePostForm(formData);
  await db.update(posts).set(data).where(eq(posts.id, id));
  await syncTags(id, parseTagIds(formData));
  revalidatePosts(data.slug, data.locale);
}

export async function deletePost(id: string) {
  await requireSession();
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePosts();
}

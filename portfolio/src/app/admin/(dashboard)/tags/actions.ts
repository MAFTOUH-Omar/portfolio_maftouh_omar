"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { tags } from "@/db/schema";
import { newId } from "@/lib/id";
import { revalidatePublicSite } from "@/lib/revalidate";
import { getSession } from "@/lib/session";

const tagSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only."),
  nameFr: z.string().min(1).max(60),
  nameEn: z.string().min(1).max(60),
});

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");
}

function revalidateTags() {
  revalidatePath("/admin/tags");
  // Tag names show on every post, tag hub, sitemap entry and the switcher.
  revalidatePublicSite();
}

export async function createTag(formData: FormData) {
  await requireSession();
  const data = tagSchema.parse({
    slug: formData.get("slug"),
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn"),
  });
  await db.insert(tags).values({ id: newId(), ...data });
  revalidateTags();
}

export async function updateTag(id: string, formData: FormData) {
  await requireSession();
  const data = tagSchema.parse({
    slug: formData.get("slug"),
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn"),
  });
  await db.update(tags).set(data).where(eq(tags.id, id));
  revalidateTags();
}

export async function deleteTag(id: string) {
  await requireSession();
  await db.delete(tags).where(eq(tags.id, id));
  revalidateTags();
}

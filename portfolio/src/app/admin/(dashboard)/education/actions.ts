"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { education } from "@/db/schema";
import { newId } from "@/lib/id";
import { getSession } from "@/lib/session";

const educationSchema = z.object({
  school: z.string().min(1).max(200),
  href: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().max(500).optional(),
  degreeFr: z.string().min(1).max(300),
  degreeEn: z.string().min(1).max(300),
  start: z.string().min(1).max(50),
  end: z.string().trim().max(50).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

function parseForm(formData: FormData) {
  const data = educationSchema.parse({
    school: formData.get("school"),
    href: formData.get("href") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    degreeFr: formData.get("degreeFr"),
    degreeEn: formData.get("degreeEn"),
    start: formData.get("start"),
    end: formData.get("end") || undefined,
    sortOrder: formData.get("sortOrder"),
  });
  return { ...data, href: data.href || null, logoUrl: data.logoUrl || null, end: data.end || null };
}

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");
}

function revalidateEducation() {
  revalidatePath("/admin/education");
  revalidatePath("/");
  revalidatePath("/en");
}

export async function createEducation(formData: FormData) {
  await requireSession();
  await db.insert(education).values({ id: newId(), ...parseForm(formData) });
  revalidateEducation();
}

export async function updateEducation(id: string, formData: FormData) {
  await requireSession();
  await db.update(education).set(parseForm(formData)).where(eq(education.id, id));
  revalidateEducation();
}

export async function deleteEducation(id: string) {
  await requireSession();
  await db.delete(education).where(eq(education.id, id));
  revalidateEducation();
}

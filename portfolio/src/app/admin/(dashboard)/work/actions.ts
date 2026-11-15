"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { workExperiences } from "@/db/schema";
import { newId } from "@/lib/id";
import { getSession } from "@/lib/session";

const workSchema = z.object({
  company: z.string().min(1).max(200),
  href: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().max(500).optional(),
  locationFr: z.string().min(1).max(100),
  locationEn: z.string().min(1).max(100),
  titleFr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  startFr: z.string().min(1).max(100),
  startEn: z.string().min(1).max(100),
  endFr: z.string().min(1).max(100),
  endEn: z.string().min(1).max(100),
  descriptionFr: z.string().min(1),
  descriptionEn: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
});

function parseForm(formData: FormData) {
  const data = workSchema.parse({
    company: formData.get("company"),
    href: formData.get("href") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    locationFr: formData.get("locationFr"),
    locationEn: formData.get("locationEn"),
    titleFr: formData.get("titleFr"),
    titleEn: formData.get("titleEn"),
    startFr: formData.get("startFr"),
    startEn: formData.get("startEn"),
    endFr: formData.get("endFr"),
    endEn: formData.get("endEn"),
    descriptionFr: formData.get("descriptionFr"),
    descriptionEn: formData.get("descriptionEn"),
    sortOrder: formData.get("sortOrder"),
  });
  return { ...data, href: data.href || null, logoUrl: data.logoUrl || null };
}

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");
}

function revalidateWork() {
  revalidatePath("/admin/work");
  revalidatePath("/");
  revalidatePath("/en");
}

export async function createWorkExperience(formData: FormData) {
  await requireSession();
  await db.insert(workExperiences).values({ id: newId(), ...parseForm(formData) });
  revalidateWork();
}

export async function updateWorkExperience(id: string, formData: FormData) {
  await requireSession();
  await db.update(workExperiences).set(parseForm(formData)).where(eq(workExperiences.id, id));
  revalidateWork();
}

export async function deleteWorkExperience(id: string) {
  await requireSession();
  await db.delete(workExperiences).where(eq(workExperiences.id, id));
  revalidateWork();
}

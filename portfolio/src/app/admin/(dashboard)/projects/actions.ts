"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import type { LinkKind } from "@/data/resume";
import { newId } from "@/lib/id";
import { revalidatePublicSite } from "@/lib/revalidate";
import { getSession } from "@/lib/session";

const LINK_KINDS: { field: string; kind: LinkKind }[] = [
  { field: "linkWebsite", kind: "website" },
  { field: "linkSource", kind: "source" },
  { field: "linkApiDocs", kind: "apiDocs" },
];

const projectSchema = z.object({
  title: z.string().min(1).max(200),
  href: z.string().trim().max(500).optional(),
  datesFr: z.string().min(1).max(100),
  datesEn: z.string().min(1).max(100),
  descriptionFr: z.string().min(1),
  descriptionEn: z.string().min(1),
  technologiesText: z.string().optional(),
  imagesText: z.string().optional(),
  active: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

/** "Name|icon" per line, icon optional. */
function parseTechnologies(text?: string) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, icon] = line.split("|").map((part) => part.trim());
      return icon ? { name, icon } : { name };
    });
}

function parseImages(text?: string) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseLinks(formData: FormData) {
  return LINK_KINDS.flatMap(({ field, kind }) => {
    const href = (formData.get(field) as string | null)?.trim();
    return href ? [{ kind, href }] : [];
  });
}

function parseProjectForm(formData: FormData) {
  const data = projectSchema.parse({
    title: formData.get("title"),
    href: formData.get("href") || undefined,
    datesFr: formData.get("datesFr"),
    datesEn: formData.get("datesEn"),
    descriptionFr: formData.get("descriptionFr"),
    descriptionEn: formData.get("descriptionEn"),
    technologiesText: formData.get("technologiesText") || undefined,
    imagesText: formData.get("imagesText") || undefined,
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder"),
  });

  return {
    title: data.title,
    href: data.href || null,
    datesFr: data.datesFr,
    datesEn: data.datesEn,
    descriptionFr: data.descriptionFr,
    descriptionEn: data.descriptionEn,
    technologies: parseTechnologies(data.technologiesText),
    images: parseImages(data.imagesText),
    links: parseLinks(formData),
    active: data.active,
    sortOrder: data.sortOrder,
  };
}

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");
}

function revalidateProjects() {
  revalidatePath("/admin/projects");
  // Project images are also listed in the sitemap.
  revalidatePublicSite();
}

export async function createProject(formData: FormData) {
  await requireSession();
  const data = parseProjectForm(formData);
  await db.insert(projects).values({ id: newId(), ...data });
  revalidateProjects();
}

export async function updateProject(id: string, formData: FormData) {
  await requireSession();
  const data = parseProjectForm(formData);
  await db.update(projects).set(data).where(eq(projects.id, id));
  revalidateProjects();
}

export async function deleteProject(id: string) {
  await requireSession();
  await db.delete(projects).where(eq(projects.id, id));
  revalidateProjects();
}

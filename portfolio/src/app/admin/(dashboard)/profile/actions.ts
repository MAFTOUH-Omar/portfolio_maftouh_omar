"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { profile } from "@/db/schema";
import { revalidatePublicSite } from "@/lib/revalidate";
import { getSession } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().min(1).max(200),
  fullName: z.string().min(1).max(200),
  givenName: z.string().min(1).max(100),
  familyName: z.string().min(1).max(100),
  initials: z.string().min(1).max(10),
  roleFr: z.string().min(1).max(200),
  roleEn: z.string().min(1).max(200),
  descriptionFr: z.string().min(1),
  descriptionEn: z.string().min(1),
  summaryFr: z.string().min(1),
  summaryEn: z.string().min(1),
  avatarUrl: z.string().min(1).max(500),
  locationFr: z.string().min(1).max(100),
  locationEn: z.string().min(1).max(100),
  locationLink: z.string().min(1).max(500),
  addressLocality: z.string().min(1).max(100),
  addressRegion: z.string().min(1).max(100),
  addressCountry: z.string().min(1).max(10),
  contactEmail: z.string().email().max(200),
  contactTel: z.string().trim().max(50).optional(),
  githubUrl: z.string().trim().max(500).optional(),
  githubNavbar: z.coerce.boolean().default(false),
  linkedinUrl: z.string().trim().max(500).optional(),
  linkedinNavbar: z.coerce.boolean().default(false),
});

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");

  const data = profileSchema.parse({
    name: formData.get("name"),
    fullName: formData.get("fullName"),
    givenName: formData.get("givenName"),
    familyName: formData.get("familyName"),
    initials: formData.get("initials"),
    roleFr: formData.get("roleFr"),
    roleEn: formData.get("roleEn"),
    descriptionFr: formData.get("descriptionFr"),
    descriptionEn: formData.get("descriptionEn"),
    summaryFr: formData.get("summaryFr"),
    summaryEn: formData.get("summaryEn"),
    avatarUrl: formData.get("avatarUrl"),
    locationFr: formData.get("locationFr"),
    locationEn: formData.get("locationEn"),
    locationLink: formData.get("locationLink"),
    addressLocality: formData.get("addressLocality"),
    addressRegion: formData.get("addressRegion"),
    addressCountry: formData.get("addressCountry"),
    contactEmail: formData.get("contactEmail"),
    contactTel: formData.get("contactTel") || undefined,
    githubUrl: formData.get("githubUrl") || undefined,
    githubNavbar: formData.get("githubNavbar") === "on",
    linkedinUrl: formData.get("linkedinUrl") || undefined,
    linkedinNavbar: formData.get("linkedinNavbar") === "on",
  });

  await db
    .update(profile)
    .set({
      name: data.name,
      fullName: data.fullName,
      givenName: data.givenName,
      familyName: data.familyName,
      initials: data.initials,
      roleFr: data.roleFr,
      roleEn: data.roleEn,
      descriptionFr: data.descriptionFr,
      descriptionEn: data.descriptionEn,
      summaryFr: data.summaryFr,
      summaryEn: data.summaryEn,
      avatarUrl: data.avatarUrl,
      locationFr: data.locationFr,
      locationEn: data.locationEn,
      locationLink: data.locationLink,
      addressLocality: data.addressLocality,
      addressRegion: data.addressRegion,
      addressCountry: data.addressCountry,
      contactEmail: data.contactEmail,
      contactTel: data.contactTel || null,
      social: {
        GitHub: { url: data.githubUrl ?? "", navbar: data.githubNavbar },
        LinkedIn: { url: data.linkedinUrl ?? "", navbar: data.linkedinNavbar },
      },
      updatedAt: new Date(),
    })
    .where(eq(profile.id, "singleton"));

  revalidatePath("/admin/profile");
  // Name, socials and email appear on every page (navbar, contact CTA, JSON-LD).
  revalidatePublicSite();
}

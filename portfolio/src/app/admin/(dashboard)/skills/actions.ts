"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { skills } from "@/db/schema";
import { newId } from "@/lib/id";
import { getSession } from "@/lib/session";

const skillSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(100),
  sortOrder: z.coerce.number().int().default(0),
});

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");
}

function revalidateSkills() {
  revalidatePath("/admin/skills");
  revalidatePath("/");
  revalidatePath("/en");
}

export async function createSkill(formData: FormData) {
  await requireSession();
  const data = skillSchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon"),
    sortOrder: formData.get("sortOrder"),
  });
  await db.insert(skills).values({ id: newId(), ...data });
  revalidateSkills();
}

export async function updateSkill(id: string, formData: FormData) {
  await requireSession();
  const data = skillSchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon"),
    sortOrder: formData.get("sortOrder"),
  });
  await db.update(skills).set(data).where(eq(skills.id, id));
  revalidateSkills();
}

export async function deleteSkill(id: string) {
  await requireSession();
  await db.delete(skills).where(eq(skills.id, id));
  revalidateSkills();
}

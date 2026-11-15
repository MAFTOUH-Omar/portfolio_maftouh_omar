import { cache } from "react";
import { asc } from "drizzle-orm";
import { Icons } from "@/components/icons";
import { db } from "@/db/client";
import {
  education as educationTable,
  profile as profileTable,
  projects as projectsTable,
  skills as skillsTable,
  workExperiences as workTable,
} from "@/db/schema";
import { SITE_URL } from "@/lib/site";

type IconComponent = (props: { className?: string }) => React.ReactElement;

/** Labels for project links; `kind` drives the icon, the label is shown to users. */
const LINK = {
  website: { kind: "website", label: { fr: "Site web", en: "Website" } },
  apiDocs: { kind: "apiDocs", label: { fr: "Docs API", en: "API Docs" } },
  source: { kind: "source", label: { fr: "Code source", en: "Source" } },
} as const;

export type LinkKind = keyof typeof LINK;

/** Fixed metadata (name + icon) for the two social accounts editable in the
 *  admin. Only the URL and navbar visibility live in the DB (`profile.social`). */
const SOCIAL_META: Record<string, { name: string; icon: IconComponent }> = {
  GitHub: { name: "GitHub", icon: Icons.github },
  LinkedIn: { name: "LinkedIn", icon: Icons.linkedin },
};

type SocialEntry = { name: string; url: string; icon: IconComponent; navbar: boolean };
type StoredSocial = Record<string, { url: string; navbar: boolean }>;

async function loadSiteData() {
  const [profileRow] = await db.select().from(profileTable).limit(1);
  if (!profileRow) {
    throw new Error("Site profile is not seeded — run `npm run db:seed-content` once DATABASE_URL is set.");
  }

  const [skillRows, projectRows, workRows, educationRows] = await Promise.all([
    db.select().from(skillsTable).orderBy(asc(skillsTable.sortOrder)),
    db.select().from(projectsTable).orderBy(asc(projectsTable.sortOrder)),
    db.select().from(workTable).orderBy(asc(workTable.sortOrder)),
    db.select().from(educationTable).orderBy(asc(educationTable.sortOrder)),
  ]);

  const storedSocial = profileRow.social as StoredSocial;
  const social: Record<string, SocialEntry> = {};
  for (const [key, meta] of Object.entries(SOCIAL_META)) {
    const stored = storedSocial[key];
    if (stored?.url) {
      social[key] = { name: meta.name, icon: meta.icon, url: stored.url, navbar: stored.navbar };
    }
  }
  social.email = {
    name: "Send Email",
    icon: Icons.email,
    url: `https://mail.google.com/mail/?view=cm&fs=1&to=${profileRow.contactEmail}`,
    navbar: true,
  };

  return {
    name: profileRow.name,
    fullName: profileRow.fullName,
    givenName: profileRow.givenName,
    familyName: profileRow.familyName,
    initials: profileRow.initials,
    url: SITE_URL,
    location: { fr: profileRow.locationFr, en: profileRow.locationEn },
    locationLink: profileRow.locationLink,
    address: {
      locality: profileRow.addressLocality,
      region: profileRow.addressRegion,
      country: profileRow.addressCountry,
    },
    role: { fr: profileRow.roleFr, en: profileRow.roleEn },
    description: { fr: profileRow.descriptionFr, en: profileRow.descriptionEn },
    summary: { fr: profileRow.summaryFr, en: profileRow.summaryEn },
    avatarUrl: profileRow.avatarUrl,
    skills: skillRows.map((skill) => ({ name: skill.name, icon: skill.icon })),
    contact: {
      email: profileRow.contactEmail,
      tel: profileRow.contactTel ?? "",
      social,
    },
    work: workRows.map((work) => ({
      company: work.company,
      href: work.href ?? "",
      location: { fr: work.locationFr, en: work.locationEn },
      title: { fr: work.titleFr, en: work.titleEn },
      logoUrl: work.logoUrl ?? "",
      start: { fr: work.startFr, en: work.startEn },
      end: { fr: work.endFr, en: work.endEn },
      description: { fr: work.descriptionFr, en: work.descriptionEn },
    })),
    education: educationRows.map((entry) => ({
      school: entry.school,
      href: entry.href ?? "",
      degree: { fr: entry.degreeFr, en: entry.degreeEn },
      logoUrl: entry.logoUrl ?? "",
      start: entry.start,
      end: entry.end ?? "",
    })),
    projects: projectRows.map((project) => ({
      title: project.title,
      href: project.href ?? "",
      dates: { fr: project.datesFr, en: project.datesEn },
      active: project.active,
      description: { fr: project.descriptionFr, en: project.descriptionEn },
      technologies: project.technologies as { name: string; icon?: string }[],
      links: (project.links as { kind: LinkKind; href: string }[]).map((link) => ({
        ...LINK[link.kind],
        href: link.href,
      })),
      images: project.images as string[],
    })),
  };
}

/** Per-request memoized: every Server Component on the same render tree that
 *  calls this shares one DB round trip. */
export const getSiteData = cache(loadSiteData);

export type SiteData = Awaited<ReturnType<typeof getSiteData>>;
export type Project = SiteData["projects"][number];
export type WorkExperience = SiteData["work"][number];
export type EducationEntry = SiteData["education"][number];
export type Skill = SiteData["skills"][number];

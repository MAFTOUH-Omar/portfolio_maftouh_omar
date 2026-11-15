import process from "node:process";

try {
  process.loadEnvFile(".env.local");
} catch {
  // already loaded into the shell env, e.g. in CI.
}

// One-time import of the previously-hardcoded resume.tsx content into the DB.
// Dynamic imports: see scripts/seed.ts for why (env must load before db/client).
async function main() {
  const { db } = await import("../src/db/client");
  const { education, profile, projects, skills, workExperiences } = await import("../src/db/schema");
  const { newId } = await import("../src/lib/id");
  const { DATA } = await import("./_original-resume-data");

  await db.delete(profile);
  await db.delete(skills);
  await db.delete(projects);
  await db.delete(workExperiences);
  await db.delete(education);

  await db.insert(profile).values({
    id: "singleton",
    name: DATA.name,
    fullName: DATA.fullName,
    givenName: DATA.givenName,
    familyName: DATA.familyName,
    initials: DATA.initials,
    roleFr: DATA.role.fr,
    roleEn: DATA.role.en,
    descriptionFr: DATA.description.fr,
    descriptionEn: DATA.description.en,
    summaryFr: DATA.summary.fr,
    summaryEn: DATA.summary.en,
    avatarUrl: DATA.avatarUrl,
    locationFr: DATA.location.fr,
    locationEn: DATA.location.en,
    locationLink: DATA.locationLink,
    addressLocality: DATA.address.locality,
    addressRegion: DATA.address.region,
    addressCountry: DATA.address.country,
    contactEmail: DATA.contact.email,
    contactTel: DATA.contact.tel,
    social: {
      GitHub: { url: DATA.contact.social.GitHub.url, navbar: DATA.contact.social.GitHub.navbar },
      LinkedIn: { url: DATA.contact.social.LinkedIn.url, navbar: DATA.contact.social.LinkedIn.navbar },
    },
  });

  await db.insert(skills).values(
    DATA.skills.map((skill, index) => ({
      id: newId(),
      name: skill.name,
      icon: skill.icon,
      sortOrder: index,
    }))
  );

  await db.insert(projects).values(
    DATA.projects.map((project, index) => ({
      id: newId(),
      title: project.title,
      href: project.href || null,
      datesFr: project.dates.fr,
      datesEn: project.dates.en,
      descriptionFr: project.description.fr,
      descriptionEn: project.description.en,
      technologies: project.technologies,
      links: project.links.map((link) => ({ kind: link.kind, href: link.href })),
      images: project.images,
      active: project.active,
      sortOrder: index,
    }))
  );

  await db.insert(workExperiences).values(
    DATA.work.map((work, index) => ({
      id: newId(),
      company: work.company,
      href: work.href || null,
      logoUrl: work.logoUrl || null,
      locationFr: work.location.fr,
      locationEn: work.location.en,
      titleFr: work.title.fr,
      titleEn: work.title.en,
      startFr: work.start.fr,
      startEn: work.start.en,
      endFr: work.end.fr,
      endEn: work.end.en,
      descriptionFr: work.description.fr,
      descriptionEn: work.description.en,
      sortOrder: index,
    }))
  );

  await db.insert(education).values(
    DATA.education.map((entry, index) => ({
      id: newId(),
      school: entry.school,
      href: entry.href || null,
      logoUrl: entry.logoUrl || null,
      degreeFr: entry.degree.fr,
      degreeEn: entry.degree.en,
      start: entry.start,
      end: entry.end || null,
      sortOrder: index,
    }))
  );

  console.log("Seeded profile, skills, projects, work experience and education from resume.tsx.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

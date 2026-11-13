import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { JsonLd } from "@/components/json-ld";
import { getDictionary } from "@/data/dictionaries";
import { DATA } from "@/data/resume";
import { languageAlternates, localeConfig, localizePath, type Locale } from "@/lib/i18n";
import { openGraphFor, personSchema, PERSON_ID, WEBSITE_ID } from "@/lib/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BlurFade from "@/components/magicui/blur-fade";
import { SkillBadge } from "@/components/skill-badge";
import { CodeFrame } from "@/components/code-frame";
import { ArrowUpRight } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

export function homeMetadata(locale: Locale): Metadata {
  return {
    alternates: {
      canonical: localizePath(locale, "/"),
      languages: languageAlternates("/"),
    },
    openGraph: openGraphFor(locale, { url: localizePath(locale, "/") }),
  };
}

function homeJsonLd(locale: Locale) {
  const t = getDictionary(locale);
  const pageUrl = absoluteUrl(localizePath(locale, "/"));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: DATA.fullName,
        alternateName: [DATA.name, "omarmaftouh.com"],
        inLanguage: Object.values(localeConfig).map((c) => c.htmlLang),
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profilepage`,
        url: pageUrl,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: localeConfig[locale].htmlLang,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      personSchema(locale),
    ],
  };
}

export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10">
      <JsonLd data={homeJsonLd(locale)} />
      <section id="hero">
        <CodeFrame tag="FullStack" attributes={{ craft: "web-dreams" }}>
          <div className="relative isolate flex flex-col justify-center overflow-hidden rounded-lg bg-hero-ink text-white shadow-2xl shadow-black/25 sm:min-h-[27rem] dark:ring-1 dark:ring-white/10">
            {/* Card art: bank-card composition (diagonal panel top-right,
                banded disc bottom-left) painted in the brand palette */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-hero-panel [clip-path:polygon(62%_0,100%_0,100%_28%)] sm:[clip-path:polygon(64%_0,100%_0,100%_68%)]" />
              <svg
                viewBox="0 0 340 235"
                className="absolute bottom-0 left-0 h-auto w-[150px] sm:w-[290px]"
              >
                <circle cx="80" cy="264" r="262" className="fill-hero-disc" />
                <circle cx="30" cy="534" r="360" className="fill-hero-ink" />
              </svg>
              {/* Depth + glossy sheen over everything */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/30" />
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgb(255_255_255/0.06)_45%,transparent_60%)]" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-12 text-center sm:py-14">
              <BlurFade delay={BLUR_FADE_DELAY}>
                {/* Above the fold: fetched eagerly, served at the right size as AVIF/WebP. */}
                <Image
                  src={DATA.avatarUrl}
                  alt={`${DATA.fullName} — ${DATA.role[locale]}`}
                  width={80}
                  height={80}
                  sizes="(min-width: 640px) 80px, 64px"
                  loading="eager"
                  fetchPriority="high"
                  className="size-16 rounded-full object-cover ring-2 ring-hero-panel/50 ring-offset-4 ring-offset-hero-ink sm:size-20"
                />
              </BlurFade>
              <div className="flex flex-col items-center gap-2">
                {/* The H1 carries the target query (role + city) for search engines. */}
                <BlurFade delay={BLUR_FADE_DELAY} yOffset={8} variant="slide">
                  <h1 className="flex flex-col items-center gap-2">
                    <span className="text-3xl font-bold tracking-tighter text-white sm:text-4xl xl:text-5xl/none">
                      {t.hero.greeting}
                    </span>
                    <span className="sr-only"> — </span>
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-hero-panel sm:text-base">
                      {t.hero.role}
                    </span>
                  </h1>
                </BlurFade>
                <BlurFade delay={BLUR_FADE_DELAY} yOffset={8} variant="slide">
                  <p className="max-w-[520px] text-balance text-white/75 sm:text-lg">
                    {DATA.description[locale]}
                  </p>
                </BlurFade>
              </div>
              <BlurFade delay={BLUR_FADE_DELAY} variant="slide">
                <Link
                  href={DATA.contact.social.email.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-hero-ink shadow-lg shadow-black/20 transition-colors hover:bg-hero-panel"
                >
                  {t.hero.cta}
                  <span className="flex size-8 items-center justify-center rounded-full bg-hero-ink text-white transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              </BlurFade>
            </div>
          </div>
        </CodeFrame>
      </section>
      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">{t.sections.about}</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            <p>{DATA.summary[locale]}</p>
          </div>
        </BlurFade>
      </section>
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">{t.sections.work}</h2>
          </BlurFade>
          {DATA.work.map((work, id) => (
            <BlurFade
              key={work.company}
              delay={BLUR_FADE_DELAY * 6 + id * 0.05}
            >
              <ResumeCard
                key={work.company}
                logoUrl={work.logoUrl}
                altText={work.company}
                title={work.company}
                subtitle={work.title[locale]}
                href={work.href}
                badges={work.badges}
                period={`${work.start[locale]} - ${work.end[locale]}`}
                description={work.description[locale]}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">{t.sections.education}</h2>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                key={education.school}
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree[locale]}
                period={`${education.start} - ${education.end}`}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">{t.sections.skills}</h2>
          </BlurFade>
          {/* One animation for the whole grid instead of one per badge. */}
          <BlurFade delay={BLUR_FADE_DELAY * 10} className="flex flex-wrap gap-2">
            {DATA.skills.map((skill) => (
              <SkillBadge key={skill.name} name={skill.name} icon={skill.icon} />
            ))}
          </BlurFade>
        </div>
      </section>
      <section id="projects" className="[content-visibility:auto] [contain-intrinsic-size:auto_2400px]">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  {t.projects.badge}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {t.projects.title}
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t.projects.intro}
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="columns-1 gap-4 sm:columns-2 lg:gap-5">
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                className="mb-4 break-inside-avoid lg:mb-5"
              >
                <ProjectCard
                  href={project.href}
                  title={project.title}
                  description={project.description[locale]}
                  dates={project.dates[locale]}
                  tags={project.technologies}
                  images={project.images}
                  links={project.links.map((link) => ({
                    kind: link.kind,
                    type: link.label[locale],
                    href: link.href,
                  }))}
                  labels={t.a11y}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" className="[content-visibility:auto] [contain-intrinsic-size:auto_420px]">
        <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                {t.contact.badge}
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                {t.contact.title}
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t.contact.before}{" "}
                <Link
                  href={DATA.contact.social.email.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4 hover:decoration-2"
                >
                  {t.contact.link}
                </Link>{" "}
                {t.contact.after}{" "}
                <Link
                  href="/cv-maftouh-omar.pdf"
                  download
                  className="text-primary underline underline-offset-4 hover:decoration-2"
                >
                  {t.contact.cv}
                </Link>
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}

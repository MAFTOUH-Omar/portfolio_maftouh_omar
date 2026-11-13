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
import { ArrowUpRight, Download } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CopyEmailButton } from "@/components/copy-email-button";

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
          <div className="relative isolate flex flex-col justify-center overflow-hidden rounded-lg bg-hero-ink text-white sm:min-h-[27rem] dark:ring-1 dark:ring-white/10">
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
              <BlurFade delay={BLUR_FADE_DELAY} variant="slide">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                  <span aria-hidden className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  {t.hero.available}
                </p>
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
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-hero-ink transition-colors hover:bg-hero-panel"
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
      <section id="about" className="flex flex-col gap-y-3">
        <SectionHeading index="01" title={t.sections.about} delay={BLUR_FADE_DELAY * 3} />
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            <p>{DATA.summary[locale]}</p>
          </div>
        </BlurFade>
      </section>
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <SectionHeading index="02" title={t.sections.work} delay={BLUR_FADE_DELAY * 5} />
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
          <SectionHeading index="03" title={t.sections.education} delay={BLUR_FADE_DELAY * 7} />
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
          <SectionHeading index="04" title={t.sections.skills} delay={BLUR_FADE_DELAY * 9} />
          {/* One animation for the whole grid instead of one per badge. */}
          <BlurFade delay={BLUR_FADE_DELAY * 10} className="flex flex-wrap gap-2">
            {DATA.skills.map((skill) => (
              <SkillBadge key={skill.name} name={skill.name} icon={skill.icon} />
            ))}
          </BlurFade>
        </div>
      </section>
      {/* content-visibility implies paint containment, which clips anything drawn
          outside the section box. -mx-6/px-6 gives the hover lift and focus ring room. */}
      <section id="projects" className="-mx-6 px-6 pb-6 [content-visibility:auto] [contain-intrinsic-size:auto_2400px]">
        <div className="flex w-full flex-col gap-y-6 pt-6">
          <SectionHeading
            index="05"
            title={t.projects.title}
            intro={t.projects.intro}
            delay={BLUR_FADE_DELAY * 11}
          />
          <div className="columns-1 gap-4 sm:columns-2 lg:gap-5">
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                className="mb-4 break-inside-avoid lg:mb-5"
              >
                <ProjectCard {...projectCardProps(project, locale)} />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section
        id="contact"
        className="-mx-6 flex flex-col gap-y-6 px-6 pb-16 [content-visibility:auto] [contain-intrinsic-size:auto_480px]"
      >
        <SectionHeading index="06" title={t.contact.title} delay={BLUR_FADE_DELAY * 16} />
        <BlurFade delay={BLUR_FADE_DELAY * 17}>
          {/* Bookends the page: same card art as the hero, mirrored. */}
          <div className="relative isolate overflow-hidden rounded-lg bg-hero-ink px-6 py-12 text-center text-white sm:px-12 sm:py-16 dark:ring-1 dark:ring-white/10">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-hero-panel [clip-path:polygon(0_78%,0_100%,34%_100%)] sm:[clip-path:polygon(0_45%,0_100%,30%_100%)]" />
              <div className="absolute -right-20 -top-20 size-56 rounded-full bg-hero-disc sm:size-72" />
              <div className="absolute -right-20 -top-20 size-56 translate-x-12 translate-y-14 rounded-full bg-hero-ink sm:size-72" />
            </div>
            <h3 className="text-balance text-3xl font-bold tracking-tighter sm:text-5xl">
              {t.contact.headline}
            </h3>
            <p className="mx-auto mt-4 max-w-md text-pretty text-white/75 sm:text-lg">
              {t.contact.body}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={DATA.contact.social.email.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-hero-ink transition-colors hover:bg-hero-panel"
              >
                {t.contact.email}
                <span className="flex size-8 items-center justify-center rounded-full bg-hero-ink text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <CopyEmailButton
                email={DATA.contact.email}
                label={t.contact.copy}
                copiedLabel={t.contact.copied}
                className={secondaryCta}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={DATA.contact.social.LinkedIn.url}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryCta}
              >
                <DATA.contact.social.LinkedIn.icon className="size-4" />
                LinkedIn
              </Link>
              <a href="/cv-maftouh-omar.pdf" download className={secondaryCta}>
                <Download className="size-4" />
                {t.contact.cv}
              </a>
            </div>
          </div>
        </BlurFade>
      </section>
    </main>
  );
}

const secondaryCta =
  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/40 hover:bg-white/10";

function projectCardProps(project: (typeof DATA.projects)[number], locale: Locale) {
  return {
    href: project.href,
    title: project.title,
    description: project.description[locale],
    dates: project.dates[locale],
    tags: project.technologies,
    images: project.images,
    links: project.links.map((link) => ({
      kind: link.kind,
      type: link.label[locale],
      href: link.href,
    })),
    labels: getDictionary(locale).a11y,
  };
}

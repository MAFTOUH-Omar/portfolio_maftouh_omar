import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { JsonLd } from "@/components/json-ld";
import { getDictionary } from "@/data/dictionaries";
import { getSiteData, type Project } from "@/data/resume";
import { languageAlternates, localeConfig, localizePath, type Locale } from "@/lib/i18n";
import { openGraphFor, personSchema, PERSON_ID, WEBSITE_ID } from "@/lib/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BlurFade from "@/components/magicui/blur-fade";
import { LogoCloud } from "@/components/logo-cloud";
import { HoverHighlight } from "@/components/hover-highlight";
import { CodeFrame } from "@/components/code-frame";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ContactCta } from "@/components/contact-cta";
import { PostListItem } from "@/components/blog-post-item";
import { getBlogPostsPage } from "@/data/blog";
import { accentsFor } from "@/lib/tag-colors";

const BLUR_FADE_DELAY = 0.04;
/** Newest posts linked from the home page — the site's strongest page passes
 *  link equity to fresh articles and gets crawled into them first. */
const LATEST_POSTS = 3;

export async function homeMetadata(locale: Locale): Promise<Metadata> {
  return {
    alternates: {
      canonical: localizePath(locale, "/"),
      languages: languageAlternates("/"),
    },
    openGraph: await openGraphFor(locale, { url: localizePath(locale, "/") }),
  };
}

async function homeJsonLd(locale: Locale, data: Awaited<ReturnType<typeof getSiteData>>) {
  const t = getDictionary(locale);
  const pageUrl = absoluteUrl(localizePath(locale, "/"));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: data.fullName,
        alternateName: [data.name, "omarmaftouh.com"],
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
      await personSchema(locale),
    ],
  };
}

export async function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [data, { posts: latestPosts }] = await Promise.all([
    getSiteData(),
    getBlogPostsPage(locale, 0, LATEST_POSTS),
  ]);
  const jsonLd = await homeJsonLd(locale, data);
  // Card colors and shapes, worked out per list so neighbours never match.
  const workAccents = accentsFor(data.work.map((work) => work.company));
  const educationAccents = accentsFor(data.education.map((education) => education.school));
  const postAccents = accentsFor(latestPosts.map((post) => post.slug));
  const githubUsername = new URL(data.contact.social.GitHub.url).pathname.slice(1);

  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10">
      <JsonLd data={jsonLd} />
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
                  src={data.avatarUrl}
                  alt={`${data.fullName} — ${data.role[locale]}`}
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
                    {data.description[locale]}
                  </p>
                </BlurFade>
              </div>
              <BlurFade delay={BLUR_FADE_DELAY} variant="slide">
                <Link
                  href={data.contact.social.email.url}
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
          <div className="prose max-w-full text-justify text-pretty font-sans text-sm text-muted-foreground hyphens-auto dark:prose-invert">
            <p>{data.summary[locale]}</p>
          </div>
        </BlurFade>
      </section>
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <SectionHeading index="02" title={t.sections.work} delay={BLUR_FADE_DELAY * 5} />
          {data.work.map((work, id) => (
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
                period={`${work.start[locale]} - ${work.end[locale]}`}
                description={work.description[locale]}
                accent={workAccents[id]}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <SectionHeading index="03" title={t.sections.education} delay={BLUR_FADE_DELAY * 7} />
          {data.education.map((education, id) => (
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
                accent={educationAccents[id]}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <SectionHeading index="04" title={t.sections.skills} delay={BLUR_FADE_DELAY * 9} />
          <BlurFade delay={BLUR_FADE_DELAY * 10}>
            <LogoCloud
              username={githubUsername}
              profileUrl={data.contact.social.GitHub.url}
              skills={data.skills}
              labels={t.skills}
              dateLocale={localeConfig[locale].dateLocale}
            />
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
          <HoverHighlight className="columns-1 gap-4 sm:columns-2 lg:gap-5">
            {data.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                className="mb-4 break-inside-avoid lg:mb-5"
              >
                <ProjectCard {...projectCardProps(project, locale)} />
              </BlurFade>
            ))}
          </HoverHighlight>
        </div>
      </section>
      {latestPosts.length > 0 && (
        // No content-visibility here: its paint containment clipped the top
        // of the section heading (badge corners and ascenders).
        <section id="blog" className="flex min-h-0 flex-col gap-y-3">
          <SectionHeading index="06" title={t.blog.latest} intro={t.blog.latestIntro} />
          {latestPosts.map((post, id) => (
            <PostListItem
              key={post.slug}
              post={post}
              locale={locale}
              delay={0}
              accent={postAccents[id]}
              headingLevel={3}
            />
          ))}
          <Link
            href={localizePath(locale, "/blog")}
            className="group inline-flex w-fit items-center gap-1.5 self-end text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.blog.allPosts}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </section>
      )}
      <ContactCta locale={locale} index={latestPosts.length > 0 ? "07" : "06"} />
    </main>
  );
}

function projectCardProps(project: Project, locale: Locale) {
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

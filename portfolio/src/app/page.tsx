import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import BlurFade from "@/components/magicui/blur-fade";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillBadge } from "@/components/skill-badge";
import { ArrowUpRight } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

// Cycled per card so the gallery packs into an uneven, Pinterest-style masonry
// instead of a uniform grid.
const PROJECT_IMAGE_ASPECTS = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-video",
  "aspect-[4/5]",
  "aspect-square",
];

export default function Page() {
  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10">
      <section id="hero">
        <div className="relative isolate overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {/* Glass-fold atmosphere: folded light ribbons in primary / accent / secondary, theme-reactive */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-[-70px] h-[200px] w-[150%] rotate-[-24deg] bg-gradient-to-r from-transparent via-primary to-transparent opacity-25 blur-3xl dark:opacity-70" />
            <div className="absolute -right-24 top-[10px] h-[180px] w-[150%] rotate-[16deg] bg-gradient-to-r from-transparent via-accent to-transparent opacity-20 blur-3xl dark:opacity-50" />
            <div className="absolute left-[-10%] top-[85px] h-[40px] w-[130%] rotate-[-20deg] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50 blur-xl dark:opacity-60" />
          </div>

          {/* Corner stickers */}
          <span
            aria-hidden
            className="absolute left-4 top-4 z-10 -rotate-6 sm:left-6 sm:top-6"
          >
            <span className="flex size-9 animate-float items-center justify-center rounded-full border border-border bg-background/70 text-lg shadow-lg backdrop-blur-md motion-reduce:animate-none sm:size-11 sm:text-2xl">
              👋
            </span>
          </span>
          <span
            aria-hidden
            className="absolute bottom-4 right-4 z-10 rotate-6 sm:bottom-6 sm:right-6"
          >
            <span className="flex size-9 animate-float items-center justify-center rounded-full border border-border bg-background/70 text-lg shadow-lg backdrop-blur-md motion-reduce:animate-none sm:size-11 sm:text-2xl [animation-delay:-2.5s]">
              🚀
            </span>
          </span>

          <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-8 text-center sm:py-12">
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className="size-16 ring-2 ring-primary/40 ring-offset-4 ring-offset-card sm:size-20">
                <AvatarImage
                  alt={DATA.name}
                  src={DATA.avatarUrl}
                  loading="eager"
                  fetchPriority="high"
                />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
            <div className="flex flex-col items-center gap-2">
              <BlurFadeText
                as="h1"
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl xl:text-5xl/none"
                yOffset={8}
                text={`Hi, I'm ${DATA.name.split(" ")[0]}`}
              />
              <BlurFadeText
                className="max-w-[520px] text-balance text-muted-foreground sm:text-lg"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
            </div>
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Link
                href={DATA.contact.social.email.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get in touch
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </BlurFade>
          </div>
        </div>
      </section>
      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">About</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            <Markdown>{DATA.summary}</Markdown>
          </div>
        </BlurFade>
      </section>
      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">Work Experience</h2>
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
                subtitle={work.title}
                href={work.href}
                badges={work.badges}
                period={`${work.start} - ${work.end ?? "Present"}`}
                description={work.description}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
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
                subtitle={education.degree}
                period={`${education.start} - ${education.end}`}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">Skills</h2>
          </BlurFade>
          <div className="flex flex-wrap gap-2">
            {DATA.skills.map((skill, id) => (
              <BlurFade key={skill.name} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
                <SkillBadge name={skill.name} icon={skill.icon} />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="projects">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  My Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Check out my latest work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  I&apos;ve worked on a variety of projects, from simple
                  websites to complex web applications. Here are a few of my
                  favorites.
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
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  images={project.images}
                  aspectClassName={
                    PROJECT_IMAGE_ASPECTS[id % PROJECT_IMAGE_ASPECTS.length]
                  }
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="contact">
        <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Want to chat? Just shoot me a dm{" "}
                <Link
                  href={DATA.contact.social.email.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  with a direct question on mail
                </Link>{" "}
                and I&apos;ll respond whenever I can. I will ignore all
                soliciting.{" "}
                <Link
                  href="/cv-maftouh-omar.pdf"
                  download
                  className="text-primary hover:underline"
                >
                  Feel free to download my CV for more details.
                </Link>
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}

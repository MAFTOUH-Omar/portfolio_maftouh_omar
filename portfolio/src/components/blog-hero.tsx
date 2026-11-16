import BlurFade from "@/components/magicui/blur-fade";

/**
 * Blog index banner — same card-art concept as the homepage hero (a
 * brand-ink panel with a geometric accent), but traced with a different
 * shape: a stacked diagonal wedge in the top-left corner instead of the
 * home hero's top-right panel + bottom-left disc, so the two don't read as
 * copy-pasted.
 */
export function BlogHero({
  title,
  description,
  postCount,
}: {
  title: string;
  description: string;
  postCount: string;
}) {
  return (
    <BlurFade delay={0.04}>
      <div className="relative isolate overflow-hidden rounded-lg bg-hero-ink px-6 py-10 text-white sm:px-10 sm:py-14 dark:ring-1 dark:ring-white/10">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-hero-panel [clip-path:polygon(0_0,38%_0,0_30%)] sm:[clip-path:polygon(0_0,30%_0,0_55%)]" />
          <div className="absolute inset-0 bg-hero-disc/70 [clip-path:polygon(0_0,20%_0,0_18%)] sm:[clip-path:polygon(0_0,16%_0,0_32%)]" />
          <svg viewBox="0 0 340 235" className="absolute -bottom-6 -right-6 h-auto w-[140px] opacity-90 sm:w-[220px]">
            <circle cx="260" cy="-10" r="190" className="fill-hero-panel/30" />
          </svg>
        </div>
        <div className="relative z-10 flex max-w-2xl flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            {postCount}
          </span>
          <h1 className="text-balance text-3xl font-bold tracking-tighter sm:text-4xl">{title}</h1>
          <p className="max-w-[520px] text-pretty text-white/75 sm:text-lg">{description}</p>
        </div>
      </div>
    </BlurFade>
  );
}

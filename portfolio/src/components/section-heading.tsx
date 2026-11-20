import BlurFade from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

interface Props {
  /** Two-digit section number ("01"), or an icon, shown in the tile. */
  index: React.ReactNode;
  title: string;
  /** Optional line under the title. */
  intro?: string;
  delay?: number;
  className?: string;
  /** id for the <h2>, to label a <section aria-labelledby>. */
  id?: string;
}

/**
 * Shared section title. The number sits in a mini version of the hero card
 * (brand ink, sand corner, purple disc); a short three-tone stripe under the
 * title replaces the old full-width rule:
 *
 *   ┌────┐
 *   │06 ◥│  Derniers articles
 *   │◖   │  ━━━━ ━━ ━
 *   └────┘
 */
export function SectionHeading({ index, title, intro, delay = 0, className, id }: Props) {
  return (
    <BlurFade delay={delay} className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden
          className="relative isolate flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-hero-ink font-mono text-sm font-semibold tabular-nums text-white shadow-sm shadow-hero-ink/20 sm:size-12 sm:text-base dark:ring-1 dark:ring-white/10"
        >
          <span className="absolute inset-0 -z-10 bg-hero-panel [clip-path:polygon(60%_0,100%_0,100%_40%)]" />
          <span className="absolute -bottom-3 -left-3 -z-10 size-6 rounded-full bg-hero-disc" />
          {index}
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 id={id} className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            {title}
          </h2>
          <span aria-hidden className="flex items-center gap-1">
            <span className="h-1 w-8 rounded-full bg-primary" />
            <span className="h-1 w-3 rounded-full bg-hero-disc" />
            <span className="h-1 w-1.5 rounded-full bg-amber-400 dark:bg-hero-panel" />
          </span>
        </div>
      </div>
      {intro && (
        <p className="text-justify text-sm text-pretty text-muted-foreground hyphens-auto">{intro}</p>
      )}
    </BlurFade>
  );
}

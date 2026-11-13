import BlurFade from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

interface Props {
  /** Two-digit section number shown in mono before the title, e.g. "01". */
  index: string;
  title: string;
  /** Optional line under the title. */
  intro?: string;
  delay?: number;
  className?: string;
}

/**
 * Shared section title: `01  Title ─────────`.
 * Same look for every section so the page reads with one rhythm.
 */
export function SectionHeading({ index, title, intro, delay = 0, className }: Props) {
  return (
    <BlurFade delay={delay} className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="rounded-md bg-hero-ink px-2 py-0.5 font-mono text-sm font-semibold tabular-nums text-hero-panel sm:text-base dark:ring-1 dark:ring-white/10"
        >
          {index}
        </span>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <span aria-hidden className="h-px flex-1 bg-primary/40" />
      </div>
      {intro && (
        <p className="max-w-prose text-pretty text-sm text-muted-foreground">{intro}</p>
      )}
    </BlurFade>
  );
}

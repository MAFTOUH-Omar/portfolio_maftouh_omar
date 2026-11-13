import { TechIcon } from "@/components/tech-icon";
import { getContributions, type ContributionDay } from "@/lib/github";
import { cn } from "@/lib/utils";

export interface Skill {
  readonly name: string;
  readonly icon?: string;
}

interface Labels {
  /** "{n}" is replaced by the yearly total. */
  contributions: string;
  /** "{n}" and "{date}" are replaced; used for 1+ contributions. */
  day: string;
  /** "{date}" is replaced; used for days without contributions. */
  noDay: string;
  less: string;
  more: string;
  logos: string;
}

interface Props {
  username: string;
  profileUrl: string;
  skills: readonly Skill[];
  labels: Labels;
  dateLocale: string;
  /** Seconds for one full marquee loop. */
  duration?: number;
}

/** Intensity scale in the brand color (same scale in light and dark). */
const LEVEL_CLASS: Record<ContributionDay["level"], string> = {
  0: "bg-muted",
  1: "bg-primary/25",
  2: "bg-primary/50",
  3: "bg-primary/75",
  4: "bg-primary",
};

/**
 * Real GitHub contribution graph + two marquee rows of tech logos.
 * Server component: data is fetched at build time and refreshed daily (ISR);
 * the graph uses native `title` tooltips and the marquee is pure CSS
 * (`.marquee*` in globals.css), so it ships no JavaScript.
 */
export async function LogoCloud({
  username,
  profileUrl,
  skills,
  labels,
  dateLocale,
  duration = 40,
}: Props) {
  const calendar = await getContributions(username);
  const dateFormat = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const numberFormat = new Intl.NumberFormat(dateLocale);

  const withIcons = skills.filter((s) => s.icon);
  const half = Math.ceil(withIcons.length / 2);
  const rows = [withIcons.slice(0, half), withIcons.slice(half)];

  return (
    <div className="flex flex-col gap-6 overflow-hidden rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
      {calendar && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-semibold hover:text-primary hover:underline"
            >
              @{username}
            </a>
            <p className="text-xs text-muted-foreground">
              {labels.contributions.replace("{n}", numberFormat.format(calendar.total))}
            </p>
          </div>

          {/* rtl scroller + ltr content: on narrow screens it opens on the latest weeks. */}
          <div className="overflow-x-auto pb-1 [direction:rtl]">
            <div
              aria-hidden
              className="grid w-max grid-flow-col grid-rows-7 gap-[3px] [direction:ltr]"
            >
              {calendar.days.map((day) => {
                const date = dateFormat.format(new Date(`${day.date}T00:00:00Z`));
                const title =
                  day.count === 0
                    ? labels.noDay.replace("{date}", date)
                    : labels.day
                        .replace("{n}", String(day.count))
                        .replace("(s)", day.count === 1 ? "" : "s")
                        .replace("{date}", date);
                return (
                  <span
                    key={day.date}
                    title={title}
                    className={cn("size-[11px] rounded-[2px] sm:size-3", LEVEL_CLASS[day.level])}
                  />
                );
              })}
            </div>
          </div>

          <div
            aria-hidden
            className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground"
          >
            {labels.less}
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <span key={level} className={cn("size-[11px] rounded-[2px]", LEVEL_CLASS[level])} />
            ))}
            {labels.more}
          </div>
        </div>
      )}

      {calendar && <div className="-mx-5 border-t border-border sm:-mx-6" />}

      <div className="flex min-w-0 flex-col gap-3" role="list" aria-label={labels.logos}>
        {rows.map((row, i) => (
          <div
            key={i}
            className="marquee flex gap-2 overflow-hidden"
            style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy > 0 || undefined}
                data-reverse={i === 1 || undefined}
                className="marquee-track flex shrink-0 gap-2"
              >
                {row.map((skill) => (
                  <div
                    key={skill.name}
                    role={copy === 0 ? "listitem" : undefined}
                    title={skill.name}
                    className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted"
                  >
                    <span className="size-8">
                      <TechIcon name={skill.icon!} loading="eager" />
                    </span>
                    {copy === 0 && <span className="sr-only">{skill.name}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

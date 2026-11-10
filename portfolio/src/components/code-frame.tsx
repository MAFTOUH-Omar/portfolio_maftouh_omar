import BlurFade from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

interface Props {
  /** Component name shown in the wrapping tag, e.g. "FullStack". */
  tag: string;
  attributes?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps its child in a syntax-highlighted JSX tag — opening tag above the
 * top-left corner, closing tag + blinking caret below the bottom-right —
 * so the section reads like a component being written.
 */
export function CodeFrame({ tag, attributes, children, className }: Props) {
  const bracket = "text-muted-foreground/70";
  const name = "font-semibold text-accent";

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <BlurFade delay={0.02} yOffset={4}>
        <p
          aria-hidden
          className="select-none font-mono text-xs tracking-tight sm:text-sm"
        >
          <span className={bracket}>&lt;</span>
          <span className={name}>{tag}</span>
          {Object.entries(attributes ?? {}).map(([attr, value]) => (
            <span key={attr}>
              {" "}
              <span className="text-primary">{attr}</span>
              <span className={bracket}>=</span>
              <span className="text-secondary-foreground">
                &quot;{value}&quot;
              </span>
            </span>
          ))}
          <span className={bracket}>&gt;</span>
        </p>
      </BlurFade>

      {children}

      <BlurFade delay={0.3} yOffset={4} className="self-end">
        <p
          aria-hidden
          className="flex select-none items-center font-mono text-xs tracking-tight sm:text-sm"
        >
          <span className={bracket}>&lt;/</span>
          <span className={name}>{tag}</span>
          <span className={bracket}>&gt;</span>
          <span className="ml-1 inline-block h-[1.15em] w-[0.55em] animate-caret bg-accent motion-reduce:animate-none" />
        </p>
      </BlurFade>
    </div>
  );
}

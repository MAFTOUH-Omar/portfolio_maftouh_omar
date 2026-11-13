import { Icons } from "@/components/icons";
import { TechIcon } from "@/components/tech-icon";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export interface TechTag {
  readonly name: string;
  readonly icon?: string;
}

export interface ProjectLink {
  kind: "website" | "apiDocs" | "source";
  /** Localized label shown as tooltip / accessible name. */
  type: string;
  href: string;
}

/** Localized strings used by the project card, gallery and dialog. */
export interface ProjectLabels {
  previousImage: string;
  nextImage: string;
  goToImage: string;
  screenshot: string;
  close: string;
  details: string;
  stack: string;
  visit: string;
}

export function LinkIcon({ kind, className }: { kind: ProjectLink["kind"]; className?: string }) {
  return kind === "source" ? (
    <Icons.github className={className} />
  ) : (
    <ExternalLink className={className} />
  );
}

export function TechTagList({
  tags,
  size = "sm",
  className,
}: {
  tags: readonly TechTag[];
  size?: "sm" | "md";
  className?: string;
}) {
  const md = size === "md";
  return (
    <div className={cn("flex flex-wrap", md ? "gap-1.5" : "gap-1", className)}>
      {tags.map((tag) => (
        <div
          key={tag.name}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border border-border bg-foreground/5",
            md ? "px-2 py-1" : "px-[7px] py-[3px]"
          )}
        >
          <span
            className={cn(
              "flex flex-shrink-0 items-center justify-center overflow-hidden",
              md ? "size-[14px]" : "size-[12px]"
            )}
          >
            {tag.icon ? (
              <TechIcon name={tag.icon} />
            ) : (
              <span className="text-[8px] font-bold text-foreground/70">{tag.name.charAt(0)}</span>
            )}
          </span>
          <span className={cn("font-medium text-foreground/80", md ? "text-xs" : "text-[11px]")}>
            {tag.name}
          </span>
        </div>
      ))}
    </div>
  );
}

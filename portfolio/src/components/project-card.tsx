"use client";

import { ProjectDialog } from "@/components/project-dialog";
import { ProjectGallery } from "@/components/project-gallery";
import {
  LinkIcon,
  TechTagList,
  type ProjectLabels,
  type ProjectLink,
  type TechTag,
} from "@/components/project-shared";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "./ui/card";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly TechTag[];
  images?: readonly string[];
  video?: string;
  links?: readonly ProjectLink[];
  labels: ProjectLabels;
  className?: string;
  /** Tailwind aspect-ratio class for the media area. Defaults to 2:1, the shape of most project screenshots. */
  aspectClassName?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  images,
  video,
  links,
  className,
  aspectClassName,
  labels,
}: Props) {
  const [currentImage, setCurrentImage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const allImages = images ?? [];
  const sizes = "(max-width: 640px) 100vw, 420px";

  const openDialog = () => setDialogOpen(true);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Only when the card itself is focused, not a link or button inside it.
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDialog();
    }
  };

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        data-hover-item
        aria-label={`${labels.details} — ${title}`}
        onClick={openDialog}
        onKeyDown={onKeyDown}
        className={cn(
          "group relative flex cursor-pointer flex-col overflow-hidden outline-none",
          // Hover background comes from <HoverHighlight>; the card only tints its border.
          "transition-colors duration-200",
          "hover:border-primary/60",
          "focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        {/* Image / Video area — edge to edge */}
        <div
          className={cn(
            "relative flex-shrink-0 overflow-hidden bg-muted/50",
            aspectClassName ?? "aspect-[2/1]"
          )}
        >
          {/* "View details" hint, revealed on hover */}
          <span
            aria-hidden
            className="absolute bottom-2.5 left-2.5 z-10 inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Maximize2 className="size-3" />
            {labels.details}
          </span>

          {video && (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover object-top"
            />
          )}

          {allImages.length > 0 ? (
            <ProjectGallery
              images={allImages}
              title={title}
              index={currentImage}
              onIndexChange={setCurrentImage}
              labels={labels}
              sizes={sizes}
            />
          ) : !video ? (
            /* Placeholder when no media */
            <div className="flex h-full w-full items-center justify-center">
              <span className="select-none text-5xl font-black text-white/15">
                {title.charAt(0)}
              </span>
            </div>
          ) : null}
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-snug text-card-foreground">
                {title}
              </h3>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{dates}</p>
            </div>

            {links && links.length > 0 && (
              <div className="relative z-10 mt-0.5 flex flex-shrink-0 items-center gap-0.5">
                {links.map((l, idx) => (
                  <Link
                    href={l.href}
                    key={idx}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                    title={l.type}
                    aria-label={`${l.type} — ${title}`}
                  >
                    <LinkIcon kind={l.kind} className="size-[15px]" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="prose max-w-full line-clamp-3 text-pretty font-sans text-[11.5px] leading-relaxed text-muted-foreground dark:prose-invert"
          >
            <p>{description}</p>
          </div>

          {tags.length > 0 && <TechTagList tags={tags} className="mt-auto pt-2" />}
        </div>
      </Card>

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={title}
        href={href}
        description={description}
        dates={dates}
        tags={tags}
        images={allImages}
        links={links ?? []}
        labels={labels}
        initialImage={currentImage}
      />
    </>
  );
}

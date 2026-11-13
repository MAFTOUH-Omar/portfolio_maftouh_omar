"use client";

import { ProjectGallery } from "@/components/project-gallery";
import {
  LinkIcon,
  TechTagList,
  type ProjectLabels,
  type ProjectLink,
  type TechTag,
} from "@/components/project-shared";
import { cn } from "@/lib/utils";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly TechTag[];
  images: readonly string[];
  links: readonly ProjectLink[];
  labels: ProjectLabels;
  /** Slide shown first (the one visible on the card). */
  initialImage: number;
}

/**
 * Project details in a native <dialog> (showModal): focus trap, Esc to close,
 * top-layer rendering and focus restore come from the browser — no library.
 * Content only mounts while open, so its images load on demand.
 */
export function ProjectDialog({ open, onClose, ...content }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedOnBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // Light dismiss: close only when the press *and* release happen on the
      // backdrop, so selecting text and releasing outside doesn't close it.
      onPointerDown={(e) => {
        pressedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pressedOnBackdrop.current && e.target === e.currentTarget) close();
      }}
      className="project-dialog m-auto w-[min(48rem,calc(100%-2rem))] max-w-none overflow-hidden rounded-xl border max-sm:mb-0 max-sm:w-full max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 border-border bg-card p-0 text-card-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {open && <DialogContent {...content} titleId={titleId} onRequestClose={close} />}
    </dialog>
  );
}

function DialogContent({
  title,
  href,
  description,
  dates,
  tags,
  images,
  links,
  labels,
  initialImage,
  titleId,
  onRequestClose,
}: Omit<Props, "open" | "onClose"> & { titleId: string; onRequestClose: () => void }) {
  const [index, setIndex] = useState(initialImage);
  const count = images.length;

  const actions: readonly ProjectLink[] =
    links.length > 0 ? links : href ? [{ kind: "website", type: labels.visit, href }] : [];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (count < 2) return;
    if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
    if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
  };

  return (
    <div onKeyDown={onKeyDown}>
      <button
        type="button"
        autoFocus
        onClick={onRequestClose}
        aria-label={labels.close}
        className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/75"
      >
        <X className="size-4" />
      </button>

      <div className="max-h-[90dvh] overflow-y-auto overscroll-contain max-sm:max-h-[92dvh]">
        {/* Gallery height is capped so text stays reachable on short (landscape) screens. */}
        {count > 0 && (
          <div className="relative aspect-[16/9] max-h-[55dvh] w-full overflow-hidden bg-muted/50">
            <ProjectGallery
              images={images}
              title={title}
              index={index}
              onIndexChange={setIndex}
              labels={labels}
              sizes="(max-width: 800px) 100vw, 768px"
              controls="always"
            />
          </div>
        )}

        <div className="flex flex-col gap-5 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7">
          <header className={cn(count === 0 && "pr-10")}>
            <h2 id={titleId} className="text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{dates}</p>
          </header>

          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {description}
          </p>

          {tags.length > 0 && (
            <section>
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {labels.stack}
              </h3>
              <TechTagList tags={tags} size="md" />
            </section>
          )}

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-5">
              {actions.map((link, i) => (
                <Link
                  key={`${link.href}-${i}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group/action inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    i === 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-muted"
                  )}
                >
                  <LinkIcon kind={link.kind} className="size-4" />
                  {link.type}
                  <ArrowUpRight className="size-3.5 opacity-70 transition-transform group-hover/action:-translate-y-0.5 group-hover/action:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

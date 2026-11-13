"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

/** Space the highlight extends around the hovered item (the source's p-2). */
const PAD_PX = 8;
/** Exit = 0.2s delay + 0.15s fade, as in Aceternity's card-hover-effect. */
const EXIT_DELAY_MS = 200;
const EXIT_TOTAL_MS = 350;

/**
 * Aceternity "card hover effect" without Motion: one background shape behind
 * the items that fades in on the hovered item and glides to the next one
 * (Motion's `layoutId`), then fades out after a short delay.
 *
 * Mark hoverable children with `data-hover-item`. Positions are written
 * straight to the DOM, so hovering never re-renders React. Mouse only.
 */
export function HoverHighlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const current = useRef<HTMLElement | null>(null);
  const shown = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const moveTo = (item: HTMLElement) => {
    const container = containerRef.current;
    const highlight = highlightRef.current;
    if (!container || !highlight) return;
    clearTimers();

    const c = container.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    const place = () => {
      highlight.style.transform = `translate(${r.left - c.left - PAD_PX}px, ${r.top - c.top - PAD_PX}px)`;
      highlight.style.width = `${r.width + PAD_PX * 2}px`;
      highlight.style.height = `${r.height + PAD_PX * 2}px`;
    };

    if (!shown.current) {
      // Appearing: jump into place, only the opacity animates.
      highlight.style.transitionProperty = "opacity";
      place();
      void highlight.offsetWidth; // commit the position before re-enabling transitions
      highlight.style.transitionProperty = "";
    } else {
      place(); // Already visible: glide to the new item.
    }
    highlight.dataset.visible = "";
    shown.current = true;
  };

  const hide = () => {
    current.current = null;
    clearTimers();
    timers.current.push(
      window.setTimeout(() => delete highlightRef.current?.dataset.visible, EXIT_DELAY_MS),
      window.setTimeout(() => (shown.current = false), EXIT_TOTAL_MS)
    );
  };

  const onPointerOver = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const item = (e.target as Element).closest<HTMLElement>("[data-hover-item]");
    if (item === current.current) return;
    if (!item || !containerRef.current?.contains(item)) return hide();
    current.current = item;
    moveTo(item);
  };

  return (
    <div
      ref={containerRef}
      onPointerOver={onPointerOver}
      onPointerLeave={hide}
      className={cn("relative", className)}
    >
      <span
        ref={highlightRef}
        aria-hidden
        className="hover-highlight pointer-events-none absolute left-0 top-0 rounded-lg bg-primary/15 dark:bg-primary/20"
      />
      {children}
    </div>
  );
}

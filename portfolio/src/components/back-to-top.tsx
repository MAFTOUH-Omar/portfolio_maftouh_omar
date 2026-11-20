"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Back-to-top button dressed like a mini hero card: brand ink, the sand
 * diagonal panel in the corner, the purple disc peeking out, and a sand
 * strip along the bottom that fills with the page's scroll progress
 * (scroll-driven CSS, `.scroll-progress` in globals.css — no JS).
 * Same small radius as the cards and section badges.
 */
export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={label}
      title={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      // Mobile: sit above the dock, which spans almost the full width.
      // sm+: drop down level with the dock (vertically centred on it).
      className={cn(
        "group fixed bottom-20 right-4 z-40 flex size-11 items-center justify-center overflow-hidden rounded-lg bg-hero-ink text-white shadow-lg shadow-hero-ink/25 ring-1 ring-black/5 transition-[opacity,transform,box-shadow] duration-200 hover:shadow-xl hover:shadow-hero-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:right-6 dark:ring-white/10 motion-reduce:transition-none",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2.5 scale-80 opacity-0"
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-hero-panel transition-[clip-path] duration-300 [clip-path:polygon(64%_0,100%_0,100%_36%)] group-hover:[clip-path:polygon(52%_0,100%_0,100%_48%)]"
      />
      <span aria-hidden className="absolute -bottom-2.5 -left-2.5 size-6 rounded-full bg-hero-disc/90" />
      <span
        aria-hidden
        className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-hero-panel"
      />
      <ArrowUp className="relative size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}

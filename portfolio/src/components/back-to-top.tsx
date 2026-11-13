"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      // Mobile: sit above the dock, which spans almost the full width.
      // sm+: drop down level with the dock (vertically centred on it).
      className={cn(
        "fixed bottom-20 right-4 z-40 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[opacity,transform,background-color] duration-200 hover:bg-primary/90 sm:bottom-6 sm:right-6 motion-reduce:transition-none",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2.5 scale-80 opacity-0"
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}

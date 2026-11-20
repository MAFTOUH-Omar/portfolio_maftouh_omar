import type { Accent, Shape } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";

/**
 * Background art for a card: one of nine shape layouts painted in the
 * card's accent color (`currentColor`), echoing the hero card's geometry.
 * Absolutely positioned behind the content (-z-10 inside the card's
 * `isolate` stacking context), so the text and layout never move. The card
 * needs `relative isolate overflow-hidden` and the `group/card` class.
 */
export function CardDecor({ accent, size = "md" }: { accent: Accent; size?: "md" | "sm" }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]", accent.tone.text)}
    >
      <ShapeLayout shape={accent.shape} md={size === "md"} />
    </span>
  );
}

/** Solid fills stay faint; outlines and patterns need a little more ink.
 *  Dark mode gets more: a low-alpha tint over near-black reads as mud. */
const FILL = "opacity-[0.11] dark:opacity-[0.26]";
const LINE = "opacity-[0.24] dark:opacity-[0.42]";
const GROW = "transition-transform duration-500 ease-out group-hover/card:scale-110";

function ShapeLayout({ shape, md }: { shape: Shape; md: boolean }) {
  switch (shape) {
    case "disc":
      return (
        <>
          <span className={cn("absolute rounded-full bg-current", FILL, GROW, md ? "-bottom-14 -right-10 size-36" : "-bottom-10 -right-8 size-24")} />
          <span className={cn("absolute rounded-full bg-current", FILL, md ? "right-32 top-5 size-3" : "right-20 top-3 size-2")} />
        </>
      );
    case "rings":
      return (
        <>
          <span className={cn("absolute rounded-full border-current", LINE, GROW, md ? "-right-10 -top-10 size-32 border-[12px]" : "-right-8 -top-8 size-24 border-[9px]")} />
          <span className={cn("absolute rounded-full border border-current", LINE, md ? "-right-16 -top-16 size-44" : "-right-12 -top-12 size-32")} />
        </>
      );
    case "corner":
      // The hero card's sand diagonal + a disc, as on the original cards.
      return (
        <>
          <span className={cn("absolute right-0 top-0 bg-hero-panel/50 [clip-path:polygon(35%_0,100%_0,100%_65%)] dark:bg-hero-panel/15", md ? "size-20" : "size-14")} />
          <span className={cn("absolute rounded-full bg-current", FILL, GROW, md ? "-bottom-12 -right-10 size-32" : "-bottom-10 -right-8 size-24")} />
        </>
      );
    case "diamond":
      return (
        <>
          <span className={cn("absolute rotate-45 rounded-lg bg-current transition-transform duration-500 ease-out group-hover/card:rotate-[60deg]", FILL, md ? "-bottom-10 right-8 size-24" : "-bottom-8 right-5 size-16")} />
          <span className={cn("absolute rotate-45 rounded-sm border-2 border-current", LINE, md ? "right-4 top-4 size-5" : "right-3 top-3 size-3.5")} />
        </>
      );
    case "dots":
      return (
        <>
          <span
            className={cn("absolute right-0 top-0", LINE, md ? "h-24 w-44" : "h-16 w-28")}
            style={{
              backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.7px)",
              backgroundSize: "12px 12px",
              maskImage: "linear-gradient(to bottom left, #000 10%, transparent 75%)",
              WebkitMaskImage: "linear-gradient(to bottom left, #000 10%, transparent 75%)",
            }}
          />
          <span className={cn("absolute rounded-full bg-current", FILL, GROW, md ? "-bottom-8 -right-6 size-20" : "-bottom-6 -right-5 size-14")} />
        </>
      );
    case "stripes":
      return (
        <span
          className={cn("absolute bottom-0 right-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]", LINE, GROW, "origin-bottom-right", md ? "size-36" : "size-20")}
          style={{ backgroundImage: "repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 10px)" }}
        />
      );
    case "half":
      return (
        <>
          <span className={cn("absolute top-1/2 -translate-y-1/2 rounded-full bg-current", FILL, GROW, md ? "-right-14 size-28" : "-right-10 size-20")} />
          <span className={cn("absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-current", LINE, md ? "-right-20 size-40" : "-right-14 size-28")} />
        </>
      );
    case "waves":
      return (
        <span
          className={cn("absolute rounded-full", LINE, GROW, md ? "-bottom-24 -right-24 size-56" : "-bottom-16 -right-16 size-36")}
          style={{ backgroundImage: "repeating-radial-gradient(circle, currentColor 0 2px, transparent 2px 12px)" }}
        />
      );
    case "blob":
      return (
        <>
          <span className={cn("absolute -rotate-[25deg] rounded-full bg-current", FILL, GROW, md ? "-right-10 -top-6 h-16 w-44" : "-right-8 -top-4 h-11 w-28")} />
          <span className={cn("absolute rounded-full bg-current", FILL, md ? "bottom-5 right-12 size-5" : "bottom-3 right-7 size-3")} />
        </>
      );
  }
}

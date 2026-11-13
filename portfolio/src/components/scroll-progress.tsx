/**
 * Reading progress bar driven by a CSS scroll-timeline (`.scroll-progress`
 * in globals.css) — no JavaScript. Browsers without scroll-driven animations
 * simply don't show it.
 */
export function ScrollProgress() {
  return (
    <div
      aria-hidden
      className="scroll-progress fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-[hsl(158_40%_45%)] via-[hsl(272_85%_60%)] to-[hsl(38_60%_70%)]"
    />
  );
}

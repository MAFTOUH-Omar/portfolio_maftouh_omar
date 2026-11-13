import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  /**
   * "slide" keeps the content fully opaque and only moves it. Use it above
   * the fold: an element that starts at opacity 0 isn't counted as painted,
   * which pushes back the Largest Contentful Paint.
   */
  variant?: "fade" | "slide";
}

/**
 * Fade + slide-in entrance, done in pure CSS (`.blur-fade` in globals.css).
 * It used to be framer-motion, which kept server-rendered content at
 * opacity 0 until the JS bundle hydrated — delaying the LCP. CSS animations
 * start on first paint and need no JavaScript.
 */
const BlurFade = ({
  children,
  className,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  variant = "fade",
}: BlurFadeProps) => {
  return (
    <div
      className={cn(variant === "slide" ? "slide-in" : "blur-fade", className)}
      style={
        {
          "--bf-delay": `${0.04 + delay}s`,
          "--bf-duration": `${duration}s`,
          "--bf-y": `${yOffset}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};

export default BlurFade;

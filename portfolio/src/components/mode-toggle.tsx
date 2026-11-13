"use client";

import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { useCallback } from "react";
import { useMounted } from "@/hooks/use-mounted";

export function ModeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

      const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

      if (
        !doc.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setTheme(nextTheme);
        return;
      }

      const { clientX: x, clientY: y } = event;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        flushSync(() => {
          document.documentElement.classList.toggle(
            "dark",
            nextTheme === "dark"
          );
        });
      });

      transition.ready.then(() => {
        document.documentElement
          .animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 600,
              easing: "cubic-bezier(0.65, 0, 0.35, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          )
          .finished.finally(() => {
            setTheme(nextTheme);
          });
      });
    },
    [resolvedTheme, setTheme]
  );

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <Button variant="ghost" type="button" size="icon" className="px-2" aria-label={label}>
        <div className="size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      type="button"
      size="icon"
      className="px-2"
      aria-label={label}
      onClick={toggleTheme}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="size-5"
      >
        {/* CSS transitions (no framer-motion); transform-box keeps origins on each shape. */}
        <clipPath id="theme-toggle-clip">
          <path
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
            style={{
              transform: isDark ? "translate(0, 0)" : "translate(-12px, 10px)",
              transition: "transform 0.5s ease-in-out",
            }}
          />
        </clipPath>
        <g clipPath="url(#theme-toggle-clip)">
          <circle
            cx="16"
            cy="16"
            r="10"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: isDark ? "scale(0.8)" : "scale(1)",
              transition: "transform 0.5s ease-in-out",
            }}
          />
          <g
            stroke="currentColor"
            strokeWidth="1.5"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-100deg) scale(0.5)",
              opacity: isDark ? 1 : 0,
              transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
            }}
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </g>
        </g>
      </svg>
    </Button>
  );
}

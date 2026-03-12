"use client";

import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { flushSync } from "react-dom";
import { useCallback, useEffect, useState } from "react";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

    if (
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

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
          { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] },
          {
            duration: 700,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        )
        .finished.finally(() => {
          setTheme(nextTheme);
        });
    });
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <Button variant="ghost" type="button" size="icon" className="px-2">
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
        <clipPath id="theme-toggle-clip">
          <motion.path
            animate={{
              y: isDark ? 0 : 10,
              x: isDark ? 0 : -12,
            }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#theme-toggle-clip)">
          <motion.circle
            animate={{ r: isDark ? 8 : 10 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? 0 : -100,
              scale: isDark ? 1 : 0.5,
              opacity: isDark ? 1 : 0,
            }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </Button>
  );
}

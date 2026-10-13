"use client";

import dynamic from "next/dynamic";

/**
 * tech-stack-icons ships every icon's SVG markup in a single ~8.7MB module
 * (no per-icon submodules, so bundlers can't tree-shake it). Loading it via
 * next/dynamic splits it into its own chunk, fetched only once a badge that
 * needs it actually mounts, instead of inflating the route's initial JS.
 */
export const StackIcon = dynamic(() => import("tech-stack-icons"), {
  ssr: false,
});

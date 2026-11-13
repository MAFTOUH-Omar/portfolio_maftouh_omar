"use client";

import { useEffect, useRef } from "react";

/** Cell size: must stay equal to `--hover-grid-cell` in globals.css. */
const CELL_PX = 64;

/**
 * Page backdrop (same effect as the Plaayer portal header): a grid that only
 * appears around the cursor, with cells that light up and fade as it passes.
 *
 * Fixed behind the content and `pointer-events: none`; the pointer is tracked
 * on the document. Mouse/trackpad only, no cell trail with reduced motion.
 * Everything goes through the DOM (CSS vars + short-lived cells): no React
 * render while the pointer moves.
 */
export function HoverGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let x = 0;
    let y = 0;
    let lastCell = "";

    const deactivate = () => {
      delete grid.dataset.active;
      lastCell = "";
    };

    const paint = () => {
      frame = 0;
      grid.dataset.active = "";
      grid.style.setProperty("--spot-x", `${x}px`);
      grid.style.setProperty("--spot-y", `${y}px`);
      if (reducedMotion) return;

      const col = Math.floor(x / CELL_PX);
      const row = Math.floor(y / CELL_PX);
      const key = `${col}:${row}`;
      if (key === lastCell) return;
      lastCell = key;

      const cell = document.createElement("span");
      cell.className = "hover-grid-cell";
      cell.style.left = `${col * CELL_PX}px`;
      cell.style.top = `${row * CELL_PX}px`;
      cell.addEventListener("animationend", () => cell.remove(), { once: true });
      grid.appendChild(cell);
    };

    const onPointerMove = (e: PointerEvent) => {
      // The grid is fixed at the viewport origin: client coords are grid coords.
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", deactivate);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", deactivate);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={gridRef}
      aria-hidden
      className="hover-grid pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    />
  );
}

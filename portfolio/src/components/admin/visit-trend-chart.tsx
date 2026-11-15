"use client";

import { useId, useMemo, useState } from "react";

type Point = { day: string; count: number };

const WIDTH = 600;
const HEIGHT = 180;
const PAD_X = 8;
const PAD_Y = 14;

function formatShortDate(day?: string) {
  if (!day) return "";
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** 14-day visits trend: a single-series area/line chart with a hover
 *  crosshair + tooltip. Hand-rolled SVG — one series needs no legend,
 *  the card title already names it. */
export function VisitTrendChart({ data }: { data: Point[] }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.count));
    const stepX = data.length > 1 ? (WIDTH - PAD_X * 2) / (data.length - 1) : 0;
    return data.map((d, i) => ({
      x: PAD_X + i * stepX,
      y: HEIGHT - PAD_Y - (d.count / max) * (HEIGHT - PAD_Y * 2),
      ...d,
    }));
  }, [data]);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x.toFixed(2)},${HEIGHT - PAD_Y} L${points[0].x.toFixed(2)},${HEIGHT - PAD_Y} Z`
      : "";

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    if (points.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const stepX = points.length > 1 ? (WIDTH - PAD_X * 2) / (points.length - 1) : 1;
    const index = Math.round((ratio * WIDTH - PAD_X) / stepX);
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-40 w-full touch-none overflow-visible"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`Daily visits over the last ${data.length} days, peaking at ${Math.max(0, ...data.map((d) => d.count))}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <line
          x1={PAD_X}
          y1={HEIGHT - PAD_Y}
          x2={WIDTH - PAD_X}
          y2={HEIGHT - PAD_Y}
          className="text-border"
          stroke="currentColor"
          strokeWidth="1"
        />
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            className="text-primary"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {hovered && (
          <>
            <line
              x1={hovered.x}
              y1={PAD_Y}
              x2={hovered.x}
              y2={HEIGHT - PAD_Y}
              className="text-muted-foreground/40"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r="4"
              className="text-primary"
              fill="currentColor"
              stroke="var(--background)"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
        >
          <p className="font-medium">{hovered.count} visits</p>
          <p className="text-muted-foreground">{formatShortDate(hovered.day)}</p>
        </div>
      )}
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{formatShortDate(data[0]?.day)}</span>
        <span>{formatShortDate(data[data.length - 1]?.day)}</span>
      </div>
    </div>
  );
}

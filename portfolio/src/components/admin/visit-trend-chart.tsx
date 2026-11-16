"use client";

import { useId, useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Point = { day: string; count: number };

const WIDTH = 600;
const HEIGHT = 180;
const PAD_X = 8;
const PAD_Y = 14;
const BAR_RADIUS = 4;
const BAR_GAP_RATIO = 0.35;

function formatShortDate(day?: string) {
  if (!day) return "";
  return new Date(`${day}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** A rect path with rounded top corners only, clamped so a near-zero bar
 *  never draws a radius taller than the bar itself. */
function roundedTopBarPath(x: number, yTop: number, width: number, height: number) {
  const r = Math.min(BAR_RADIUS, width / 2, height);
  const yBottom = yTop + height;
  if (r <= 0) return `M${x},${yBottom} L${x},${yTop} L${x + width},${yTop} L${x + width},${yBottom} Z`;
  return `M${x},${yBottom} L${x},${yTop + r} Q${x},${yTop} ${x + r},${yTop} L${x + width - r},${yTop} Q${x + width},${yTop} ${x + width},${yTop + r} L${x + width},${yBottom} Z`;
}

/** 14-day visits trend: a bar chart with a hover tooltip per bar, a dashed
 *  average reference line, and summary stats underneath. */
export function VisitTrendChart({ data }: { data: Point[] }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const stats = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const average = data.length > 0 ? total / data.length : 0;
    const peak = data.reduce((best, d) => (d.count > best.count ? d : best), data[0] ?? { day: "", count: 0 });
    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint).reduce((sum, d) => sum + d.count, 0);
    const secondHalf = data.slice(midpoint).reduce((sum, d) => sum + d.count, 0);
    const trendPct = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : secondHalf > 0 ? 100 : 0;
    return { total, average, peak, trendPct };
  }, [data]);

  const bars = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.count));
    const slotWidth = data.length > 0 ? (WIDTH - PAD_X * 2) / data.length : 0;
    const barWidth = slotWidth * (1 - BAR_GAP_RATIO);
    const gap = (slotWidth - barWidth) / 2;
    return data.map((d, i) => {
      const height = (d.count / max) * (HEIGHT - PAD_Y * 2);
      return {
        ...d,
        x: PAD_X + i * slotWidth + gap,
        y: HEIGHT - PAD_Y - height,
        width: barWidth,
        height,
        centerX: PAD_X + i * slotWidth + slotWidth / 2,
      };
    });
  }, [data]);

  const avgY = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.count));
    return HEIGHT - PAD_Y - (stats.average / max) * (HEIGHT - PAD_Y * 2);
  }, [data, stats.average]);

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    if (bars.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const slotWidth = (WIDTH - PAD_X * 2) / bars.length;
    const index = Math.floor((ratio * WIDTH - PAD_X) / slotWidth);
    setHoverIndex(Math.min(Math.max(index, 0), bars.length - 1));
  }

  const hovered = hoverIndex !== null ? bars[hoverIndex] : null;

  return (
    <div className="select-none">
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-40 w-full touch-none overflow-visible"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
          role="img"
          aria-label={`Daily visits over the last ${data.length} days, peaking at ${stats.peak.count} on ${formatShortDate(stats.peak.day)}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0.55 }} />
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
          {data.length > 0 && stats.average > 0 && (
            <line
              x1={PAD_X}
              y1={avgY}
              x2={WIDTH - PAD_X}
              y2={avgY}
              className="text-muted-foreground/40"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}
          {bars.map((bar, i) => (
            <path
              key={bar.day}
              d={roundedTopBarPath(bar.x, bar.y, bar.width, Math.max(bar.height, 1.5))}
              fill={`url(#${gradientId})`}
              opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
              className="transition-opacity"
            />
          ))}
        </svg>
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
            style={{ left: `${(hovered.centerX / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
          >
            <p className="font-medium">{hovered.count} visits</p>
            <p className="text-muted-foreground">{formatShortDate(hovered.day)}</p>
          </div>
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{formatShortDate(data[0]?.day)}</span>
        <span>{formatShortDate(data[data.length - 1]?.day)}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-center sm:grid-cols-4 sm:text-left">
        <div>
          <dt className="text-[11px] text-muted-foreground">Total</dt>
          <dd className="text-lg font-semibold tabular-nums text-foreground">{stats.total}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Daily average</dt>
          <dd className="text-lg font-semibold tabular-nums text-foreground">{stats.average.toFixed(1)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Peak day</dt>
          <dd className="text-lg font-semibold tabular-nums text-foreground">
            {stats.peak.count}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {formatShortDate(stats.peak.day)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted-foreground">Trend</dt>
          <dd
            className={cn(
              "flex items-center justify-center gap-1 text-lg font-semibold tabular-nums sm:justify-start",
              stats.trendPct > 0 && "text-emerald-600 dark:text-emerald-400",
              stats.trendPct < 0 && "text-destructive"
            )}
          >
            {stats.trendPct > 0 ? (
              <TrendingUp className="size-4" />
            ) : stats.trendPct < 0 ? (
              <TrendingDown className="size-4" />
            ) : null}
            {stats.trendPct > 0 ? "+" : ""}
            {stats.trendPct.toFixed(0)}%
          </dd>
        </div>
      </dl>
    </div>
  );
}

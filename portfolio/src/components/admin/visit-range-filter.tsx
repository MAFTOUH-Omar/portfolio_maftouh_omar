"use client";

import { Suspense, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isoDate, resolveVisitRange, type RangePreset } from "@/lib/visit-range";

const PRESET_OPTIONS: { key: RangePreset; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "14", label: "14 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "3 months" },
];

/** Date-range filter shared by the dashboard and visitors chart: preset
 *  buttons plus a "Custom" toggle revealing two native date pickers.
 *  `useSearchParams` needs a Suspense boundary, so this wraps the real
 *  implementation rather than making every call site remember to. */
export function VisitRangeFilter() {
  return (
    <Suspense fallback={<div className="h-9" />}>
      <VisitRangeFilterInner />
    </Suspense>
  );
}

function VisitRangeFilterInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const range = resolveVisitRange({
    range: searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const [customOpen, setCustomOpen] = useState(range.key === "custom");
  const [from, setFrom] = useState(isoDate(range.from));
  const [to, setTo] = useState(isoDate(range.to));

  function applyPreset(key: RangePreset) {
    setCustomOpen(false);
    router.replace(`${pathname}?range=${key}`, { scroll: false });
  }

  function applyCustom() {
    if (!from || !to) return;
    router.replace(`${pathname}?range=custom&from=${from}&to=${to}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-md border bg-muted/40 p-1">
        {PRESET_OPTIONS.map((option) => (
          <Button
            key={option.key}
            type="button"
            size="sm"
            variant={range.key === option.key ? "default" : "ghost"}
            className="h-7 px-2.5 text-xs"
            onClick={() => applyPreset(option.key)}
          >
            {option.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant={range.key === "custom" ? "default" : "ghost"}
          className="h-7 px-2.5 text-xs"
          onClick={() => setCustomOpen((open) => !open)}
        >
          Custom
        </Button>
      </div>
      {customOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-1 pl-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            From
            <Input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              className={cn("h-7 w-[9.5rem] px-2 text-xs")}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            To
            <Input
              type="date"
              value={to}
              min={from || undefined}
              max={isoDate(new Date())}
              onChange={(event) => setTo(event.target.value)}
              className={cn("h-7 w-[9.5rem] px-2 text-xs")}
            />
          </label>
          <Button type="button" size="sm" className="h-7 px-3 text-xs" onClick={applyCustom}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

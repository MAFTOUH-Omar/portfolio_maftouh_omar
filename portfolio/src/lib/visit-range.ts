export type RangePreset = "7" | "14" | "30" | "90";
export type RangeKey = RangePreset | "custom";

export type VisitRange = {
  key: RangeKey;
  /** Inclusive start of day. */
  from: Date;
  /** Inclusive end of day. */
  to: Date;
  days: number;
  label: string;
};

const PRESETS: Record<RangePreset, { days: number; label: string }> = {
  "7": { days: 7, label: "Last 7 days" },
  "14": { days: 14, label: "Last 14 days" },
  "30": { days: 30, label: "Last 30 days" },
  "90": { days: 90, label: "Last 3 months" },
};

const MAX_CUSTOM_DAYS = 366;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function daysBetweenInclusive(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

function formatShort(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isPreset(value: string | undefined): value is RangePreset {
  return value === "7" || value === "14" || value === "30" || value === "90";
}

/** Resolves `?range=7|14|30|90|custom&from=&to=` into a concrete date
 *  window — shared by the dashboard and visitors charts so both read the
 *  same filter the same way. */
export function resolveVisitRange(params: { range?: string; from?: string; to?: string }): VisitRange {
  const today = endOfDay(new Date());

  if (params.range === "custom" && params.from && params.to) {
    const fromDate = new Date(`${params.from}T00:00:00`);
    const toDate = new Date(`${params.to}T00:00:00`);
    if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime()) && fromDate <= toDate) {
      const from = startOfDay(fromDate);
      const clampedTo = endOfDay(toDate);
      const to = clampedTo > today ? today : clampedTo;
      const days = Math.min(MAX_CUSTOM_DAYS, daysBetweenInclusive(from, to));
      return { key: "custom", from, to, days, label: `${formatShort(from)} – ${formatShort(to)}` };
    }
  }

  const key = isPreset(params.range) ? params.range : "14";
  const preset = PRESETS[key];
  const to = today;
  const from = startOfDay(new Date(today));
  from.setDate(from.getDate() - (preset.days - 1));
  return { key, from, to, days: preset.days, label: preset.label };
}

/** `from`/`to` as `YYYY-MM-DD`, for date inputs and SQL bind params. */
export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fills each `{key}` placeholder of a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

/** "18 juin 2024" / "June 18, 2024" — no relative part, stable across renders. */
export function formatShortDate(date: string, dateLocale = "en-US") {
  return new Date(date).toLocaleDateString(dateLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "18 juin 2024 (il y a 2 ans)" / "June 18, 2024 (2 years ago)". */
export function formatDate(date: string, dateLocale = "en-US") {
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  const target = new Date(date);
  const daysAgo = Math.floor(Math.abs(Date.now() - target.getTime()) / 86_400_000);

  const fullDate = target.toLocaleString(dateLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const rtf = new Intl.RelativeTimeFormat(dateLocale, { numeric: "auto" });
  if (daysAgo < 1) return rtf.format(0, "day");
  if (daysAgo < 7) return `${fullDate} (${rtf.format(-daysAgo, "day")})`;
  if (daysAgo < 30) return `${fullDate} (${rtf.format(-Math.floor(daysAgo / 7), "week")})`;
  if (daysAgo < 365) return `${fullDate} (${rtf.format(-Math.floor(daysAgo / 30), "month")})`;
  return `${fullDate} (${rtf.format(-Math.floor(daysAgo / 365), "year")})`;
}

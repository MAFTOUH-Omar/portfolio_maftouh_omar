export interface ContributionDay {
  /** ISO date, e.g. "2026-11-13". */
  date: string;
  count: number;
  /** GitHub's intensity bucket, 0 (none) to 4 (most). */
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  total: number;
  /** Days in calendar order: column by column (weeks), Sunday to Saturday. */
  days: ContributionDay[];
}

/** Refetched at most once a day; the page is regenerated in the background (ISR). */
const REVALIDATE_SECONDS = 60 * 60 * 24;

/**
 * Public contribution calendar of a GitHub user — the same HTML fragment
 * github.com loads on profile pages, so no API token is needed.
 * Returns null on any failure so the page still renders without the graph.
 */
export async function getContributions(username: string): Promise<ContributionCalendar | null> {
  try {
    const res = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions`,
      {
        headers: { Accept: "text/html", "User-Agent": "portfolio-contributions" },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) return null;
    return parseContributions(await res.text());
  } catch {
    return null;
  }
}

export function parseContributions(html: string): ContributionCalendar | null {
  // Tooltip text per cell id: "No contributions on …" / "3 contributions on …".
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^\s*([\d,]+)\s+contribution/);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }

  const cells: (ContributionDay & { row: number; col: number })[] = [];
  for (const m of html.matchAll(/<td\b[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const id = tag.match(/\bid="contribution-day-component-(\d+)-(\d+)"/);
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    if (!date || !id) continue;
    cells.push({
      date,
      level: Math.min(4, Math.max(0, level)) as ContributionDay["level"],
      count: counts.get(`contribution-day-component-${id[1]}-${id[2]}`) ?? 0,
      row: Number(id[1]),
      col: Number(id[2]),
    });
  }
  if (cells.length === 0) return null;

  cells.sort((a, b) => a.col - b.col || a.row - b.row);
  const days = cells.map(({ date, count, level }) => ({ date, count, level }));
  return { total: days.reduce((sum, d) => sum + d.count, 0), days };
}

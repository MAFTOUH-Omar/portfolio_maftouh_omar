import { and, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { visits } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitTrendChart } from "@/components/admin/visit-trend-chart";
import { VisitRangeFilter } from "@/components/admin/visit-range-filter";
import { isoDate, resolveVisitRange, type VisitRange } from "@/lib/visit-range";

type Row = { label: string; count: number };
type TextColumn =
  | typeof visits.path
  | typeof visits.referrer
  | typeof visits.country
  | typeof visits.browser
  | typeof visits.os
  | typeof visits.device
  | typeof visits.language
  | typeof visits.utmSource;

async function topBy(column: TextColumn, fallback: string, range: VisitRange) {
  const rows = await db
    .select({ label: sql<string>`coalesce(${column}, ${fallback})`, count: sql<number>`count(*)` })
    .from(visits)
    .where(and(gte(visits.createdAt, range.from), lte(visits.createdAt, range.to)))
    .groupBy(column)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  return rows.map((row) => ({ label: row.label, count: Number(row.count) }));
}

function BarList({ title, rows }: { title: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  const total = Math.max(1, rows.reduce((sum, row) => sum + row.count, 0));
  return (
    <Card className="p-4 sm:p-5">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-20 flex-shrink-0 truncate text-foreground sm:w-24" title={row.label}>
                {row.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
              <span className="w-8 flex-shrink-0 text-right tabular-nums text-foreground">{row.count}</span>
              <span className="w-10 flex-shrink-0 text-right tabular-nums text-muted-foreground">
                {Math.round((row.count / total) * 100)}%
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminVisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const range = resolveVisitRange(await searchParams);

  const [
    [{ total }],
    dailyRows,
    topPages,
    topReferrers,
    topCountries,
    topBrowsers,
    topOs,
    topDevices,
    topLanguages,
    topCampaigns,
  ] = await Promise.all([
    db.select({ total: sql<number>`count(*)` }).from(visits),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${visits.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(visits)
      .where(and(gte(visits.createdAt, range.from), lte(visits.createdAt, range.to)))
      .groupBy(sql`date_trunc('day', ${visits.createdAt})`)
      .orderBy(sql`date_trunc('day', ${visits.createdAt})`),
    topBy(visits.path, "(unknown)", range),
    topBy(visits.referrer, "Direct", range),
    topBy(visits.country, "Unknown", range),
    topBy(visits.browser, "Unknown", range),
    topBy(visits.os, "Unknown", range),
    topBy(visits.device, "Unknown", range),
    topBy(visits.language, "Unknown", range),
    topBy(visits.utmSource, "None", range),
  ]);

  const dailyMap = new Map(dailyRows.map((row) => [row.day, Number(row.count)]));
  const rangeDays = Array.from({ length: range.days }, (_, index) => {
    const date = new Date(range.from);
    date.setDate(date.getDate() + index);
    const key = isoDate(date);
    return { day: key, count: dailyMap.get(key) ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>
        <VisitRangeFilter />
      </div>
      <p className="text-xs text-muted-foreground">
        All panels below are scoped to <span className="font-medium text-foreground">{range.label}</span>, except
        the all-time total.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total visits recorded (all time)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold tracking-tight text-foreground">{Number(total)}</p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:col-span-2 sm:p-5">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">{range.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <VisitTrendChart data={rangeDays} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BarList title="Top pages" rows={topPages} />
        <BarList title="Top referrers" rows={topReferrers} />
        <BarList title="Top countries" rows={topCountries} />
        <BarList title="Browsers" rows={topBrowsers} />
        <BarList title="Operating systems" rows={topOs} />
        <BarList title="Devices" rows={topDevices} />
        <BarList title="Languages" rows={topLanguages} />
        <BarList title="Campaign sources (UTM)" rows={topCampaigns} />
      </div>
    </div>
  );
}

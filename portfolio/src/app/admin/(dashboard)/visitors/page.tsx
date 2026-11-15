import { desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { visits } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitTrendChart } from "@/components/admin/visit-trend-chart";

type Row = { label: string; count: number };
type TextColumn =
  | typeof visits.path
  | typeof visits.referrer
  | typeof visits.country
  | typeof visits.browser
  | typeof visits.os
  | typeof visits.device;

async function topBy(column: TextColumn, fallback: string) {
  const rows = await db
    .select({ label: sql<string>`coalesce(${column}, ${fallback})`, count: sql<number>`count(*)` })
    .from(visits)
    .groupBy(column)
    .orderBy(desc(sql`count(*)`))
    .limit(8);
  return rows.map((row) => ({ label: row.label, count: Number(row.count) }));
}

function BarList({ title, rows }: { title: string; rows: Row[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
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
              <span className="w-24 flex-shrink-0 truncate text-foreground sm:w-28" title={row.label}>
                {row.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
              <span className="w-8 flex-shrink-0 text-right text-muted-foreground">{row.count}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminVisitorsPage() {
  const [[{ total }], dailyRows, topPages, topReferrers, topCountries, topBrowsers, topOs, topDevices] =
    await Promise.all([
      db.select({ total: sql<number>`count(*)` }).from(visits),
      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${visits.createdAt}), 'YYYY-MM-DD')`,
          count: sql<number>`count(*)`,
        })
        .from(visits)
        .where(sql`${visits.createdAt} >= now() - interval '14 days'`)
        .groupBy(sql`date_trunc('day', ${visits.createdAt})`)
        .orderBy(sql`date_trunc('day', ${visits.createdAt})`),
      topBy(visits.path, "(unknown)"),
      topBy(visits.referrer, "Direct"),
      topBy(visits.country, "Unknown"),
      topBy(visits.browser, "Unknown"),
      topBy(visits.os, "Unknown"),
      topBy(visits.device, "Unknown"),
    ]);

  const dailyMap = new Map(dailyRows.map((row) => [row.day, Number(row.count)]));
  const last14Days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return { day: key, count: dailyMap.get(key) ?? 0 };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total visits recorded
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold tracking-tight text-foreground">{Number(total)}</p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:col-span-2 sm:p-5">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last 14 days</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <VisitTrendChart data={last14Days} />
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
      </div>
    </div>
  );
}

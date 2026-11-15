import { desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { visits } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = { label: string; count: number };

async function topBy(column: typeof visits.path | typeof visits.referrer | typeof visits.country, fallback: string) {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-28 flex-shrink-0 truncate text-foreground" title={row.label}>
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
  const [[{ total }], dailyRows, topPages, topReferrers, topCountries] = await Promise.all([
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
  ]);

  const dailyMap = new Map(dailyRows.map((row) => [row.day, Number(row.count)]));
  const last14Days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return { day: key, count: dailyMap.get(key) ?? 0 };
  });
  const maxDaily = Math.max(1, ...last14Days.map((d) => d.count));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total visits recorded</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-foreground">{Number(total)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-end gap-1">
            {last14Days.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-1" title={`${day.day}: ${day.count}`}>
                <div
                  className="w-full rounded-t-sm bg-primary"
                  style={{ height: `${(day.count / maxDaily) * 100}%`, minHeight: day.count > 0 ? "2px" : "0" }}
                />
                <span className="text-[10px] text-muted-foreground">{day.day.slice(8, 10)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <BarList title="Top pages" rows={topPages} />
        <BarList title="Top referrers" rows={topReferrers} />
        <BarList title="Top countries" rows={topCountries} />
      </div>
    </div>
  );
}

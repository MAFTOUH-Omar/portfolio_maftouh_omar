import Link from "next/link";
import { sql } from "drizzle-orm";
import { FolderKanban, Newspaper, Users, Wrench } from "lucide-react";
import { db } from "@/db/client";
import { posts, projects, skills, visits } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitTrendChart } from "@/components/admin/visit-trend-chart";

export default async function AdminDashboardPage() {
  const [
    [{ count: projectCount }],
    [{ count: skillCount }],
    [{ count: postCount }],
    [{ count: visitCount }],
    dailyRows,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db.select({ count: sql<number>`count(*)` }).from(skills),
    db.select({ count: sql<number>`count(*)` }).from(posts),
    db.select({ count: sql<number>`count(*)` }).from(visits),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${visits.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(visits)
      .where(sql`${visits.createdAt} >= now() - interval '14 days'`)
      .groupBy(sql`date_trunc('day', ${visits.createdAt})`)
      .orderBy(sql`date_trunc('day', ${visits.createdAt})`),
  ]);

  const dailyMap = new Map(dailyRows.map((row) => [row.day, Number(row.count)]));
  const last14Days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return { day: key, count: dailyMap.get(key) ?? 0 };
  });

  const cards = [
    { href: "/admin/projects", label: "Projects", value: projectCount, icon: FolderKanban },
    { href: "/admin/skills", label: "Skills", value: skillCount, icon: Wrench },
    { href: "/admin/posts", label: "Blog posts", value: postCount, icon: Newspaper },
    { href: "/admin/visitors", label: "Visits recorded", value: visitCount, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="p-4 transition-colors hover:border-primary/60 sm:p-5">
              <CardHeader className="flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {Number(card.value)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="p-4 sm:p-5">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Visits — last 14 days
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <VisitTrendChart data={last14Days} />
        </CardContent>
      </Card>
    </div>
  );
}

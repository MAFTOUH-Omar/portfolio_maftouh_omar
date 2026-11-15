import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, projects, skills, visits } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [[{ count: projectCount }], [{ count: skillCount }], [{ count: postCount }], [{ count: visitCount }]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(projects),
      db.select({ count: sql<number>`count(*)` }).from(skills),
      db.select({ count: sql<number>`count(*)` }).from(posts),
      db.select({ count: sql<number>`count(*)` }).from(visits),
    ]);

  const cards = [
    { href: "/admin/projects", label: "Projects", value: projectCount },
    { href: "/admin/skills", label: "Skills", value: skillCount },
    { href: "/admin/posts", label: "Blog posts", value: postCount },
    { href: "/admin/visitors", label: "Visits recorded", value: visitCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition-colors hover:border-foreground/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{Number(card.value)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

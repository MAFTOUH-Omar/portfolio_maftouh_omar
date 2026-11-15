import Link from "next/link";
import { sql } from "drizzle-orm";
import { FolderKanban, Newspaper, Users, Wrench } from "lucide-react";
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
    { href: "/admin/projects", label: "Projects", value: projectCount, icon: FolderKanban },
    { href: "/admin/skills", label: "Skills", value: skillCount, icon: Wrench },
    { href: "/admin/posts", label: "Blog posts", value: postCount, icon: Newspaper },
    { href: "/admin/visitors", label: "Visits recorded", value: visitCount, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition-colors hover:border-primary/60">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {Number(card.value)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

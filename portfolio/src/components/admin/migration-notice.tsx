import { DatabaseZap } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Shown instead of crashing when the likes/comments tables don't exist yet. */
export function EngagementMigrationNotice({ className }: { className?: string }) {
  return (
    <Card className={className ? `${className} p-5` : "p-5"}>
      <div className="flex gap-3">
        <DatabaseZap className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Likes &amp; comments aren&apos;t set up in the database yet.</p>
          <p className="text-muted-foreground">
            Apply the pending migration <code className="font-mono text-xs">drizzle/0002_post_engagement.sql</code>{" "}
            with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npm run db:migrate</code>, then
            reload this page.
          </p>
        </div>
      </div>
    </Card>
  );
}

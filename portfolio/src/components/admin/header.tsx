import Link from "next/link";
import { AdminUserMenu } from "@/components/admin/user-menu";

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-hero-ink font-mono text-sm font-semibold text-hero-panel dark:ring-1 dark:ring-white/10"
          >
            OM
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-tight">Portfolio</span>
            <span className="block text-xs text-muted-foreground">Administration</span>
          </span>
        </Link>
        <AdminUserMenu email={email} />
      </div>
    </header>
  );
}

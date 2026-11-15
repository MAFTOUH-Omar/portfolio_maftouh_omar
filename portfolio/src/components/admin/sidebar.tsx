"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  Tag,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUserMenu } from "@/components/admin/user-menu";

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/profile", label: "Profile", icon: UserRound },
      { href: "/admin/skills", label: "Skills", icon: Wrench },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/work", label: "Work experience", icon: Briefcase },
      { href: "/admin/education", label: "Education", icon: GraduationCap },
    ],
  },
  {
    label: "Blog",
    items: [
      { href: "/admin/posts", label: "Posts", icon: Newspaper },
      { href: "/admin/tags", label: "Tags", icon: Tag },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/admin/visitors", label: "Visitors", icon: Users }],
  },
] as const;

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-screen w-64 shrink-0 flex-col gap-6 border-r bg-card/40 px-4 py-6">
      <Link href="/admin" className="flex items-center gap-2.5 px-2">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-hero-ink font-mono text-sm font-semibold text-hero-panel dark:ring-1 dark:ring-white/10"
        >
          OM
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">Portfolio</span>
          <span className="block text-xs text-muted-foreground">Administration</span>
        </span>
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="border-t pt-3">
        <AdminUserMenu email={email} />
      </div>
    </nav>
  );
}

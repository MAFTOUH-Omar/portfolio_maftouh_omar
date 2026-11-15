"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/profile", label: "Profile" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/work", label: "Work experience" },
      { href: "/admin/education", label: "Education" },
    ],
  },
  {
    label: "Blog",
    items: [
      { href: "/admin/posts", label: "Posts" },
      { href: "/admin/tags", label: "Tags" },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/admin/visitors", label: "Visitors" }],
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-6 border-r px-4 py-6">
      <span className="px-2 text-sm font-semibold">Portfolio admin</span>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-2 text-xs font-medium uppercase text-muted-foreground">
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
                  "block rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

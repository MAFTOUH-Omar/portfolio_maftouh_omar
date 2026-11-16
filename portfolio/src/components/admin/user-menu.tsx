"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Briefcase,
  ChevronsUpDown,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Moon,
  Newspaper,
  SquareArrowOutUpRight,
  Sun,
  Tag,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

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

function initialsFrom(email: string) {
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[.\-_]/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0][0], parts[1][0]] : [name.slice(0, 2)];
  return letters.join("").slice(0, 2).toUpperCase();
}

/** Avatar dropdown carrying every sidebar nav link plus account actions —
 *  the admin's only navigation surface, so it stays usable at any width. */
export function AdminUserMenu({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2.5 outline-none transition-colors hover:bg-accent/10 focus-visible:bg-accent/10">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
          {initialsFrom(email)}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-foreground sm:block">
          {email}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {NAV_GROUPS.map((group, groupIndex) => (
          <DropdownMenuGroup key={group.label} className={cn(groupIndex > 0 && "mt-1")}>
            <DropdownMenuLabel className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
              {group.label}
            </DropdownMenuLabel>
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <DropdownMenuItem
                  key={item.href}
                  asChild
                  className={cn(active && "bg-accent text-accent-foreground font-medium")}
                >
                  <Link href={item.href}>
                    <item.icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <SquareArrowOutUpRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            View public site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            setTheme(isDark ? "light" : "dark");
          }}
        >
          {isDark ? (
            <Sun aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <Moon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          )}
          {isDark ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut aria-hidden className="size-4 shrink-0 text-destructive" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

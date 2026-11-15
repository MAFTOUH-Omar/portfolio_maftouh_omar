import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import { getSession } from "@/lib/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <span className="text-sm text-muted-foreground">{session?.email}</span>
          <div className="flex items-center gap-2">
            <ModeToggle label="Toggle theme" />
            <LogoutButton />
          </div>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

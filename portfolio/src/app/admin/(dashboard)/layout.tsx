import { AdminSidebar } from "@/components/admin/sidebar";
import { getSession } from "@/lib/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={session?.email ?? ""} />
      <main className="min-w-0 flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}

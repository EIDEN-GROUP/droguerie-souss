import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { useAdminAuth } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin   Droguerie Souss" }] }),
});

function AdminLayout() {
  const [mounted, setMounted] = useState(false);
  const isAuthed = useAdminAuth((s) => s.isAuthed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (!isAuthed) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-brand-secondary">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex h-screen flex-col lg:pl-64">
        <div className="m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-cream shadow-2xl sm:m-3 lg:ml-0">
          <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

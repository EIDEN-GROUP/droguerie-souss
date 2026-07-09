import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { useAdminAuth } from "@/lib/adminAuth";
import { PageLoader } from "@/components/Loader";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin Droguerie Souss" }] }),
});

function AdminLayout() {
  const [mounted, setMounted] = useState(false);
  const { isAuthed, loading, checkSession } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!isAuthed) return (
    <>
      <PageLoader key="admin-login" />
      <AdminLogin />
    </>
  );

  return (
    <>
      <PageLoader key="admin-dashboard" />
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-brand via-brand-dark to-brand-secondary">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div
        className={`flex h-screen flex-col transition-transform duration-300 ease-out lg:translate-x-0 lg:pl-64 ${
          mobileOpen ? "translate-x-64" : "translate-x-0"
        }`}
      >
        <div className="relative my-4 mr-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-cream shadow-2xl lg:ml-0">
          <AdminTopbar onMenuClick={() => setMobileOpen((o) => !o)} />
          <main className="styled-scrollbar flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
          {mobileOpen && (
            <button
              aria-label="Fermer le menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 z-20 cursor-pointer lg:hidden"
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}

import { useId } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Package, Receipt, LogOut, Store, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAdminAuth } from "@/lib/adminAuth";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Produits", icon: Package },
  { to: "/admin/orders", label: "Ventes", icon: Receipt },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logout = useAdminAuth((s) => s.logout);
  const layoutId = useId();

  return (
    <div className="flex h-full flex-col bg-brand-secondary text-paper">
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-paper/10">
          <img src={logo} alt="Droguerie Souss Logo" className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-bold tracking-wide">Droguerie Souss</div>
          <div className="text-[11px] text-paper/60">Espace admin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 pl-4 rounded-r-lg">
        {links.map((l) => {
          const active = l.to === "/admin" ? pathname === "/admin" : pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 rounded-l-3xl px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                active ? "text-brand-secondary" : "text-paper/75 hover:bg-paper/10 hover:text-paper"
              }`}
            >
              {active && (
                <motion.div
                  layoutId={layoutId}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  className="absolute inset-0 rounded-l-3xl bg-cream"
                >
                  <div className="pointer-events-none absolute -top-4 right-0 h-4 w-4 bg-[radial-gradient(circle_at_top_left,transparent_15.5px,theme(colors.cream)_16px)]" />
                  <div className="pointer-events-none absolute -bottom-4 right-0 h-4 w-4 bg-[radial-gradient(circle_at_bottom_left,transparent_15.5px,theme(colors.cream)_16px)]" />
                </motion.div>
              )}
              <l.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{l.label}</span>
            </Link>
          );
        })}
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-paper/75 transition hover:bg-paper/10 hover:text-paper"
        >
          <Store className="h-4 w-4" /> Voir le site
        </Link>
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-paper/75 transition hover:bg-paper/10 hover:text-paper"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">
        <SidebarContent />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80%] shadow-2xl lg:hidden"
            >
              <button
                onClick={onClose}
                aria-label="Fermer le menu"
                className="absolute right-3 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-paper hover:bg-paper/10"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

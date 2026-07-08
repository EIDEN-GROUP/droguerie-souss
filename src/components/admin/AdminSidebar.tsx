import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Package, Receipt, LogOut, Store, X } from "lucide-react";
import { useAdminAuth } from "@/lib/adminAuth";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Produits", icon: Package },
  { to: "/admin/orders", label: "Ventes", icon: Receipt },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logout = useAdminAuth((s) => s.logout);

  return (
    <div className="flex h-full flex-col bg-brand-secondary text-paper">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="h-11 w-11">
          <img src="/src/assets/logo.png" alt="Droguerie Souss Logo" className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-bold tracking-wide">DROGUERIE SOUSS</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-paper/60">Admin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => {
          const active = l.to === "/admin" ? pathname === "/admin" : pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider transition ${
                active ? "bg-brand text-brand-foreground" : "text-paper/70 hover:bg-paper/10 hover:text-paper"
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-paper/10 p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider text-paper/70 transition hover:bg-paper/10 hover:text-paper"
        >
          <Store className="h-4 w-4" /> Voir le site
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider text-accent-red/90 transition hover:bg-accent-red/10 hover:text-accent-red"
        >
          <LogOut className="h-4 w-4" /> Déconnexion
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

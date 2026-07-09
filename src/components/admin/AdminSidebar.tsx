import { useId } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, Receipt, Tags, Store, MessageSquare } from "lucide-react";
import logo from "@/assets/icon-white.png";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Produits", icon: Package },
  { to: "/admin/categories", label: "Catégories", icon: Tags },
  { to: "/admin/orders", label: "Ventes", icon: Receipt },
  { to: "/admin/contactez-nouss", label: "Contacts", icon: MessageSquare },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const layoutId = useId();

  return (
    <div className="flex h-full flex-col text-paper">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 px-6 py-7"
      >
        <div className="h-11 w-11 shrink-0 overflow-hidden">
          <img src={logo} alt="Droguerie Souss Logo" className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-bold tracking-wide">Espace admin</div>
        </div>
      </motion.div>

      <nav className="flex-1 space-y-1.5 rounded-r-lg pl-4">
        {links.map((l, i) => {
          const active = l.to === "/admin" ? pathname === "/admin" : pathname.startsWith(l.to);
          return (
            <motion.div
              key={l.to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
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
                    <svg
                      viewBox="0 0 16 16"
                      className="pointer-events-none absolute -top-4 right-0 h-4 w-4 text-cream"
                      aria-hidden="true"
                    >
                      <path d="M16 0 A16 16 0 0 1 0 16 L16 16 Z" fill="currentColor" />
                    </svg>
                    <svg
                      viewBox="0 0 16 16"
                      className="pointer-events-none absolute -bottom-4 right-0 h-4 w-4 text-cream"
                      aria-hidden="true"
                    >
                      <path d="M0 0 A16 16 0 0 1 16 16 L16 0 Z" fill="currentColor" />
                    </svg>
                  </motion.div>
                )}
                <l.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{l.label}</span>
              </Link>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 + links.length * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-l-3xl px-4 py-2.5 text-sm font-semibold text-paper/75 transition hover:bg-paper/10 hover:text-paper"
          >
            <Store className="h-4 w-4" /> Voir le site
          </Link>
        </motion.div>
      </nav>
    </div>
  );
}

export function AdminSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <SidebarContent onNavigate={onClose} />
    </div>
  );
}

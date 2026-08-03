import { useEffect, useId, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, Package, Receipt, Tags, Store, MessageSquare } from "lucide-react";
import logo from "@/assets/icon-white.png";
import { useAdminAuth } from "@/lib/adminAuth";

type NavChild = { to: string; label: string };
type NavLink = {
  to?: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: readonly string[];
  children?: NavChild[];
};

const allLinks: NavLink[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "sales"] },
  { to: "/admin/products", label: "Produits", icon: Package, roles: ["admin"] },
  {
    label: "Catégories",
    icon: Tags,
    roles: ["admin"],
    children: [
      { to: "/admin/categories", label: "Toutes les catégories" },
      { to: "/admin/subcategories", label: "Sous-catégories" },
    ],
  },
  { to: "/admin/orders", label: "Ventes", icon: Receipt, roles: ["admin", "sales"] },
  { to: "/admin/contacts", label: "Contacts", icon: MessageSquare, roles: ["admin", "sales"] },
];

const isLinkActive = (pathname: string, to: string) =>
  to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

/** The sliding cream pill behind the active item, with its rounded outside corners. */
function ActivePill({ layoutId }: { layoutId: string }) {
  return (
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
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  /** The router's types don't narrow through `select`, hence the cast. */
  const pathname = useRouterState({ select: (s) => s.location.pathname }) as unknown as string;
  const layoutId = useId();
  const { role } = useAdminAuth();

  const links = allLinks.filter((l) => l.roles.includes(role ?? "admin"));

  /** Groups stay collapsed unless one of their pages is open, or the user opens them. */
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const active = allLinks.find((l) =>
      l.children?.some((c) => isLinkActive(pathname, c.to)),
    );
    if (active) setOpenGroup(active.label);
  }, [pathname]);

  return (
    <div className="flex h-full flex-col text-paper">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 px-6 py-7"
      >
        <div className="h-11 w-11 shrink-0 overflow-hidden">
          <img src={logo} alt="Souss Droguerie Logo" className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-base font-bold tracking-wide">Espace admin</div>
        </div>
      </motion.div>

      <nav className="styled-scrollbar flex-1 space-y-1.5 overflow-y-auto rounded-r-lg pl-4">
        {links.map((l, i) => {
          const childActive = l.children?.some((c) => isLinkActive(pathname, c.to)) ?? false;
          const active = l.to ? isLinkActive(pathname, l.to) : false;
          const expanded = openGroup === l.label;

          return (
            <motion.div
              key={l.to ?? l.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              {l.children ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenGroup((g) => (g === l.label ? null : l.label))}
                    aria-expanded={expanded}
                    className={`relative flex w-full cursor-pointer items-center gap-3 rounded-l-3xl px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                      childActive && !expanded
                        ? "text-brand-secondary"
                        : "text-paper/75 hover:bg-paper/10 hover:text-paper"
                    }`}
                  >
                    <l.icon className="relative z-10 h-4 w-4" />
                    <span className="relative z-10 flex-1 text-left">{l.label}</span>
                    <ChevronDown
                      className={`relative z-10 h-4 w-4 transition-transform duration-300 ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5 pt-1.5">
                          {l.children.map((c) => {
                            const cActive = isLinkActive(pathname, c.to);
                            return (
                              <Link
                                key={c.to}
                                to={c.to}
                                onClick={onNavigate}
                                className={`relative flex items-center gap-3 rounded-l-3xl py-2.5 pl-11 pr-4 text-sm font-semibold transition-colors duration-300 ${
                                  cActive
                                    ? "text-brand-secondary"
                                    : "text-paper/70 hover:bg-paper/10 hover:text-paper"
                                }`}
                              >
                                {cActive && <ActivePill layoutId={layoutId} />}
                                <span className="relative z-10">{c.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={l.to!}
                  onClick={onNavigate}
                  className={`relative flex items-center gap-3 rounded-l-3xl px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                    active ? "text-brand-secondary" : "text-paper/75 hover:bg-paper/10 hover:text-paper"
                  }`}
                >
                  {active && <ActivePill layoutId={layoutId} />}
                  <l.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{l.label}</span>
                </Link>
              )}
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 + allLinks.length * 0.06, ease: [0.22, 1, 0.36, 1] }}
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

import { useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useAdminAuth } from "@/lib/adminAuth";

const titles: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/products": "Produits",
  "/admin/orders": "Ventes",
};

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logout = useAdminAuth((s) => s.logout);
  const title = titles[pathname] ?? "Dashboard";

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-paper/95 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink hover:bg-mint lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="font-display text-lg font-bold uppercase tracking-wide sm:text-xl">{title}</h1>
      <div className="ml-auto">
        <button
          onClick={() => logout()}
          className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-soft transition hover:border-accent-red hover:text-accent-red"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

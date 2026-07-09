import { useRouterState } from "@tanstack/react-router";
import { Menu, LogOut } from "lucide-react";
import { useAdminAuth } from "@/lib/adminAuth";

const titles: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/products": "Produits",
  "/admin/orders": "Ventes",
};

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout, userEmail } = useAdminAuth();
  const title = titles[pathname] ?? "Dashboard";

  return (
    <div className="flex h-16 shrink-0 items-center gap-4 border-b border-ink/10 px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink hover:bg-mint lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="font-display text-lg font-bold uppercase tracking-wide sm:text-xl">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        {userEmail && (
          <span className="hidden text-xs text-ink-soft sm:block">{userEmail}</span>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 rounded-full bg-accent-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream transition hover:bg-accent-red/70"
        >
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

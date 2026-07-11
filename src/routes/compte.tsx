import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Heart,
  LogOut,
  Package,
  ShoppingBag,
  UserRound,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/lib/adminStore";
import { useCustomerAuth } from "@/lib/customerAuth";
import { getLocalOrders } from "@/lib/localOrders";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/compte")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Mon compte   Droguerie Souss" }] }),
});

type Tab = "orders" | "favorites";

const statusConfig = {
  pending: {
    label: "En attente",
    icon: Clock,
    className: "bg-accent-orange/10 text-accent-orange",
  },
  confirmed: { label: "Confirmée", icon: CheckCircle2, className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", icon: XCircle, className: "bg-accent-red/10 text-accent-red" },
} as const;

function AccountPage() {
  const { user, loading, setAuthOpen, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <Layout>
      <div className="border-b bg-cream">
        <div className="container-x flex items-center gap-2 py-4 text-xs text-ink-soft">
          <Link to="/" className="hover:text-brand">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">Mon compte</span>
        </div>
      </div>

      <div className="container-x py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          </div>
        ) : !user ? (
          <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed py-16 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint">
              <UserRound className="h-9 w-9 text-brand" />
            </div>
            <p className="mt-4 font-display text-lg font-bold uppercase">Connectez-vous</p>
            <p className="mt-1 px-6 text-sm text-ink-soft">
              Accédez à vos commandes et à vos favoris en vous connectant à votre compte.
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-brand-dark"
            >
              Se connecter / S'inscrire
            </button>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-end justify-between gap-4"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-orange">
                  Espace client
                </span>
                <h1 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
                  Bonjour{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
                </h1>
                <p className="mt-2 text-ink-soft">{user.email}</p>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-accent-red/30 px-4 py-2.5 text-sm font-semibold text-accent-red transition hover:bg-accent-red hover:text-paper"
              >
                <LogOut className="h-4 w-4" /> Se déconnecter
              </button>
            </motion.div>

            {/* Tabs */}
            <div className="mt-8 flex gap-1 rounded-full bg-mint p-1 sm:max-w-md">
              {(
                [
                  { id: "orders", label: "Mes commandes", icon: Package },
                  { id: "favorites", label: "Mes favoris", icon: Heart },
                ] as { id: Tab; label: string; icon: typeof Package }[]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                    tab === t.id
                      ? "bg-brand text-brand-foreground shadow"
                      : "text-ink hover:bg-paper/60"
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {tab === "orders" ? <MyOrders email={user.email} /> : <MyFavorites />}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function MyOrders({ email }: { email: string }) {
  const [orders] = useState(() => getLocalOrders(email));

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed py-16 text-center">
        <Package className="mx-auto h-12 w-12 text-ink-soft" />
        <p className="mt-4 font-display text-lg font-bold uppercase">Aucune commande</p>
        <p className="mt-1 text-sm text-ink-soft">
          Vos demandes de devis passées avec ce compte apparaîtront ici.
        </p>
        <Link
          to="/produits"
          className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-brand-dark"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o: any) => {
        const status = statusConfig[o.status as keyof typeof statusConfig] ?? statusConfig.pending;
        return (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-paper p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <p className="font-mono text-xs text-ink-soft">
                  Commande #{o.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {new Date(o.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                >
                  <status.icon className="h-3.5 w-3.5" /> {status.label}
                </span>
                <span className="font-display text-lg font-bold text-brand">
                  {Number(o.total).toFixed(0)} MAD
                </span>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {(o.items || []).map((i: any, idx: number) => (
                <li key={idx} className="flex items-center gap-3">
                  {i.product_image ? (
                    <img src={i.product_image} alt="" className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded bg-mint">
                      <Package className="h-5 w-5 text-ink-soft" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{i.product_name}</p>
                    <p className="text-xs text-ink-soft">
                      {i.qty} × {Number(i.price).toFixed(0)} MAD
                    </p>
                  </div>
                  <p className="text-sm font-bold">{(i.price * i.qty).toFixed(0)} MAD</p>
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}

function MyFavorites() {
  const { favorites, toggleFavorite, addToCart } = useApp();
  const { data: products, isLoading } = useProducts();
  const favProducts = (products || []).filter((p: any) => favorites.includes(p.id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (favProducts.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed py-16 text-center">
        <Heart className="mx-auto h-12 w-12 text-ink-soft" />
        <p className="mt-4 font-display text-lg font-bold uppercase">Aucun favori</p>
        <p className="mt-1 text-sm text-ink-soft">
          Cliquez sur le cœur d'un produit pour le sauvegarder.
        </p>
        <Link
          to="/produits"
          className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-brand-dark"
        >
          Explorer les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favProducts.map((p: any) => (
        <motion.div
          key={p.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 rounded-2xl border bg-paper p-4"
        >
          <Link to="/product/$id" params={{ id: p.id }} className="shrink-0">
            <img src={p.image} alt={p.name} className="h-24 w-24 rounded-lg object-cover" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <Link
              to="/product/$id"
              params={{ id: p.id }}
              className="line-clamp-2 text-sm font-semibold hover:text-brand"
            >
              {p.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink-soft">
              {p.price} MAD / {p.unit}
            </p>
            <div className="mt-auto flex items-center gap-2 pt-2">
              <button
                onClick={() => addToCart(p)}
                className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:bg-brand-dark"
              >
                <ShoppingBag className="h-3 w-3" /> Ajouter
              </button>
              <button
                onClick={() => toggleFavorite(p.id)}
                className="text-xs text-ink-soft hover:text-accent-red"
              >
                Retirer
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

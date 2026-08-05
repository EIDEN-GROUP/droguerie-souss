import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Boxes, Loader2, ShoppingBag, User } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { useProducts, useOrders } from "@/lib/adminStore";
import { revenueByMonth, topProducts, uniqueCustomers } from "@/lib/orders";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: products, isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useOrders();

  const clients = useMemo(() => uniqueCustomers(orders || []), [orders]);
  const revenue = useMemo(() => revenueByMonth(orders || []), [orders]);
  const bestProducts = useMemo(() => topProducts(orders || []), [orders]);

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {(productsError || ordersError) && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm font-semibold text-accent-red">
          Erreur de chargement. Veuillez réessayer.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard label="Total produits" value={products?.length ?? 0} icon={Boxes} tint="brand" />
        <StatCard label="Commandes" value={orders?.length ?? 0} icon={ShoppingBag} tint="mint" />
        <StatCard label="Clients" value={clients} icon={User} tint="mint" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]"
      >
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
          Top produits vendus
        </h3>
        {bestProducts.length === 0 ? (
          <EmptyChart label="Aucune vente pour le moment" />
        ) : (
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestProducts} layout="vertical" margin={{ left: 8, right: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 16)}…` : v)}
                />
                <Tooltip />
                <Bar dataKey="qty" fill="#2f378d" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]"
      >
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
          Chiffre d'affaires 6 derniers mois
        </h3>
        <div className="mt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2f378d" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2f378d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e1ee" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={48} />
              <Tooltip formatter={(v: number) => `${v.toFixed(0)} MAD`} />
              <Area type="monotone" dataKey="total" stroke="#2f378d" strokeWidth={2} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="mt-2 flex h-40 items-center justify-center rounded-xl border-2 border-dashed text-center text-xs text-ink-soft">
      {label}
    </div>
  );
}

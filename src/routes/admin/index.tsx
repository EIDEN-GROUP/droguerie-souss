import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Loader2, PackageX, Receipt, ShoppingBag, Users } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { useProducts, useOrders } from "@/lib/adminStore";
import { revenueByMonth, soldUnits, topProducts, uniqueCustomers } from "@/lib/orders";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PIE_COLORS = ["#4274d9", "#d0e7e6"];

function AdminDashboard() {
  const { data: products, isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useOrders();

  const totalStock = useMemo(() => (products || []).reduce((s: number, p: any) => s + p.stock, 0), [products]);
  const outOfStock = useMemo(() => (products || []).filter((p: any) => p.stock === 0).length, [products]);
  const sold = useMemo(() => soldUnits(orders || []), [orders]);
  const clients = useMemo(() => uniqueCustomers(orders || []), [orders]);
  const revenue = useMemo(() => revenueByMonth(orders || []), [orders]);
  const bestProducts = useMemo(() => topProducts(orders || []), [orders]);

  const pieData = [
    { name: "Unités vendues", value: sold },
    { name: "Stock restant", value: totalStock },
  ];
  const pieTotal = sold + totalStock;

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total produits" value={products?.length ?? 0} icon={Boxes} tint="brand" />
        <StatCard label="Commandes" value={orders?.length ?? 0} icon={ShoppingBag} tint="mint" />
        <StatCard label="Stock total" value={totalStock} icon={Receipt} tint="sky" />
        <StatCard label="Rupture de stock" value={outOfStock} icon={PackageX} tint="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-brand-secondary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink">{clients}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Clients</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)] lg:col-span-1">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
            Valeur de l'inventaire
          </h3>
          {pieTotal === 0 ? (
            <EmptyChart label="Aucune donnée d'inventaire" />
          ) : (
            <div className="mt-2 flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {pieData.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i] }}
                    />
                    <span className="text-ink-soft">{d.name}</span>
                    <span className="font-bold text-ink">{Math.round((d.value / pieTotal) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]">
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
                  <Bar dataKey="qty" fill="#4274d9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
          Chiffre d'affaires &mdash; 6 derniers mois
        </h3>
        <div className="mt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4274d9" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4274d9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e8ec" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={48} />
              <Tooltip formatter={(v: number) => `${v.toFixed(0)} MAD`} />
              <Area type="monotone" dataKey="total" stroke="#4274d9" strokeWidth={2} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
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

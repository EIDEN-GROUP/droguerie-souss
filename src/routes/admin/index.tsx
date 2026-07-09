import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Boxes, PackageX, Receipt, ShoppingBag, Users } from "lucide-react";
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
import { useAdminStore } from "@/lib/adminStore";
import { revenueByMonth, soldUnits, topProducts, uniqueCustomers } from "@/lib/orders";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const PIE_COLORS = ["#2f378d", "#dddfec"];

function AdminDashboard() {
  const products = useAdminStore((s) => s.products);
  const orders = useAdminStore((s) => s.orders);

  const totalStock = useMemo(() => products.reduce((s, p) => s + p.stock, 0), [products]);
  const outOfStock = useMemo(() => products.filter((p) => p.stock === 0).length, [products]);
  const sold = useMemo(() => soldUnits(orders), [orders]);
  const clients = useMemo(() => uniqueCustomers(orders), [orders]);
  const revenue = useMemo(() => revenueByMonth(orders), [orders]);
  const bestProducts = useMemo(() => topProducts(orders), [orders]);

  const pieData = [
    { name: "Unités vendues", value: sold },
    { name: "Stock restant", value: totalStock },
  ];
  const pieTotal = sold + totalStock;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total produits" value={products.length} icon={Boxes} tint="brand" index={0} />
        <StatCard label="Commandes" value={orders.length} icon={ShoppingBag} tint="mint" index={1} />
        <StatCard label="Stock total" value={totalStock} icon={Receipt} tint="sky" index={2} />
        <StatCard label="Rupture de stock" value={outOfStock} icon={PackageX} tint="red" index={3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.0 }}
          className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-brand-secondary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink">{clients}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Clients</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)] lg:col-span-1"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)] lg:col-span-1"
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]"
      >
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
          Chiffre d'affaires   6 derniers mois
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

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const tints = {
  brand: "bg-brand/10 text-brand",
  mint: "bg-mint text-brand-secondary",
  sky: "bg-sky/40 text-brand-secondary",
  red: "bg-accent-red/10 text-accent-red",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tint = "brand",
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tint?: keyof typeof tints;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="flex items-center gap-4 rounded-2xl border bg-paper p-5 shadow-[var(--shadow-card)]"
    >
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tints[tint]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-2xl font-bold text-ink">{value}</p>
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      </div>
    </motion.div>
  );
}

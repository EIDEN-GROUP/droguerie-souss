import { motion } from "framer-motion";
import { Truck, ShieldCheck, Headphones, Wallet } from "lucide-react";

const services = [
  { icon: Truck, title: "Livraison rapide", text: "Dans tout le Souss sous 48h" },
  { icon: ShieldCheck, title: "Qualité garantie", text: "Matériaux certifiés norme NM" },
  { icon: Headphones, title: "Support 7j/7", text: "Nos experts vous conseillent" },
  { icon: Wallet, title: "Devis gratuit", text: "Sans engagement en 24h" },
];

export function ServiceBar() {
  return (
    <section className="relative -mt-24 z-10">
      <div className="container-x">
        <div className="grid gap-4 rounded-2xl bg-paper p-4 shadow-[var(--shadow-card)] sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group flex items-center gap-4 rounded-xl p-4 transition hover:bg-mint"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-mint text-brand transition group-hover:bg-brand group-hover:text-brand-foreground">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-bold uppercase tracking-wide">
                  {s.title}
                </p>
                <p className="text-xs text-ink-soft">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

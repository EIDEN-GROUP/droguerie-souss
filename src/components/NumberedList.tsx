import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Liste editoriale numerotee (engagements d'A propos, questions de Contact) : deux
 * colonnes des `sm`, chaque bloc coiffe d'un filet fin qui se trace a l'entree ; au survol,
 * un filet rouge parcourt le haut du bloc et le titre passe en bleu. Ni ombre ni halo.
 */
export function NumberedList({
  items,
}: {
  items: { title: string; text: string; icon?: LucideIcon }[];
}) {
  return (
    <ol className="grid gap-x-12 sm:grid-cols-2">
      {items.map((item, i) => (
        <motion.li
          key={item.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: (i % 2) * 0.12, ease: EASE }}
          className="group relative py-8"
        >
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 + (i % 2) * 0.12, ease: EASE }}
            className="absolute inset-x-0 top-0 h-px origin-left bg-border"
          />
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-px w-0 bg-accent-red transition-[width] duration-500 ease-out group-hover:w-full"
          />
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold tabular-nums text-accent-red">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item.icon && (
              <item.icon className="h-5 w-5 text-ink-soft transition duration-500 group-hover:-translate-y-0.5 group-hover:text-brand" />
            )}
          </div>
          <h3 className="mt-5 font-display text-lg font-bold uppercase tracking-wide text-ink transition-colors duration-300 group-hover:text-brand sm:text-xl">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.text}</p>
        </motion.li>
      ))}
    </ol>
  );
}

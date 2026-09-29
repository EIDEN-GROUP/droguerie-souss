import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Questions frequentes en accordeon : une reponse ouverte a la fois (la premiere a
 * l'arrivee). La question ouverte passe sur fond creme, son numero et son bouton au rouge,
 * le + tourne en croix et la reponse se deplie.
 *
 * Les reponses fermees restent dans le DOM (hauteur nulle, `inert`) : le balisage FAQPage
 * de la page reprend ces textes et Google demande qu'ils figurent dans la page.
 */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        const questionId = `${baseId}-q${i}`;
        const answerId = `${baseId}-a${i}`;
        return (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
              isOpen
                ? "border-transparent bg-cream"
                : "border-border bg-paper hover:border-brand/40"
            }`}
          >
            <h3>
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-4 p-5 text-left sm:gap-6 sm:p-6"
              >
                <span
                  className={`w-6 shrink-0 font-display text-sm tabular-nums transition-colors duration-300 ${
                    isOpen ? "text-accent-red" : "text-ink-soft"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 font-display text-base uppercase leading-snug tracking-wide text-ink sm:text-lg">
                  {item.q}
                </span>
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-paper transition-colors duration-300 ${
                    isOpen ? "bg-accent-red" : "bg-brand-secondary"
                  }`}
                >
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="grid place-items-center"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </span>
              </button>
            </h3>
            <motion.div
              id={answerId}
              role="region"
              aria-labelledby={questionId}
              inert={!isOpen}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-6 text-sm leading-relaxed text-ink-soft sm:pb-7 sm:pl-[4.5rem] sm:pr-20 sm:text-base">
                {item.a}
              </p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

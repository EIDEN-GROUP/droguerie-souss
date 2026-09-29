import { motion, type Variants } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import type { CategoryInfo } from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as const;

/** La colonne glisse depuis la gauche, puis les rayons arrivent l'un apres l'autre ; a la
 *  sortie, elle repart d'un bloc, plus vite. */
const column: Variants = {
  hidden: { opacity: 0, x: -24, transition: { duration: 0.25, ease: EASE } },
  shown: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE, staggerChildren: 0.035, delayChildren: 0.05 },
  },
};
const row: Variants = {
  hidden: { opacity: 0, x: -12 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
};

function Count({ value, active }: { value?: number; active: boolean }) {
  if (value === undefined) return null;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
        active ? "bg-paper/15 text-paper" : "bg-cream text-ink-soft"
      }`}
    >
      {value}
    </span>
  );
}

/**
 * Colonne des rayons de la boutique (bureau). Elle prend le relais du carrousel du haut
 * une fois celui-ci depasse : la page la monte et la retire (`AnimatePresence`) selon le
 * defilement. Chaque rayon affiche le nombre de produits qu'il donnerait avec la recherche
 * et le filtre best-sellers en cours - le meme principe que les pastilles des sous-categories.
 */
export function ShopSidebar({
  items,
  active,
  counts,
  total,
  onSelect,
}: {
  items: CategoryInfo[];
  active?: string;
  counts?: Map<string, number>;
  total?: number;
  onSelect: (category?: string) => void;
}) {
  const button = (isActive: boolean, empty = false) =>
    `group flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
      isActive
        ? "bg-brand-secondary text-paper shadow-[var(--shadow-card)]"
        : `text-ink hover:bg-cream ${empty ? "opacity-50" : ""}`
    }`;

  return (
    <motion.nav
      aria-label="Rayons"
      variants={column}
      initial="hidden"
      animate="shown"
      exit="hidden"
    >
      <p className="px-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft">Rayons</p>
      <ul className="mt-3 space-y-1">
        <motion.li variants={row}>
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            aria-current={active ? undefined : "true"}
            className={button(!active)}
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
                active ? "bg-mint text-brand" : "bg-paper/15 text-paper"
              }`}
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold leading-tight">
              Tous les produits
            </span>
            <Count value={total} active={!active} />
          </button>
        </motion.li>

        {items.map((c) => {
          const isActive = active === c.category;
          const count = counts?.get(c.category);
          return (
            <motion.li key={c.category} variants={row}>
              <button
                type="button"
                onClick={() => onSelect(c.category)}
                aria-current={isActive ? "true" : undefined}
                className={button(isActive, count === 0)}
              >
                <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-tight">{c.name}</span>
                <Count value={count} active={isActive} />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </motion.nav>
  );
}

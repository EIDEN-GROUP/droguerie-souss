import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useRef, type CSSProperties } from "react";

type Item = { icon: LucideIcon; title: string; text: string };

/** Une carte : collee sous l'en-tete, un peu plus bas que la precedente (on voit le haut de
 *  la pile), et reduite a mesure que les suivantes viennent la recouvrir. */
function StackCard({
  item,
  index,
  count,
  progress,
}: {
  item: Item;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const target = 1 - (count - 1 - index) * 0.04;
  const scale = useTransform(progress, [index / count, 1], [1, reduce ? 1 : target]);

  return (
    <div
      style={{ "--i": index } as CSSProperties}
      className="sticky top-[calc(6rem+var(--i)*1rem)] pb-6 lg:top-[calc(8rem+var(--i)*1.25rem)]"
    >
      <motion.article
        style={{ scale }}
        className="origin-top rounded-3xl border border-border bg-paper p-6 shadow-[var(--shadow-card)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-6">
          <span className="font-display text-5xl leading-none tabular-nums text-mint sm:text-6xl">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-secondary text-paper">
            <item.icon className="h-6 w-6" strokeWidth={1.5} />
          </span>
        </div>
        <h3 className="mt-6 font-display text-xl uppercase leading-tight tracking-wide text-ink sm:text-2xl">
          {item.title}
        </h3>
        <span className="mt-4 block h-1 w-12 rounded-full bg-accent-red" />
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          {item.text}
        </p>
      </motion.article>
    </div>
  );
}

/**
 * Cartes empilees au defilement : chacune colle sous l'en-tete et la suivante vient la
 * recouvrir, en laissant depasser le haut des precedentes, qui retrecissent un peu a chaque
 * nouvelle carte. Du CSS `sticky` pour la pile ; la reduction suit la progression du
 * defilement sur la liste (sans effet en mouvement reduit).
 */
export function StackedCards({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref}>
      {items.map((item, i) => (
        <StackCard
          key={item.title}
          item={item}
          index={i}
          count={items.length}
          progress={scrollYProgress}
        />
      ))}
    </div>
  );
}

import { motion } from "framer-motion";
import { SplitReveal } from "./motion/SplitReveal";

const titleClass =
  "font-display text-3xl font-bold uppercase leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl";

/** `animated` (page d'accueil) : filets du surtitre qui s'etirent depuis le texte et titre
 *  revele mot a mot (GSAP). Sans, l'apparition simple des autres pages. */
export function SectionHeader({
  kicker,
  title,
  align = "center",
  animated = false,
}: {
  kicker?: string;
  title?: string;
  align?: "center" | "left";
  animated?: boolean;
}) {
  const line = (origin: "left" | "right") =>
    animated ? (
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={`h-px w-8 bg-accent-red ${origin === "left" ? "origin-left" : "origin-right"}`}
      />
    ) : (
      <span className="h-px w-8 bg-accent-red" />
    );

  return (
    <div className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      {kicker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2"
        >
          {line("right")}
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-red">
            {kicker}
          </span>
          {line("left")}
        </motion.div>
      )}
      {title &&
        (animated ? (
          <SplitReveal as="h2" className={titleClass}>
            {title}
          </SplitReveal>
        ) : (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={titleClass}
          >
            {title}
          </motion.h2>
        ))}
    </div>
  );
}

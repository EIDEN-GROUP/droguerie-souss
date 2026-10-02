import { motion } from "framer-motion";
import { Reveal } from "./motion/Reveal";
import { fromTo, rise } from "./motion/reveals";
import { SplitReveal } from "./motion/SplitReveal";

const titleBase =
  "font-display text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl md:text-5xl";

/** `animated` (page d'accueil) : filets du surtitre qui s'etirent depuis le texte et titre
 *  revele mot a mot (GSAP). Sans, l'apparition simple des autres pages.
 *  `onDark` : sur un fond sombre, titre blanc et surtitre pervenche (le rouge n'y ressort pas). */
export function SectionHeader({
  kicker,
  title,
  align = "center",
  animated = false,
  onDark = false,
}: {
  kicker?: string;
  title?: string;
  align?: "center" | "left";
  animated?: boolean;
  onDark?: boolean;
}) {
  const titleClass = `${titleBase} ${onDark ? "text-paper" : "text-ink"}`;
  const lineColor = onDark ? "bg-sky" : "bg-accent-red";
  const line = (origin: "left" | "right") =>
    animated ? (
      <motion.span
        variants={fromTo({ scaleX: 0 }, { scaleX: 1 }, { delay: 0.15 })}
        className={`h-px w-8 ${lineColor} ${origin === "left" ? "origin-left" : "origin-right"}`}
      />
    ) : (
      <span className={`h-px w-8 ${lineColor}`} />
    );

  return (
    <Reveal
      className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start"}`}
    >
      {kicker && (
        <motion.div
          variants={rise({ y: 10, duration: 0.5 })}
          className="inline-flex items-center gap-2"
        >
          {line("right")}
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${
              onDark ? "text-sky" : "text-accent-red"
            }`}
          >
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
          <motion.h2 variants={rise({ y: 20, duration: 0.6 })} className={titleClass}>
            {title}
          </motion.h2>
        ))}
    </Reveal>
  );
}

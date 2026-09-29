import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Step = { icon: LucideIcon; title: string; text: string };

/**
 * Trait entre deux etapes : rail pale, rempli en bleu a mesure que la progression parcourt
 * son intervalle. Horizontal en `lg` (du bord d'une pastille au bord de la suivante, a
 * travers l'ecart de la grille), vertical en dessous (sous la pastille, jusqu'a la suivante).
 */
function Segment({
  progress,
  from,
  to,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
}) {
  const fill = useTransform(progress, [from, to], [0, 1]);
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute left-[calc(50%+2.25rem)] top-7 hidden h-1 w-[calc(100%-2.5rem)] -translate-y-1/2 overflow-hidden rounded-full bg-mint lg:block"
      >
        <motion.span
          style={{ scaleX: fill }}
          className="block h-full origin-left rounded-full bg-brand"
        />
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-7 left-7 top-[4.25rem] w-1 -translate-x-1/2 overflow-hidden rounded-full bg-mint lg:hidden"
      >
        <motion.span
          style={{ scaleY: fill }}
          className="block h-full w-full origin-top rounded-full bg-brand"
        />
      </span>
    </>
  );
}

/**
 * Etapes d'un parcours, facon barre de progression pilotee par le defilement : le rail se
 * remplit a mesure que la liste traverse l'ecran, et chaque pastille s'allume quand il
 * l'atteint - les etapes passees prennent une coche, l'etape en cours un halo, comme le
 * stepper du formulaire. Le texte des etapes pas encore atteintes reste estompe.
 *
 * Mouvement reduit : tout est affiche d'emblee, rail plein.
 */
export function ProgressSteps({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const last = steps.length - 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const full = useMotionValue(1);
  const progress = reduce ? full : smooth;

  /** Nombre d'etapes atteintes : la premiere des que la liste entre, la suivante quand
   *  le trait qui y mene est plein. */
  const [reachedCount, setReachedCount] = useState(0);
  useMotionValueEvent(smooth, "change", (p) =>
    setReachedCount(p <= 0.001 ? 0 : Math.min(steps.length, Math.floor(p * last + 0.02) + 1)),
  );
  const reached = reduce ? steps.length : reachedCount;

  return (
    <ol ref={ref} className="grid gap-10 lg:grid-cols-4 lg:gap-8">
      {steps.map((s, i) => {
        const isReached = i < reached;
        const isCurrent = i === reached - 1;
        const done = isReached && !isCurrent;
        const Icon = done ? Check : s.icon;
        return (
          <li
            key={s.title}
            className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center"
          >
            {i < last && <Segment progress={progress} from={i / last} to={(i + 1) / last} />}

            <motion.span
              animate={{ scale: isCurrent ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full transition-[background-color,color,box-shadow] duration-500 ${
                isReached ? "bg-brand text-paper" : "bg-mint text-ink-soft"
              } ${isCurrent ? "shadow-[0_0_0_8px_rgba(47,55,141,0.12)]" : ""}`}
            >
              <motion.span
                key={done ? "done" : "icon"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
              </motion.span>
            </motion.span>

            <motion.div
              initial={false}
              animate={{ opacity: isReached ? 1 : 0.45 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="min-w-0 pt-1 lg:mt-6 lg:pt-0"
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${
                  isReached ? "text-accent-red" : "text-ink-soft"
                }`}
              >
                Étape {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-lg uppercase leading-tight tracking-wide text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft lg:mx-auto lg:max-w-[16rem]">
                {s.text}
              </p>
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}

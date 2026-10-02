import { motion, type HTMLMotionProps } from "framer-motion";
import { useCallback } from "react";
import { ReplayContext, useRevealState } from "./reveals";

/**
 * Pose sur une page (l'accueil) : les animations d'apparition ne jouent plus une seule
 * fois mais a chaque passage - l'element entre quand il arrive dans l'ecran et ressort
 * quand il le quitte, dans un sens de defilement comme dans l'autre.
 */
export const ReplayReveals = ReplayContext.Provider;

type Tag = "div" | "p" | "span" | "ul" | "li" | "figure" | "section" | "article";

/**
 * Element qui guette son entree dans l'ecran et l'annonce a ses variantes (`below`, `shown`,
 * `above`). Avec `variants`, il s'anime lui-meme ; sans, il ne fait que transmettre son
 * etat a ses descendants `motion`, qui portent chacun les leurs (`rise`, `wipe`, `fromTo`).
 */
export function Reveal({
  as = "div",
  margin,
  ref: outer,
  ...props
}: { as?: Tag; margin?: string } & HTMLMotionProps<"div">) {
  const [inner, state] = useRevealState<HTMLDivElement>(margin);
  // Une `ref` peut arriver avec les props (en developpement, l'outillage en pose une sur
  // chaque element) : elle est servie en meme temps que la notre, au lieu de l'ecraser.
  const ref = useCallback(
    (value: HTMLDivElement | null) => {
      inner(value);
      if (typeof outer === "function") outer(value);
      else if (outer) outer.current = value;
    },
    [inner, outer],
  );
  const Component = motion[as] as typeof motion.div;
  return <Component initial="below" animate={state} {...props} ref={ref} />;
}

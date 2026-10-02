import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useReplay } from "./reveals";

/** Chiffre qui compte de zero a `to` en entrant dans l'ecran : une seule fois, ou a chaque
 *  entree sous `ReplayReveals`. Rendu a sa valeur finale cote serveur et en mouvement
 *  reduit. */
export function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const replay = useReplay();
  const inView = useInView(ref, { once: !replay, margin: "-60px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(to);

  useEffect(() => {
    if (!inView || reduce) return;
    setN(0);
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

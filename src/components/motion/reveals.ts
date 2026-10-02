import type { Variants } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Sortie : plus courte que l'entree et sans delai, l'element quitte l'ecran. */
const OUT = { duration: 0.45, ease: EASE };

export const ReplayContext = createContext(false);

export const useReplay = () => useContext(ReplayContext);

/** Ou se trouve l'element : sous l'ecran, dans l'ecran, ou au-dessus. */
export type RevealState = "below" | "shown" | "above";

/**
 * Suit l'entree d'un element dans l'ecran (`margin` : retrait vertical de la zone guettee).
 *
 * Hors `ReplayReveals`, l'etat passe a `shown` une fois pour toutes. Dedans, il repasse a
 * `above` ou `below` selon le cote par lequel l'element sort : les variantes s'en servent
 * pour le faire partir dans le sens du defilement. C'est aussi ce qui rend l'animation
 * stable - un element qui sortirait par le haut en redescendant rentrerait aussitot dans la
 * zone guettee, et clignoterait.
 *
 * Renvoie la ref a poser sur l'element (une fonction : l'element est tenu en etat, pour que
 * le guet demarre des qu'il existe, meme pose par un composant `motion`), l'etat, et une ref
 * objet vers le meme element pour qui en a besoin (`useScroll`, GSAP).
 */
export function useRevealState<T extends Element>(margin = "-80px") {
  const node = useRef<T | null>(null);
  const [el, setEl] = useState<T | null>(null);
  // Un detachement (`null`) est ignore : une ref reposee a chaque rendu detache puis rattache
  // le meme element, et le guet n'a pas a redemarrer pour autant.
  const ref = useCallback((value: T | null) => {
    if (!value) return;
    node.current = value;
    setEl(value);
  }, []);
  const replay = useReplay();
  const [state, setState] = useState<RevealState>("below");

  useEffect(() => {
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          if (!replay) observer.disconnect();
        } else if (replay) {
          setState(entry.boundingClientRect.top < window.innerHeight / 2 ? "above" : "below");
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, replay, margin]);

  return [ref, state, node] as const;
}

/** Montee : l'element arrive d'en dessous et repart par le haut (l'inverse en remontant la
 *  page). `x` ajoute un glissement lateral. */
export function rise({
  y = 28,
  x = 0,
  delay = 0,
  duration = 0.8,
}: { y?: number; x?: number; delay?: number; duration?: number } = {}): Variants {
  return {
    below: { opacity: 0, x, y, transition: OUT },
    above: { opacity: 0, x, y: -y, transition: OUT },
    shown: { opacity: 1, x: 0, y: 0, transition: { duration, delay, ease: EASE } },
  };
}

const CLIPPED = {
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  top: "inset(0% 0% 100% 0%)",
  bottom: "inset(100% 0% 0% 0%)",
} as const;

/** Rideau : l'element se devoile depuis le bord `from`, et se referme vers lui en sortant.
 *  A poser sur un enfant d'un `Reveal` : rogne en entier, un element ne peut pas guetter sa
 *  propre entree dans l'ecran. */
export function wipe(
  from: keyof typeof CLIPPED,
  { delay = 0, duration = 1.2 }: { delay?: number; duration?: number } = {},
): Variants {
  const hidden = { clipPath: CLIPPED[from], transition: { duration: 0.6, ease: EASE } };
  return {
    below: hidden,
    above: hidden,
    shown: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration, delay, ease: EASE } },
  };
}

/** Variantes libres : un meme etat cache quel que soit le cote de sortie. */
export function fromTo(
  hidden: Record<string, string | number>,
  shown: Record<string, string | number>,
  { delay = 0, duration = 0.8 }: { delay?: number; duration?: number } = {},
): Variants {
  return {
    below: { ...hidden, transition: OUT },
    above: { ...hidden, transition: OUT },
    shown: { ...shown, transition: { duration, delay, ease: EASE } },
  };
}

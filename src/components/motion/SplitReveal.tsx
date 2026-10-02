import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useReplay, useRevealState } from "./reveals";

/**
 * Texte qui monte ligne a ligne derriere un masque (GSAP SplitText).
 *
 * - `trigger="load"` joue a l'affichage (titre du hero), `"scroll"` quand le texte entre
 *   dans l'ecran (titres de section).
 * - `by="chars"` anime lettre par lettre, `"words"` mot par mot.
 *
 * Le texte est rendu cache (`invisible`) et GSAP le devoile au moment de l'animation :
 * sans ca, il s'afficherait un instant avant de disparaitre pour s'animer. `autoSplit`
 * redecoupe les lignes apres le chargement des polices et a chaque redimensionnement.
 *
 * Sous `ReplayReveals` (accueil), un titre `"scroll"` ne joue plus une seule fois : il se
 * devoile a chaque entree dans l'ecran et redescend derriere son masque a chaque sortie.
 */
export function SplitReveal({
  as: Tag = "div",
  children,
  className = "",
  trigger = "scroll",
  by = "words",
  delay = 0,
  active = true,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  trigger?: "load" | "scroll";
  by?: "words" | "chars";
  delay?: number;
  /** Tant que `false`, le texte reste cache et rien ne joue (intro video de l'accueil). */
  active?: boolean;
}) {
  const [ref, state, node] = useRevealState<HTMLElement>("-10%");
  /** Rejoue : l'animation est tenue en pause et pilotee par l'etat ci-dessus. */
  const replay = useReplay() && trigger === "scroll";
  const tween = useRef<gsap.core.Tween | null>(null);
  const shown = useRef(false);
  shown.current = state === "shown";

  useGSAP(
    () => {
      const el = node.current;
      if (!el || !active) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      SplitText.create(el, {
        type: by === "chars" ? "lines,words,chars" : "lines,words",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          const animation = gsap.from(by === "chars" ? self.chars : self.words, {
            yPercent: 110,
            duration: by === "chars" ? 0.8 : 1,
            ease: "power4.out",
            stagger: by === "chars" ? 0.022 : 0.07,
            delay,
            paused: replay,
            scrollTrigger:
              trigger === "scroll" && !replay
                ? { trigger: el, start: "top 88%", once: true }
                : undefined,
          });
          if (replay) {
            tween.current = animation;
            // Redecoupe en cours de route : le texte deja a l'ecran reste affiche.
            if (shown.current) animation.progress(1);
          }
          return animation;
        },
      });
    },
    { scope: node, dependencies: [active, replay] },
  );

  useEffect(() => {
    if (!replay) return;
    if (state === "shown") tween.current?.play();
    else tween.current?.reverse();
  }, [replay, state]);

  return (
    <Tag ref={ref} className={`invisible ${className}`}>
      {children}
    </Tag>
  );
}

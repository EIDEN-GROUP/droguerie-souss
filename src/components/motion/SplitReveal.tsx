import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

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
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
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
          return gsap.from(by === "chars" ? self.chars : self.words, {
            yPercent: 110,
            duration: by === "chars" ? 0.8 : 1,
            ease: "power4.out",
            stagger: by === "chars" ? 0.022 : 0.07,
            delay,
            scrollTrigger:
              trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
          });
        },
      });
    },
    { scope: ref, dependencies: [active] },
  );

  return (
    <Tag ref={ref} className={`invisible ${className}`}>
      {children}
    </Tag>
  );
}

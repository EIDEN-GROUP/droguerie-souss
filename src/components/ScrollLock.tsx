import { useEffect } from "react";

const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);

/**
 * Fige la page tant qu'il est monte : ecran de chargement (`PageLoader`) ou intro video de
 * l'accueil.
 *
 * Le marqueur rendu retire le defilement et sa barre par CSS (`html:has([data-scroll-lock])`,
 * dans `styles.css`) : la regle vaut des le HTML envoye par le serveur, avant que React n'ait
 * demarre. Les ecouteurs retiennent ce que le CSS laisse passer : Lenis, qui defile par
 * script a partir de la molette (d'ou la capture, pour passer avant lui), et les navigateurs
 * sans `:has()`.
 *
 * `top` (intro video) : la page doit en plus rester en haut, la ou se joue l'intro. Le
 * routeur, qui guette ce marqueur (`router.tsx`), n'y retablit donc pas la position de
 * defilement, alors qu'il reste libre de le faire sous l'ecran de chargement, qui recouvre
 * tout.
 */
export function ScrollLock({ top = false }: { top?: boolean }) {
  useEffect(() => {
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const blockKeys = (e: KeyboardEvent) => SCROLL_KEYS.has(e.key) && e.preventDefault();
    const opts = { capture: true, passive: false } as const;
    window.addEventListener("wheel", block, opts);
    window.addEventListener("touchmove", block, opts);
    window.addEventListener("keydown", blockKeys, true);
    return () => {
      window.removeEventListener("wheel", block, opts);
      window.removeEventListener("touchmove", block, opts);
      window.removeEventListener("keydown", blockKeys, true);
    };
  }, []);

  return <span hidden data-scroll-lock={top ? "top" : ""} />;
}

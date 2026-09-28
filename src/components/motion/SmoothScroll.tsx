import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Defilement lisse (Lenis) pour la page qui le monte ; detruit en la quittant.
 *
 * Lenis est cadence par le ticker de GSAP et previent ScrollTrigger a chaque image, pour
 * que les animations declenchees au defilement suivent exactement la position lissee.
 * Rien n'est active si l'utilisateur demande a limiter les animations. Les zones qui
 * defilent elles-memes (panier, listes) gardent leur defilement natif, et Lenis se met en
 * pause quand une fenetre modale verrouille la page (`data-scroll-locked` sur le body).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, allowNestedScroll: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const syncLock = () =>
      document.body.hasAttribute("data-scroll-locked") ? lenis.stop() : lenis.start();
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}

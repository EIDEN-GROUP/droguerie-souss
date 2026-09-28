import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartSidebar } from "./CartSidebar";
import { FavoritesSidebar } from "./FavoritesSidebar";
import { AuthDialog } from "./AuthDialog";
import { ConsentBanner } from "./ConsentBanner";
import { PageLoader } from "./Loader";
import { FloatingActions } from "./FloatingActions";
import { IntroContext } from "./IntroContext";
import { useCustomerAuth } from "@/lib/customerAuth";

const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);

/** `overlayNav` : la page s'ouvre sur un bandeau sombre (premier enfant de `<main>`) qui
 *  passe sous l'en-tete ; celui-ci reste transparent tant qu'il le survole. Le bandeau doit
 *  reserver la hauteur de l'en-tete (h-20) dans son padding haut.
 *
 *  `videoIntro` (accueil) : pas d'ecran de chargement blanc - la video du hero en tient
 *  lieu. En-tete, boutons flottants et bandeau cookies attendent la fin de l'intro, et la
 *  page ne defile pas avant. */
export function Layout({
  children,
  overlayNav = false,
  videoIntro = false,
}: {
  children: ReactNode;
  overlayNav?: boolean;
  videoIntro?: boolean;
}) {
  // Restaure la session éventuelle (aucune fenêtre de connexion automatique).
  useEffect(() => {
    useCustomerAuth.getState().checkSession();
  }, []);

  const [introDone, setIntroDone] = useState(!videoIntro);
  const finish = useCallback(() => setIntroDone(true), []);
  const intro = useMemo(
    () => ({ active: videoIntro, done: introDone, finish }),
    [videoIntro, introDone, finish],
  );

  // Bloque le defilement pendant l'intro sans toucher a `overflow` : la barre de
  // defilement resterait masquee puis reapparaitrait, decalant toute la page. Les
  // ecouteurs en capture passent aussi avant Lenis.
  useEffect(() => {
    if (introDone) return;
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
  }, [introDone]);

  return (
    <IntroContext.Provider value={intro}>
      {!videoIntro && <PageLoader />}
      <Navbar overlay={overlayNav} hidden={!introDone} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
      <AuthDialog />
      {introDone && <FloatingActions />}
      {introDone && <ConsentBanner />}
    </IntroContext.Provider>
  );
}

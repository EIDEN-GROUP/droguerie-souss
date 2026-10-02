import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartSidebar } from "./CartSidebar";
import { FavoritesSidebar } from "./FavoritesSidebar";
import { AuthDialog } from "./AuthDialog";
import { ConsentBanner } from "./ConsentBanner";
import { PageLoader } from "./Loader";
import { FloatingActions } from "./FloatingActions";
import { SideActions } from "./SideActions";
import { IntroContext } from "./IntroContext";
import { useCustomerAuth } from "@/lib/customerAuth";

const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);

let siteEntered = false;

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

  const [playIntro] = useState(() => videoIntro && !siteEntered);
  useEffect(() => {
    siteEntered = true;
  }, []);

  const [introDone, setIntroDone] = useState(!playIntro);
  const finish = useCallback(() => setIntroDone(true), []);
  const intro = useMemo(
    () => ({ active: playIntro, done: introDone, finish }),
    [playIntro, introDone, finish],
  );

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
      {!playIntro && <PageLoader />}
      <Navbar overlay={overlayNav} hidden={!introDone} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
      <AuthDialog />
      {introDone && <SideActions />}
      {introDone && <FloatingActions />}
      {introDone && <ConsentBanner />}
    </IntroContext.Provider>
  );
}

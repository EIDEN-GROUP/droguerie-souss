import { useEffect, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartSidebar } from "./CartSidebar";
import { FavoritesSidebar } from "./FavoritesSidebar";
import { AuthDialog } from "./AuthDialog";
import { ConsentBanner } from "./ConsentBanner";
import { PageLoader } from "./Loader";
import { FloatingActions } from "./FloatingActions";
import { useCustomerAuth } from "@/lib/customerAuth";

/** `overlayNav` : la page s'ouvre sur un bandeau sombre (premier enfant de `<main>`) qui
 *  passe sous l'en-tete ; celui-ci reste transparent tant qu'il le survole. Le bandeau doit
 *  reserver la hauteur de l'en-tete (h-20) dans son padding haut. */
export function Layout({ children, overlayNav = false }: { children: ReactNode; overlayNav?: boolean }) {
  // Restaure la session éventuelle (aucune fenêtre de connexion automatique).
  useEffect(() => {
    useCustomerAuth.getState().checkSession();
  }, []);

  return (
    <>
      <PageLoader />
      <Navbar overlay={overlayNav} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
      <AuthDialog />
      <FloatingActions />
      <ConsentBanner />
    </>
  );
}

import { useEffect, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartSidebar } from "./CartSidebar";
import { FavoritesSidebar } from "./FavoritesSidebar";
import { AuthDialog } from "./AuthDialog";
import { PageLoader } from "./Loader";
import { FloatingActions } from "./FloatingActions";
import { useCustomerAuth } from "@/lib/customerAuth";

export function Layout({ children }: { children: ReactNode }) {
  // Restaure la session éventuelle (aucune fenêtre de connexion automatique).
  useEffect(() => {
    useCustomerAuth.getState().checkSession();
  }, []);

  return (
    <>
      <PageLoader />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
      <AuthDialog />
      <FloatingActions />
    </>
  );
}

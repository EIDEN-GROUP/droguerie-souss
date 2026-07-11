import { useEffect, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartSidebar } from "./CartSidebar";
import { FavoritesSidebar } from "./FavoritesSidebar";
import { AuthDialog } from "./AuthDialog";
import { PageLoader } from "./Loader";
import { useCustomerAuth } from "@/lib/customerAuth";

const AUTH_PROMPT_KEY = "ds-auth-prompted";

export function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    useCustomerAuth
      .getState()
      .checkSession()
      .then(() => {
        const { user, authOpen } = useCustomerAuth.getState();
        if (user || authOpen || localStorage.getItem(AUTH_PROMPT_KEY)) return;
        timer = setTimeout(() => {
          localStorage.setItem(AUTH_PROMPT_KEY, "1");
          useCustomerAuth.getState().setAuthOpen(true);
        }, 2500);
      });
    return () => clearTimeout(timer);
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
    </>
  );
}

import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartSidebar } from "./CartSidebar";
import { FavoritesSidebar } from "./FavoritesSidebar";
import { PageLoader } from "./Loader";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageLoader />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartSidebar />
      <FavoritesSidebar />
    </>
  );
}

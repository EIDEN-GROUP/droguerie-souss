import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronRight, Heart, Menu, Phone, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/store";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { cart, favorites, setCartOpen, setFavOpen } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 20));
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      {/* Top strip */}
      <div className="hidden bg-ink text-paper md:block">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <span>Livraison rapide dans tout le Souss • Devis gratuit sous 24h</span>
          <div className="flex items-center gap-4">
            <a href="tel:+212528000000" className="flex items-center gap-1.5 hover:text-sky">
              <Phone className="h-3 w-3" /> +212 528 000 000
            </a>
            <a href="mailto:contact@drogueriesouss.ma" className="hover:text-sky">
              contact@drogueriesouss.ma
            </a>
          </div>
        </div>
      </div>

      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`sticky top-0 z-40 w-full border-b transition-all ${
          scrolled ? "bg-paper/95 shadow-sm backdrop-blur" : "bg-paper"
        }`}
      >
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="h-11 w-11">
              <img src="/src/assets/logo.png" alt="Droguerie Souss Logo" className="h-full w-full object-cover" />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="font-display text-lg font-bold tracking-wide">
                DROGUERIE SOUSS
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                S.A.R.L • Matériaux de construction
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="relative px-4 py-2 text-sm font-semibold uppercase tracking-wider text-ink transition hover:text-brand"
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-accent-red"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <a
              href="tel:+212528000000"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-brand-foreground"
            >
              <Phone className="h-4 w-4" /> +212 528 000 000
            </a>

            <button
              onClick={() => setFavOpen(true)}
              aria-label="Favoris"
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-mint"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-paper">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Panier"
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-mint"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-paper">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="grid h-10 w-10 place-items-center rounded-full text-ink lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col bg-paper shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand text-brand-foreground font-display text-lg font-bold">
                    DS
                  </div>
                  <div className="leading-tight">
                    <div className="font-display text-sm font-bold tracking-wide">
                      DROGUERIE SOUSS
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-ink-soft">
                      S.A.R.L
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-mint"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {links.map((l) => {
                  const active = pathname === l.to;
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wider transition ${
                        active ? "bg-brand text-brand-foreground" : "text-ink hover:bg-mint"
                      }`}
                    >
                      {l.label}
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-3 border-t p-4">
                <a
                  href="tel:+212528000000"
                  className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground"
                >
                  <Phone className="h-4 w-4" /> +212 528 000 000
                </a>
                <p className="text-center text-[11px] text-ink-soft">
                  Livraison rapide dans tout le Souss • Devis gratuit sous 24h
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

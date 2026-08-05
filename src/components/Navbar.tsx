import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronRight, Heart, Menu, Phone, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useCustomerAuth } from "@/lib/customerAuth";
import { CategoryCardBody } from "@/components/CategoriesSection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { categories } from "@/lib/products";
import logo from "@/assets/logo.png";
import logoMobile from "@/assets/icon-blue.png";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/categories", label: "Catégories" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/contact", label: "Contactez-nous" },
];

/** Delai avant fermeture : le curseur passe par un interstice entre le lien et le panneau,
 *  fermer sur-le-champ rendrait le menu impossible a atteindre. */
const MEGA_CLOSE_DELAY = 120;

/** Le carrousel des categories, partage par le panneau de survol (bureau) et le tiroir
 *  (tablette et mobile) : memes cartes, seules la largeur des vignettes et la place des
 *  fleches changent. Dans le tiroir elles passent en en-tete, faute de marge laterale. */
function CategoryCarousel({
  variant,
  onSelect,
}: {
  variant: "mega" | "drawer";
  onSelect: () => void;
}) {
  const isDrawer = variant === "drawer";
  return (
    <Carousel opts={{ align: "start", loop: true }} className={isDrawer ? undefined : "mx-12"}>
      {isDrawer && (
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            Nos rayons
          </span>
          <div className="flex items-center gap-1.5">
            <CarouselPrevious className="static h-7 w-7 translate-y-0" />
            <CarouselNext className="static h-7 w-7 translate-y-0" />
          </div>
        </div>
      )}
      <CarouselContent className="-ml-3">
        {categories.map((c) => (
          <CarouselItem
            key={c.slug}
            className={isDrawer ? "basis-1/2 pl-3" : "basis-1/4 pl-3 xl:basis-1/5"}
          >
            <Link
              to="/categories"
              search={{ cat: c.category }}
              onClick={onSelect}
              className="group relative block aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]"
            >
              <CategoryCardBody name={c.name} image={c.image} compact />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {!isDrawer && (
        <>
          <CarouselPrevious className="-left-12 h-9 w-9" />
          <CarouselNext className="-right-12 h-9 w-9" />
        </>
      )}
    </Carousel>
  );
}

export function Navbar() {
  const { cart, favorites, setCartOpen, setFavOpen } = useApp();
  const { user, setAuthOpen } = useCustomerAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 20));
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), MEGA_CLOSE_DELAY);
  };

  /** Le panneau se referme au changement de page et sur Echap. */
  useEffect(() => setMega(false), [pathname]);
  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mega]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <>
      {/* Top strip */}
      <div className="hidden bg-ink text-paper md:block">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <span>Livraison rapide dans tout le Souss • Devis gratuit sous 48h</span>
          <div className="flex items-center gap-4">
            <a href="tel:+212528838992" className="flex items-center gap-1.5 hover:text-sky">
              <Phone className="h-3 w-3" /> +212 528 838 992
            </a>
            <a href="mailto:contact@soussdroguerie.com" className="hover:text-sky">
              contact@soussdroguerie.com
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
            <div className="h-16 w-auto">
              <img
                src={logo}
                alt="Souss Droguerie Logo"
                className="max-h-16 w-auto object-contain"
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.to;
              const hasMega = l.to === "/categories";
              return (
                <div
                  key={l.to}
                  className="relative"
                  onMouseEnter={hasMega ? openMega : undefined}
                  onMouseLeave={hasMega ? closeMega : undefined}
                >
                  <Link
                    to={l.to}
                    onFocus={hasMega ? openMega : undefined}
                    aria-expanded={hasMega ? mega : undefined}
                    className="relative block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink transition hover:text-brand"
                  >
                    {l.label}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-accent-red"
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <a
              href="tel:+212528838992"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-brand-foreground"
            >
              <Phone className="h-4 w-4" /> +212 528 838 992
            </a>

            {user ? (
              <Link
                to="/compte"
                aria-label="Mon compte"
                className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-mint"
              >
                <UserRound className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500" />
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                aria-label="Se connecter"
                className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-mint"
              >
                <UserRound className="h-5 w-5" />
              </button>
            )}

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

        {/* Panneau des categories, deroule sous la barre au survol du lien. Il est rendu
            dans l'en-tete pour rester colle a son bord bas quel que soit le defilement,
            et reste ouvert tant que le curseur est dessus. */}
        {mega && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
            className="absolute inset-x-0 top-full hidden border-b bg-paper shadow-[var(--shadow-elevated)] lg:block"
          >
            <div className="container-x py-6">
              <CategoryCarousel variant="mega" onSelect={() => setMega(false)} />
            </div>
          </motion.div>
        )}
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
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col bg-paper shadow-2xl sm:max-w-sm lg:hidden"
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10">
                    <img
                      src={logoMobile}
                      alt="Souss Droguerie Logo"
                      className="max-h-10 w-auto object-contain"
                    />
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

              <div className="styled-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto p-4">
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

                {/* Les memes cartes que le panneau de survol : sans survol, le carrousel
                    est le seul moyen de parcourir les rayons depuis le tiroir. */}
                <div className="mt-4 border-t pt-4">
                  <CategoryCarousel variant="drawer" onSelect={() => setOpen(false)} />
                </div>
              </div>

              <div className="space-y-3 border-t p-4">
                {user ? (
                  <Link
                    to="/compte"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand"
                  >
                    <UserRound className="h-4 w-4" /> Mon compte
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false);
                      setAuthOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand"
                  >
                    <UserRound className="h-4 w-4" /> Se connecter
                  </button>
                )}
                <a
                  href="tel:+212528838992"
                  className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground"
                >
                  <Phone className="h-4 w-4" /> +212 528 838 992
                </a>
                <p className="text-center text-[11px] text-ink-soft">
                  Livraison rapide dans tout le Souss • Devis gratuit sous 48h
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

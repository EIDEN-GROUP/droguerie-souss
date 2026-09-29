import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
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

/** `hidden` : barre tenue au-dessus de l'ecran pendant l'intro video de l'accueil ; elle
 *  descend a sa place quand l'intro se termine. */
export function Navbar({ overlay = false, hidden = false }: { overlay?: boolean; hidden?: boolean }) {
  const { cart, favorites, setCartOpen, setFavOpen } = useApp();
  const { user, setAuthOpen } = useCustomerAuth();
  const [open, setOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  /** L'en-tete survole le bandeau sombre (premier enfant de `<main>`) tant que le bas de
   *  celui-ci depasse sous la barre : la marge haute negative de l'observateur retire la
   *  hauteur de la barre (h-20). Couvre aussi le rechargement d'une page deja defilee. */
  useEffect(() => {
    const hero = overlay ? document.querySelector("main")?.firstElementChild : null;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), {
      rootMargin: "-80px 0px 0px 0px",
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [overlay, pathname]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  /** Transparent (texte blanc) tant que l'en-tete survole le bandeau sombre de la page,
   *  panneau des categories ouvert ou non ; blanc des qu'il passe sur le corps de la page. */
  const transparent = overlay && overHero;
  const iconBtn = `grid h-10 w-10 place-items-center rounded-full transition ${
    transparent ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-mint"
  }`;

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
      {/* <div className="relative z-40 hidden bg-ink text-paper md:block">
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
      </div> */}

      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: hidden ? "-100%" : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        // `-mb-20` (hauteur de la barre) fait remonter la page sous l'en-tete.
        className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
          overlay ? "-mb-20" : ""
        } ${transparent ? "bg-transparent" : "bg-background"}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 left-1/2 h-px w-4/5 -translate-x-1/2 transition-colors duration-300 ${
            transparent ? "bg-paper/20" : "bg-border w-full"
          }`}
        />
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="h-16 w-auto">
              {/* Logo monochrome sur fond transparent : le filtre le passe en blanc. */}
              <img
                src={logo}
                alt="Souss Droguerie, droguerie à Agadir"
                className={`max-h-16 w-auto object-contain transition duration-300 ${
                  transparent ? "brightness-0 invert" : ""
                }`}
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
                    className={`relative block whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wider transition xl:px-4 ${
                      transparent ? "text-paper hover:text-paper/70" : "text-ink hover:text-brand"
                    }`}
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
            {/* Entre `lg` et `xl`, les liens occupent la barre : le numero se replie sur
                son pictogramme. */}
            <a
              href="tel:+212528838992"
              aria-label="Appeler le +212 528 838 992"
              className={`hidden md:inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition lg:px-2.5 xl:px-3.5 ${
                transparent
                  ? "border-paper/30 bg-paper/10 text-paper hover:bg-paper hover:text-ink"
                  : "border-brand/20 bg-brand/5 text-brand hover:bg-brand hover:text-brand-foreground"
              }`}
            >
              <Phone className="h-4 w-4" />
              <span className="lg:hidden xl:inline">+212 528 838 992</span>
            </a>

            {user ? (
              <Link to="/compte" aria-label="Mon compte" className={`relative ${iconBtn}`}>
                <UserRound className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500" />
              </Link>
            ) : (
              <button onClick={() => setAuthOpen(true)} aria-label="Se connecter" className={iconBtn}>
                <UserRound className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setFavOpen(true)}
              aria-label="Favoris"
              className={`relative ${iconBtn}`}
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
              className={`relative ${iconBtn}`}
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
              className={`${iconBtn} lg:hidden`}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Panneau des categories, deroule sous la barre au survol du lien. Il est rendu
            dans l'en-tete pour rester colle a son bord bas quel que soit le defilement,
            et reste ouvert tant que le curseur est dessus. */}
        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
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
        </AnimatePresence>
      </motion.header>

      {/* Voile sombre : la page passe au second plan derriere le panneau des categories.
          `z-30` le place sous l'en-tete (z-40), donc sous le panneau lui-meme, et
          `pointer-events-none` lui interdit d'intercepter le curseur - c'est le survol du
          lien qui commande l'ouverture, le voile n'est que decor. */}
      <AnimatePresence>
        {mega && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-30 hidden bg-ink/50 lg:block"
          />
        )}
      </AnimatePresence>

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
                      alt="Souss Droguerie, droguerie à Agadir"
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

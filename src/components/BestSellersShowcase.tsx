import { Link } from "@tanstack/react-router";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { useApp } from "@/lib/store";

const AUTOPLAY_MS = 5000;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** Cartes rendues de part et d'autre de la carte active. Au-dela de ±1 elles sont
 *  transparentes : elles n'existent que pour arriver (ou partir) en glissant. */
const WINDOW = 3;

/**
 * Position horizontale du centre d'une carte, relativement au centre de la vitrine, pour
 * un ecart `o` a la carte active (0 = active, 1 = voisine de droite, -1 = de gauche...).
 * Tailles portees par les variables CSS : `--a` active, `--s` laterale, `--g` ecart.
 */
function centerFor(o: number) {
  if (o === 0) return "0px";
  const side = `(var(--a) / 2 + var(--g) + var(--s) / 2 + ${Math.abs(o) - 1} * (var(--s) + var(--g)))`;
  return o > 0 ? side : `(-1 * ${side})`;
}

/**
 * Vitrine des best-sellers : cartes serrees, la carte active au centre et plus large que
 * ses voisines, estompees ; defilement sans fin dans les deux sens.
 *
 * Boucle infinie : `pos` est un compteur non borne et chaque carte est rendue pour une
 * position (`pos - 3` a `pos + 3`), le produit etant `pos modulo nombre`. Quand `pos`
 * avance, chaque carte garde sa cle, voit son ecart diminuer de 1 et glisse d'un cran ;
 * apres la derniere revient donc la premiere, par la droite, sans rembobinage.
 *
 * Tailles en `cqw` (largeur de la vitrine) par palier ; position et largeur transitionnent
 * ensemble, avec la meme courbe. Mobile : la carte active prend presque tout, les voisines
 * ne sont plus que deux liserés.
 */
export function BestSellersShowcase({ products }: { products: Product[] }) {
  const { addToCart } = useApp();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.4 });
  const [pos, setPos] = useState(0);
  const [paused, setPaused] = useState(false);
  const panned = useRef(false);
  const count = products.length;

  const indexOf = useCallback((p: number) => ((p % count) + count) % count, [count]);
  // Mises a jour fonctionnelles : des clics rapproches s'additionnent.
  const next = useCallback(() => setPos((p) => p + 1), []);
  const prev = useCallback(() => setPos((p) => p - 1), []);

  // Defilement automatique tant que la vitrine est a l'ecran, hors survol ou focus.
  useEffect(() => {
    if (reduce || paused || !inView || count < 2) return;
    const t = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [reduce, paused, inView, count, next, pos]);

  if (count === 0) return null;

  /** Un glisser se termine par un clic sur la carte relachee : on l'ignore. */
  const swallowClickAfterPan = (e: React.MouseEvent) => {
    if (!panned.current) return false;
    e.preventDefault();
    panned.current = false;
    return true;
  };

  const offsets = count > 1 ? Array.from({ length: WINDOW * 2 + 1 }, (_, k) => k - WINDOW) : [0];

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Marges verticales et laterales : l'ombre des cartes n'est pas rognee. */}
      <motion.div
        // Glisser au doigt (ou a la souris) pour changer de carte ; le defilement vertical
        // de la page reste libre.
        onPointerDownCapture={() => (panned.current = false)}
        onPanStart={() => (panned.current = true)}
        onPanEnd={(_, info) => {
          if (info.offset.x < -50) next();
          else if (info.offset.x > 50) prev();
        }}
        className="@container relative h-[calc(var(--h)+4rem)] touch-pan-y overflow-hidden [--a:76cqw] [--g:3cqw] [--h:min(105cqw,30rem)] [--s:5cqw] sm:[--a:62cqw] sm:[--g:2cqw] sm:[--h:min(72cqw,32rem)] sm:[--s:15cqw] lg:[--a:48cqw] lg:[--g:1.5cqw] lg:[--h:min(40cqw,36rem)] lg:[--s:22.5cqw]"
      >
        {offsets.map((o) => {
          const key = pos + o;
          const p = products[indexOf(key)];
          const isActive = o === 0;
          const width = isActive ? "var(--a)" : "var(--s)";
          return (
            <div
              key={key}
              // Carte laterale : un clic l'amene au centre (les fleches font de meme au
              // clavier). La carte active est couverte par le lien vers sa fiche.
              onClick={(e) => {
                if (!swallowClickAfterPan(e) && !isActive) setPos((cur) => cur + o);
              }}
              aria-hidden={isActive ? undefined : true}
              style={{
                width,
                transform: `translateX(calc(${centerFor(o)} - ${width} / 2))`,
                opacity: Math.abs(o) <= 1 ? 1 : 0,
                zIndex: 10 - Math.abs(o),
              }}
              className={`group absolute left-1/2 top-8 h-[var(--h)] overflow-hidden rounded-2xl bg-cream shadow-[0_14px_34px_-10px_rgba(20,23,63,0.35)] transition-[transform,width,opacity] duration-700 ${EASE} ${
                isActive ? "" : Math.abs(o) === 1 ? "cursor-pointer" : "pointer-events-none"
              }`}
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                draggable={false}
                className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-700 ${EASE} ${
                  isActive ? "scale-100 group-hover:scale-105" : "scale-110 grayscale-[40%]"
                }`}
              />
              {/* Voisines a peine estompees ; la carte active garde un voile leger en pied,
                  juste pour le texte. */}
              <div
                className={`absolute inset-0 bg-paper/20 transition-opacity duration-700 ${isActive ? "opacity-0" : "opacity-100"}`}
              />
              <div
                className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/15 to-transparent transition-opacity duration-700 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              {isActive && (
                <Link
                  to="/product/$id"
                  params={{ id: p.id }}
                  onClick={(e) => swallowClickAfterPan(e)}
                  draggable={false}
                  aria-label={`${p.name} - voir le produit`}
                  className="absolute inset-0 z-[1]"
                />
              )}

              {/* Texte de la carte active : il monte une fois la carte ouverte, et
                  s'efface aussitot qu'elle se referme. Il laisse passer les clics vers
                  le lien, sauf sur le bouton panier. */}
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-4 p-5 text-paper transition-[opacity,transform] sm:p-7 ${
                  isActive
                    ? "translate-y-0 opacity-100 delay-300 duration-700"
                    : "translate-y-6 opacity-0 delay-0 duration-200"
                }`}
              >
                <div className="min-w-0">
                  <span className="text-shadow-overlay text-[10px] font-semibold uppercase tracking-[0.25em] text-paper/85">
                    {p.category}
                  </span>
                  {/* Filet rouge sous le nom : il s'etire quand la carte devient active. */}
                  <div
                    className={`after:mt-3 after:block after:h-1 after:rounded-full after:bg-accent-red after:transition-[width] after:duration-700 after:ease-out ${
                      isActive ? "after:w-12 after:delay-500" : "after:w-0"
                    }`}
                  >
                    <h3 className="text-shadow-overlay mt-2 line-clamp-2 font-display text-2xl font-medium leading-tight sm:text-3xl">
                      {p.name}
                    </h3>
                  </div>
                  {p.description && (
                    <p className="text-shadow-overlay mt-3 line-clamp-2 max-w-md text-sm leading-snug text-paper/90">
                      {p.description}
                    </p>
                  )}
                  <span className="text-shadow-overlay mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    Voir le produit
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
                <button
                  type="button"
                  tabIndex={isActive ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(p);
                  }}
                  aria-label={`Ajouter ${p.name} au panier`}
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper text-ink shadow-lg transition hover:scale-105 hover:bg-accent-red hover:text-paper ${
                    isActive ? "pointer-events-auto" : ""
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </motion.div>

      {count > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Best-seller précédent"
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-ink/5 text-ink transition hover:scale-105 hover:bg-ink hover:text-paper"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="min-w-14 text-center text-xs font-semibold tabular-nums tracking-widest text-ink-soft">
            {String(indexOf(pos) + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Best-seller suivant"
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-ink/5 text-ink transition hover:scale-105 hover:bg-ink hover:text-paper"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

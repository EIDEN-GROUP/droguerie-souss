import { Link } from "@tanstack/react-router";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ABOUT } from "@/lib/about";
import { BUSINESS } from "@/lib/contact";
import type { Product } from "@/lib/products";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion/Reveal";
import { fromTo, rise, wipe } from "./motion/reveals";
import { SectionHeader } from "./SectionHeader";

const wrap = (i: number, n: number) => ((i % n) + n) % n;
const pad = (n: number) => String(n).padStart(2, "0");

const arrow =
  "grid h-11 w-11 place-items-center rounded-full transition duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red lg:h-12 lg:w-12";

/** Une piste par cadre : la position (non bornee) de la file de produits dans ce cadre.
 *  Entiere au repos ; entre deux entiers, une photo sort pendant que la suivante entre. */
function useTracks() {
  const big = useMotionValue(0);
  const medium = useMotionValue(0);
  const small = useMotionValue(0);
  return useMemo(() => [big, medium, small], [big, medium, small]);
}

type Gesture = {
  onPointerDownCapture: () => void;
  onClickCapture: (e: React.MouseEvent) => void;
  onPanStart: () => void;
  onPan: (e: PointerEvent, info: PanInfo) => void;
  onPanEnd: (e: PointerEvent, info: PanInfo) => void;
};

/**
 * Vitrine des best-sellers : trois cadres fixes alignes par le bas - un grand, un moyen, un
 * petit - et, au-dessus des deux derniers, un texte et les fleches.
 *
 * Les cadres ne bougent jamais et gardent leur taille : ce sont les photos qui defilent
 * dedans. A chaque pas, chaque photo quitte son cadre par un bord pendant que la suivante y
 * entre par l'autre, et prend la mesure du cadre ou elle arrive ; le produit du cadre moyen
 * passe ainsi dans le grand, celui du petit dans le moyen. La file boucle sans fin.
 *
 * Fleches, clavier (fleches gauche / droite) ou glisser : au doigt comme a la souris, les
 * photos suivent le geste, puis se calent sur le produit le plus proche.
 */
export function BestSellersShowcase({
  products,
  loading = false,
}: {
  products: Product[];
  loading?: boolean;
}) {
  const reduce = useReducedMotion();
  const tracks = useTracks();
  const stageRef = useRef<HTMLDivElement>(null);
  // Les photos voisines (hors cadre, pretes a entrer) ne sont montees qu'a l'approche de la
  // vitrine : rien n'est telecharge d'avance en haut de page.
  const armed = useInView(stageRef, { margin: "50% 0px", once: true });
  const preloaded = useRef(new Set<string>());
  /** Position de repos visee : des clics rapproches s'additionnent. */
  const rest = useRef(0);
  const origins = useRef([0, 0, 0]);
  const step = useRef(1);
  const panned = useRef(false);
  const count = products.length;

  useEffect(() => () => tracks.forEach((track) => track.stop()), [tracks]);

  // Au meme moment, les photos des autres produits sont mises en cache : apres plusieurs pas
  // d'affilee, un produit encore jamais affiche arrive deja charge.
  useEffect(() => {
    if (!armed) return;
    for (const { image } of products) {
      if (!image || preloaded.current.has(image)) continue;
      preloaded.current.add(image);
      new Image().src = image;
    }
  }, [armed, products]);

  /** Amene les trois pistes a `to`. Avec un sens (`dir`), le cadre vers lequel vont les
   *  photos arrive le premier et les autres suivent ; sans (fin d'un glisser), ensemble. */
  const settle = useCallback(
    (to: number, dir = 0) => {
      rest.current = to;
      tracks.forEach((track, i) => {
        if (reduce) return track.jump(to);
        const rank = dir < 0 ? tracks.length - 1 - i : i;
        animate(track, to, {
          type: "spring",
          bounce: 0,
          visualDuration: dir ? 0.65 + rank * 0.12 : 0.5,
        });
      });
    },
    [tracks, reduce],
  );

  const go = useCallback((dir: 1 | -1) => settle(rest.current + dir, dir), [settle]);

  const gesture = useMemo<Gesture>(
    () => ({
      onPointerDownCapture: () => {
        panned.current = false;
      },
      // Un glisser se termine par un clic sur le cadre relache : il est ignore.
      onClickCapture: (e) => {
        if (!panned.current) return;
        panned.current = false;
        e.preventDefault();
        e.stopPropagation();
      },
      onPanStart: () => {
        panned.current = true;
        // Un pas = la largeur du grand cadre : sa photo suit le doigt a l'identique.
        step.current =
          stageRef.current?.querySelector<HTMLElement>("[data-frame]")?.offsetWidth || 1;
        tracks.forEach((track, i) => {
          track.stop();
          origins.current[i] = track.get();
        });
      },
      onPan: (_, info) => {
        const shift = -info.offset.x / step.current;
        tracks.forEach((track, i) => track.set(origins.current[i] + shift));
      },
      onPanEnd: (_, info) => {
        // Un cinquieme de cadre parcouru, ou un geste vif, suffit a passer au produit
        // voisin. En dessous de 12 px, c'est un appui qui a tremble : rien ne change.
        const flick = Math.max(-0.6, Math.min(0.6, (-info.velocity.x / step.current) * 0.18));
        const intent = Math.abs(info.offset.x) < 12 ? 0 : Math.sign(-info.offset.x) * 0.3 + flick;
        settle(Math.round(tracks[0].get() + intent));
        window.setTimeout(() => {
          panned.current = false;
        }, 0);
      },
    }),
    [tracks, settle],
  );

  if (!loading && count === 0) return null;

  // Un seul produit : rien a faire defiler, le cadre reste un simple lien.
  const frame = { products, armed, gesture: count > 1 ? gesture : undefined };

  return (
    <section className="overflow-hidden bg-paper py-20 md:py-24">
      <div className="container-x grid gap-y-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-x-6 md:gap-y-12">
        <SectionHeader
          kicker="Best-sellers"
          title="Nos produits populaires"
          align="left"
          animated
        />

        {/* Sous la vitrine sur mobile, a droite du titre ensuite. */}
        <Reveal
          variants={rise({ y: 12, delay: 0.3, duration: 0.6 })}
          className="row-start-3 justify-self-center sm:col-start-2 sm:row-start-1 sm:justify-self-end"
        >
          <Link
            to="/categories"
            search={{ bestseller: true }}
            hash="produits"
            hashScrollIntoView={{ behavior: "instant", block: "start" }}
            className="group inline-flex items-center gap-4 rounded-full border border-ink/15 bg-paper py-1.5 pl-6 pr-1.5 text-xs font-bold uppercase tracking-wider text-ink transition duration-300 hover:border-brand-night hover:bg-brand-night hover:text-paper"
          >
            Voir tous
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-night text-paper transition duration-300 group-hover:rotate-45 group-hover:bg-accent-red">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </Reveal>

        <Reveal margin="-18%" className="@container row-start-2 sm:col-span-2">
          {/* Tailles en `cqw` (largeur de la vitrine), d'apres `--h`, la hauteur du grand
              cadre. Des `md`, trois colonnes ; avant, le grand cadre sur toute la largeur,
              puis le moyen et le petit cote a cote. */}
          <div
            ref={stageRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Best-sellers"
            onKeyDown={(e) => {
              if (count < 2) return;
              if (e.key === "ArrowRight") go(1);
              else if (e.key === "ArrowLeft") go(-1);
            }}
            className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 [--h:min(108cqw,27rem)] md:grid-cols-[minmax(0,127fr)_minmax(0,155fr)_minmax(0,103fr)] md:grid-rows-[auto_1fr] md:gap-x-[1.875cqw] md:gap-y-0 md:[--h:clamp(22rem,48.25cqw,min(42rem,66svh))]"
          >
            <div className="col-span-2 pb-3 md:col-start-2 md:row-start-1 md:pb-8 lg:pl-[7cqw]">
              <motion.p
                variants={rise({ y: 12, delay: 0.1, duration: 0.6 })}
                className="text-xs font-bold uppercase tracking-[0.2em] text-accent-red"
              >
                Depuis {BUSINESS.sinceYear}
              </motion.p>
              <motion.p
                variants={rise({ y: 16, delay: 0.2, duration: 0.7 })}
                className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft xl:text-[15px] xl:leading-relaxed"
              >
                {ABOUT.story.paragraphs[1]}
              </motion.p>
            </div>

            {/* Le grand cadre s'etire sur les deux rangees : son pied s'aligne sur celui
                des deux autres. */}
            <Frame
              {...frame}
              track={tracks[0]}
              slot={0}
              featured
              className="col-span-2 h-(--h) md:col-span-1 md:col-start-1 md:row-span-2 md:row-start-1 md:h-auto md:min-h-(--h)"
            />

            {(loading || count > 1) && (
              <Frame
                {...frame}
                track={tracks[1]}
                slot={1}
                delay={0.12}
                className="h-[calc(var(--h)*0.6)] self-end md:col-start-2 md:row-start-2 md:h-[calc(var(--h)*0.751)]"
              />
            )}

            <div className="flex flex-col self-end md:col-start-3 md:row-start-2">
              {count > 1 && (
                <motion.div
                  variants={rise({ y: 12, delay: 0.45, duration: 0.6 })}
                  className="mb-4 flex justify-center gap-2 lg:mb-6"
                >
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Best-seller précédent"
                    className={cn(arrow, "bg-cream text-ink-soft hover:bg-mint hover:text-ink")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Best-seller suivant"
                    className={cn(arrow, "bg-accent-red text-paper hover:bg-accent-red/85")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
              {(loading || count > 2) && (
                <Frame
                  {...frame}
                  track={tracks[2]}
                  slot={2}
                  delay={0.24}
                  className="h-[calc(var(--h)*0.4)] md:h-[calc(var(--h)*0.466)]"
                />
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Un cadre fixe : il montre le produit de rang `position de la piste + slot`.
 *
 * Trois vues sont montees, celle au repos et ses deux voisines, chacune decalee d'une
 * largeur de cadre ; la piste les fait glisser. Quand elle passe a mi-chemin du produit
 * suivant, la fenetre avance d'un cran : la vue qui vient de sortir est demontee, la
 * prochaine montee hors cadre. Le libelle et le compteur roulent sur la meme piste.
 */
function Frame({
  products,
  track,
  slot,
  armed,
  gesture,
  featured = false,
  delay = 0,
  className,
}: {
  products: Product[];
  track: MotionValue<number>;
  /** Rang du cadre : 0 le grand, 1 le moyen, 2 le petit. */
  slot: number;
  armed: boolean;
  gesture?: Gesture;
  /** Le grand cadre : il porte en plus le compteur. */
  featured?: boolean;
  delay?: number;
  className?: string;
}) {
  const { addToCart } = useApp();
  const count = products.length;
  const settled = useRef(Math.round(track.get()));
  const [anchor, setAnchor] = useState(settled.current);

  useMotionValueEvent(track, "change", (v) => {
    const next = Math.round(v);
    if (next === settled.current) return;
    settled.current = next;
    setAnchor(next);
  });

  const here = anchor + slot;
  const views = armed && count > 1 ? [here - 1, here, here + 1] : [here];
  const current = count > 0 ? products[wrap(here, count)] : null;

  return (
    <motion.div
      data-frame
      variants={wipe("bottom", { delay, duration: 1.1 })}
      {...gesture}
      className={cn(
        "@container group relative isolate touch-pan-y select-none overflow-hidden rounded-2xl bg-cream md:rounded-3xl",
        className,
      )}
    >
      {!current ? (
        <div className="absolute inset-0 animate-pulse bg-mint/50" />
      ) : (
        <>
          {/* `--pt` et `--pb` : la place du compteur et du libelle, que la photo evite. */}
          <motion.div
            variants={fromTo({ scale: 1.12 }, { scale: 1 }, { delay, duration: 1.5 })}
            className={cn(
              "absolute inset-0 [--pb:3rem] [--pt:0.5rem] @[10rem]:[--pb:3.75rem] @[15rem]:[--pb:5rem] @[15rem]:[--pt:1rem] @[22rem]:[--pb:5.75rem]",
              featured && "[--pt:4.25rem] @[15rem]:[--pt:5.5rem]",
            )}
          >
            {views.map((k) => (
              <Slide
                key={k}
                track={track}
                at={k - slot}
                product={products[wrap(k, count)]}
                current={k === here}
                eager={armed}
              />
            ))}
          </motion.div>

          <Link
            to="/product/$id"
            params={{ id: current.id }}
            draggable={false}
            aria-label={`${current.name} - voir le produit`}
            className="absolute inset-0 z-[1] rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand"
          />

          {featured && (
            <motion.div
              variants={rise({ y: -12, delay: delay + 0.55, duration: 0.7 })}
              className="pointer-events-none absolute left-4 top-4 z-[2] @[15rem]:left-6 @[15rem]:top-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                Best-seller
              </p>
              <p className="mt-1 flex font-display text-xl leading-tight tabular-nums text-ink @[15rem]:text-2xl">
                <span className="grid overflow-hidden">
                  {views.map((k) => (
                    <Rolling
                      as="span"
                      key={k}
                      track={track}
                      at={k - slot}
                      current={k === here}
                      className="col-start-1 row-start-1"
                    >
                      {pad(wrap(k, count) + 1)}
                    </Rolling>
                  ))}
                </span>
                <span className="mx-1.5 text-ink-soft">/</span>
                <span className="text-ink-soft">{pad(count)}</span>
              </p>
              <span className="sr-only" aria-live="polite">
                {current.name}
              </span>
            </motion.div>
          )}

          {/* Le libelle laisse passer les clics vers le lien, sauf sur le bouton panier. */}
          <motion.div
            variants={rise({ y: 18, delay: delay + 0.5, duration: 0.7 })}
            className="pointer-events-none absolute inset-x-2 bottom-2 z-[2] flex items-center gap-2 rounded-xl bg-brand-night/85 py-2 pl-3 pr-2 text-paper backdrop-blur-md @[15rem]:inset-x-3 @[15rem]:bottom-3 @[15rem]:gap-3 @[15rem]:rounded-2xl @[15rem]:py-2.5 @[15rem]:pl-5 @[15rem]:pr-2.5 @[22rem]:py-3 @[22rem]:pl-6 @[22rem]:pr-3"
          >
            <div className="grid min-w-0 flex-1 overflow-hidden">
              {views.map((k) => {
                const p = products[wrap(k, count)];
                return (
                  <Rolling
                    key={k}
                    track={track}
                    at={k - slot}
                    current={k === here}
                    className="col-start-1 row-start-1 min-w-0"
                  >
                    <h3 className="truncate font-sans text-[13px] font-semibold leading-snug tracking-normal @[15rem]:text-[15px] @[22rem]:text-lg @[22rem]:leading-snug">
                      {p.name}
                    </h3>
                    <p className="mt-0.5 hidden truncate text-[11px] text-paper/65 @[10rem]:block @[22rem]:text-[13px]">
                      {p.subcategory || p.category} <span aria-hidden="true">•</span> Sur devis
                    </p>
                  </Rolling>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => addToCart(current)}
              aria-label={`Ajouter ${current.name} au panier`}
              className="pointer-events-auto hidden h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full bg-paper text-ink transition duration-300 hover:scale-105 hover:bg-accent-red hover:text-paper @[10rem]:grid @[15rem]:h-10 @[15rem]:w-10 @[22rem]:h-12 @[22rem]:w-12"
            >
              <ShoppingBag className="h-4 w-4 @[22rem]:h-[18px] @[22rem]:w-[18px]" />
            </button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/** Une photo dans un cadre, centree quand la piste vaut `at`. Elle glisse d'une largeur de
 *  cadre par produit, et recule un peu a mesure qu'elle s'eloigne du centre. */
function Slide({
  track,
  at,
  product,
  current,
  eager,
}: {
  track: MotionValue<number>;
  at: number;
  product: Product;
  current: boolean;
  eager: boolean;
}) {
  const x = useTransform(track, (p) => `${(at - p) * 100}%`);
  const scale = useTransform(track, (p) => 1 - Math.min(1, Math.abs(at - p)) * 0.14);

  return (
    <motion.div
      style={{ x }}
      aria-hidden={current ? undefined : true}
      className="absolute inset-0 bg-cream"
    >
      {/* Photos de produit sur fond clair, jamais tout a fait blanc : en `multiply`, le fond
          prend la teinte du cadre, et le fondu des bords efface ce qu'il reste du
          rectangle de la photo. Elle est montree entiere, a la mesure du cadre. */}
      {product.image && (
        <div className="absolute inset-x-[6%] bottom-(--pb) top-(--pt) flex items-center justify-center mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] can-hover:group-hover:scale-105 motion-reduce:transition-none">
          <motion.img
            src={product.image}
            alt={current ? product.name : ""}
            loading={eager ? undefined : "lazy"}
            draggable={false}
            style={{ scale }}
            className="max-h-full max-w-full mask-x-from-92% mask-y-from-92%"
          />
        </div>
      )}
    </motion.div>
  );
}

/** Texte qui roule derriere un masque, sur la meme piste que les photos : il monte et
 *  s'efface en sortant, le suivant arrive par en dessous. */
function Rolling({
  as = "div",
  track,
  at,
  current,
  className,
  children,
}: {
  as?: "div" | "span";
  track: MotionValue<number>;
  at: number;
  current: boolean;
  className?: string;
  children: ReactNode;
}) {
  const y = useTransform(track, (p) => `${(at - p) * 100}%`);
  const opacity = useTransform(track, (p) => 1 - Math.min(1, Math.abs(at - p) * 1.5));
  const Tag = as === "span" ? motion.span : motion.div;

  return (
    <Tag style={{ y, opacity }} aria-hidden={current ? undefined : true} className={className}>
      {children}
    </Tag>
  );
}

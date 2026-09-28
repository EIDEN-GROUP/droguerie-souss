import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Section « catalogue » de l'accueil : titre et lien a gauche, carrousel de cartes produit
 * a droite qui file jusqu'au bord de l'ecran, barre de progression dessous.
 *
 * En `lg`, les fleches se calent en bas de la colonne de gauche ; en dessous, tout s'empile
 * (titre, carrousel, barre, fleches centrees). `--bleed` est la distance entre le bord
 * droit du contenu (`container-x`) et celui de l'ecran : la marge negative du carrousel la
 * rattrape pour que les cartes sortent de l'ecran au lieu de s'arreter au conteneur.
 */
export function CatalogueCarousel({
  header,
  seeAll,
  products,
  loading,
}: {
  header: ReactNode;
  seeAll: ReactNode;
  products: Product[];
  loading: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [thumb, setThumb] = useState(1);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Barre de progression facon ascenseur : largeur = part visible (1 / nombre d'arrets),
  // position = avancement. Mise a jour directe du style a chaque image du defilement.
  const onScroll = useCallback((api: EmblaCarouselType) => {
    const snaps = api.scrollSnapList().length;
    const size = snaps > 1 ? 1 / snaps : 1;
    const progress = Math.min(1, Math.max(0, api.scrollProgress()));
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translateX(${(progress * (1 - size) * 100) / size}%)`;
    }
  }, []);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
    const snaps = api.scrollSnapList().length;
    setThumb(snaps > 1 ? 1 / snaps : 1);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    onScroll(emblaApi);
    emblaApi.on("select", onSelect).on("reInit", onSelect).on("scroll", onScroll).on("reInit", onScroll);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect).off("scroll", onScroll).off("reInit", onScroll);
    };
  }, [emblaApi, onSelect, onScroll]);

  const navButton =
    "grid h-11 w-11 place-items-center rounded-lg border border-border bg-paper text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none";

  return (
    <section className="overflow-hidden bg-cream py-20 [--bleed:1rem] sm:[--bleed:1.5rem] lg:[--bleed:calc(2rem+max(0px,(100vw-1500px)/2))]">
      <div className="container-x grid gap-y-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:grid-rows-[1fr_auto] lg:gap-x-14">
        <div className="lg:col-start-1 lg:row-start-1 lg:pt-6">
          {header}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            {seeAll}
          </motion.div>
        </div>

        <div className="min-w-0 -mr-[var(--bleed)] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <>
              <div ref={emblaRef} className="overflow-hidden">
                {/* Padding vertical : les ombres des cartes ne sont pas rognees. */}
                <div className="-ml-5 flex touch-pan-y py-5">
                  {products.map((p, i) => (
                    <div key={p.id} className="min-w-0 shrink-0 grow-0 basis-auto pl-5">
                      <div className="h-full w-[17rem] sm:w-[18rem] lg:w-[17rem] 2xl:w-[18rem]">
                        <ProductCard product={p} index={i} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: EASE }}
                className="mr-[var(--bleed)] mt-4 h-[3px] origin-left overflow-hidden rounded-full bg-ink/10"
              >
                <div
                  ref={thumbRef}
                  style={{ width: `${thumb * 100}%` }}
                  className="h-full rounded-full bg-ink transition-[width] duration-300"
                />
              </motion.div>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          className="flex justify-center gap-3 lg:col-start-1 lg:row-start-2 lg:justify-start lg:self-end"
        >
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Produits précédents"
            className={navButton}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Produits suivants"
            className={navButton}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

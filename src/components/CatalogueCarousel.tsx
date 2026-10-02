import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { Reveal } from "./motion/Reveal";
import { fromTo, rise } from "./motion/reveals";
import { ProductCard } from "./ProductCard";

const pad = (n: number) => String(n).padStart(2, "0");

export function CatalogueCarousel({
  header,
  description,
  seeAll,
  products,
  loading,
}: {
  header: ReactNode;
  description?: string;
  seeAll: ReactNode;
  products: Product[];
  loading: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [thumb, setThumb] = useState(1);
  const [position, setPosition] = useState({ current: 1, total: 1 });
  const thumbRef = useRef<HTMLDivElement>(null);

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
    setPosition({ current: api.selectedScrollSnap() + 1, total: Math.max(1, snaps) });
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
    "grid h-11 w-11 place-items-center rounded-lg border border-border bg-paper text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-accent-red hover:bg-accent-red hover:text-paper disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none";

  return (
    <section className="overflow-hidden bg-paper py-20 [--bleed:1rem] sm:[--bleed:1.5rem] md:py-24 lg:[--bleed:calc(2rem+max(0px,(100vw-1500px)/2))]">
      <div className="container-x grid gap-y-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:grid-rows-[1fr_auto] lg:gap-x-14">
        <Reveal className="lg:col-start-1 lg:row-start-1 lg:pt-6">
          {header}
          {description && (
            <motion.p
              variants={rise({ y: 12, delay: 0.2, duration: 0.6 })}
              className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base"
            >
              {description}
            </motion.p>
          )}
          <motion.div variants={rise({ y: 12, delay: 0.3, duration: 0.6 })}>{seeAll}</motion.div>
        </Reveal>

        <div className="min-w-0 -mr-[var(--bleed)] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <>
              <div ref={emblaRef} className="cursor-grab overflow-hidden active:cursor-grabbing">
                {/* Padding vertical : les ombres des cartes ne sont pas rognees. */}
                <div className="-ml-5 flex touch-pan-y py-5">
                  {products.map((p, i) => (
                    <div key={p.id} className="min-w-0 shrink-0 grow-0 basis-auto pl-5">
                      <div className="h-full w-[17rem] sm:w-[18.5rem]">
                        <ProductCard product={p} index={i} hoverActions />
                      </div>
                    </div>
                  ))}

                  {/* Derniere vue : la suite du catalogue est dans la boutique. */}
                  <div className="min-w-0 shrink-0 grow-0 basis-auto pl-5 pr-[var(--bleed)]">
                    <Link
                      to="/categories"
                      hash="produits"
                      hashScrollIntoView={{ behavior: "instant", block: "start" }}
                      className="group flex h-full w-[13rem] flex-col items-center justify-center gap-5 rounded-xl bg-brand-secondary p-6 text-center text-paper transition duration-300 hover:bg-accent-red sm:w-[15rem]"
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-full border border-paper/40 transition duration-300 group-hover:border-paper group-hover:bg-paper group-hover:text-accent-red">
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                      <span className="font-display text-xl leading-tight">
                        Voir tous les produits
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              <Reveal margin="-40px" className="mr-[var(--bleed)] mt-4">
                <motion.div
                  variants={fromTo({ scaleX: 0 }, { scaleX: 1 }, { delay: 0.2, duration: 1 })}
                  className="h-[3px] origin-left overflow-hidden rounded-full bg-ink/10"
                >
                  <div
                    ref={thumbRef}
                    style={{ width: `${thumb * 100}%` }}
                    className="h-full rounded-full bg-accent-red transition-[width] duration-300"
                  />
                </motion.div>
              </Reveal>
            </>
          )}
        </div>

        <Reveal
          margin="-40px"
          variants={rise({ y: 12, delay: 0.2, duration: 0.6 })}
          className="flex items-center justify-center gap-3 lg:col-start-1 lg:row-start-2 lg:justify-start lg:self-end"
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
          <p aria-hidden="true" className="ml-2 font-display text-lg tabular-nums text-ink">
            {pad(position.current)}
            <span className="mx-1.5 text-ink-soft">/</span>
            <span className="text-ink-soft">{pad(position.total)}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

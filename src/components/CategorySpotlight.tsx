import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CategoryInfo } from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 3500;
const pad = (n: number) => String(n).padStart(2, "0");

export function CategorySpotlight({ items, title }: { items: CategoryInfo[]; title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const rootRef = useRef<HTMLElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const playing = !!emblaApi && !paused && inView && !reduce && items.length > 1;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => emblaApi?.scrollNext(), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [playing, selected, emblaApi]);

  const arrow =
    "grid h-9 w-9 place-items-center rounded-full border border-border text-ink transition hover:border-ink hover:bg-ink hover:text-paper";

  return (
    <motion.nav
      ref={rootRef}
      aria-label={title}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3 pl-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-soft">{title}</p>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Rayon précédent"
            className={arrow}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Rayon suivant"
            className={arrow}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={emblaRef} className="mt-4 overflow-hidden rounded-2xl">
        <div className="flex touch-pan-y">
          {items.map((c, i) => (
            <div
              key={c.category}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${i + 1} sur ${items.length}`}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <Link
                to="/categories"
                search={{ cat: c.category }}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[4/5]"
              >
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${
                    i === selected ? "scale-100" : "scale-110"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-paper sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70">
                    Rayon {pad(i + 1)} / {pad(items.length)}
                  </p>
                  <h3 className="text-shadow-overlay mt-2 font-display text-2xl uppercase leading-tight sm:text-3xl">
                    {c.name}
                  </h3>
                  <span className="mt-3 block h-1 w-10 rounded-full bg-accent-red transition-[width] duration-500 group-hover:w-16" />
                  <p className="mt-3 line-clamp-2 text-sm leading-snug text-paper/85">
                    {c.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    Voir les produits
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        {items.map((c, i) => (
          <button
            key={c.category}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Afficher ${c.name}`}
            aria-current={i === selected ? "true" : undefined}
            className="grid h-6 place-items-center px-1"
          >
            <span
              className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                i === selected ? "w-8 bg-mint" : "w-1.5 bg-border hover:bg-ink-soft"
              }`}
            >
              {i === selected &&
                (playing ? (
                  <motion.span
                    key={selected}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                    className="absolute inset-0 origin-left bg-accent-red"
                  />
                ) : (
                  <span className="absolute inset-0 bg-accent-red" />
                ))}
            </span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
}

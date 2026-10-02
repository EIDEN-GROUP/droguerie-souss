import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Anvil,
  Blocks,
  BrickWall,
  ChevronRight,
  Component,
  Cuboid,
  Fence,
  Gem,
  Grid3x3,
  Hammer,
  HardHat,
  LayoutGrid,
  Mountain,
  Package,
  PaintBucket,
  PaintRoller,
  Palette,
  ShowerHead,
  SprayCan,
  Sun,
  Umbrella,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ComponentProps, type CSSProperties } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { CategoryInfo } from "@/lib/products";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const ICONS: [RegExp, LucideIcon][] = [
  [/zellige/, Component],
  [/marbre|pierre/, Gem],
  [/ceram|faience/, LayoutGrid],
  [/carrel/, Grid3x3],
  [/decor/, Palette],
  [/peint/, PaintRoller],
  [/mono|bicouche/, SprayCan],
  [/platre|enduit/, PaintBucket],
  [/solaire/, Sun],
  [/electr|cable/, Zap],
  [/sanit|robinet/, ShowerHead],
  [/plomb|tuyau|goutt/, Wrench],
  [/etanch|isol|bitum/, Umbrella],
  [/treillis|fer-a-beton/, Fence],
  [/metal|acier/, Anvil],
  [/prefab/, Blocks],
  [/colle|mortier/, BrickWall],
  [/beton/, Cuboid],
  [/ciment|granulat|agregat|sable|gravier/, Mountain],
  [/secur/, HardHat],
  [/quincaill|outil/, Hammer],
];

function iconFor(slug: string): LucideIcon {
  const key = slug
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return ICONS.find(([pattern]) => pattern.test(key))?.[1] ?? Package;
}

const VISIBLE = 4;
const BASE = `${100 / VISIBLE}%`;
const WIDE = "37.5%";
const NARROW = `${(100 - 37.5) / (VISIBLE - 1)}%`;

const OPTIONS: NonNullable<ComponentProps<typeof Carousel>["opts"]> = {
  align: "start",
  slidesToScroll: "auto",
  // Un panneau qui s'elargit change de taille sans que la rangee bouge : seul un
  // redimensionnement du carrousel lui-meme doit le faire recalculer.
  watchResize: (api, entries) => entries.some((entry) => entry.target === api.containerNode()),
};

/** Fleches du carrousel, posees sur la bande sombre de l'accueil. */
const NAV =
  "static h-9 w-9 translate-y-0 text-paper hover:bg-paper/10 hover:text-paper disabled:opacity-30";

const rise = {
  hidden: { opacity: 0, y: 40 },
  shown: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: EASE },
  }),
};

export function CategoryPanels({ items }: { items: CategoryInfo[] }) {
  const [api, setApi] = useState<CarouselApi>();
  /** Premier panneau de la page affichee, et panneau survole. */
  const [start, setStart] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      const progress = api.scrollSnapList()[api.selectedScrollSnap()] ?? 0;
      setStart(Math.round(progress * Math.max(0, api.slideNodes().length - VISIBLE)));
    };
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api]);

  const onPage = (i: number) => i >= start && i < start + VISIBLE;
  /** Le panneau elargi : jamais un panneau hors de la page, la rangee en serait decalee. */
  const wide = active !== null && onPage(active) ? active : null;

  return (
    <Carousel opts={OPTIONS} setApi={setApi}>
      <div className="container-x mb-4 mt-2 flex justify-end gap-1">
        <CarouselPrevious variant="ghost" className={NAV} />
        <CarouselNext variant="ghost" className={NAV} />
      </div>
      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-80px 0px" }}
      >
        <CarouselContent
          className="ml-0"
          onPointerLeave={() => setActive(null)}
          onBlur={(e) =>
            !e.currentTarget.contains(e.relatedTarget as Node | null) && setActive(null)
          }
        >
          {items.map((c, i) => {
            const Icon = iconFor(c.slug);
            const expanded = wide === i;
            const width = wide === null || !onPage(i) ? BASE : expanded ? WIDE : NARROW;
            return (
              <CarouselItem
                key={c.category}
                style={{ "--w": width } as CSSProperties}
                className="basis-[82%] pl-0 sm:basis-[46%] md:basis-[31%] lg:grow lg:basis-(--w) lg:transition-[flex-basis] lg:duration-500 lg:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              >
                <motion.div variants={i < VISIBLE ? rise : undefined} custom={i} className="h-full">
                  <Link
                    to="/categories"
                    search={{ cat: c.category }}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(i)}
                    className="group relative isolate flex h-[26rem] flex-col items-center overflow-hidden bg-ink px-5 py-10 text-center text-paper focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper sm:h-[28rem] lg:h-[32rem] lg:py-16 xl:h-[35rem] xl:py-20"
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />

                    <span aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-brand-secondary opacity-0 transition-opacity duration-500 group-hover:opacity-60 group-focus-visible:opacity-60"
                    />

                    <div className="flex w-full flex-1 items-end justify-center pt-6 lg:w-[calc(20vw-2rem)]">
                      <h3 className="text-shadow-overlay hyphens-auto font-display text-2xl leading-[1.15] xl:text-[1.75rem]">
                        {c.name}
                      </h3>
                    </div>

                    <div className="relative mt-3 h-[4.75rem] w-full lg:w-[calc(20vw-2rem)]">
                      <p
                        className={cn(
                          "text-shadow-overlay line-clamp-4 text-sm leading-snug text-paper/90 transition lg:can-hover:absolute lg:can-hover:left-1/2 lg:can-hover:top-0 lg:can-hover:w-[min(21rem,calc(37.5vw-4rem))] lg:can-hover:-translate-x-1/2",
                          expanded
                            ? "delay-150 duration-500"
                            : "duration-200 lg:can-hover:translate-y-3 lg:can-hover:opacity-0",
                        )}
                      >
                        {c.description}
                      </p>
                    </div>

                    <span aria-hidden="true" className="mt-7 grid h-11 w-11 shrink-0 place-items-center bg-accent-red/50 backdrop-blur-sm transition-colors duration-300 group-hover:bg-accent-red group-focus-visible:bg-accent-red">
                      <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </motion.div>
    </Carousel>
  );
}

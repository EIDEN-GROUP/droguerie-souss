import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { CategoryInfo } from "@/lib/products";
import { Reveal } from "./motion/Reveal";
import { rise } from "./motion/reveals";

/** Photos visibles ensemble en `xl` : le decalage d'entree repart de zero a chaque page. */
const VISIBLE = 4;

const navButton =
  "grid h-12 w-12 place-items-center bg-paper text-ink transition duration-300 hover:bg-accent-red hover:text-paper sm:h-14 sm:w-14 rounded-md";

/**
 * Les rayons de l'accueil : une rangee de photos pleine largeur, une sur deux decalee vers
 * le bas, qui defile en boucle. Le titre (`header`) est a gauche, les fleches a droite.
 *
 * Au survol d'une photo, un cartouche blanc monte par-dessus : ses deux filets rouges se
 * tracent en croix, puis le nom du rayon et sa description apparaissent. Sur ecran tactile,
 * sans survol, le cartouche reste affiche.
 */
export function CategoryShowcase({ items, header }: { items: CategoryInfo[]; header: ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true });

  return (
    <>
      <div className="container-x flex items-end justify-between gap-6">
        {header}
        <Reveal
          variants={rise({ y: 12, delay: 0.3, duration: 0.6 })}
          className="hidden shrink-0 gap-2 sm:flex"
        >
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Rayons précédents"
            className={navButton}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Rayons suivants"
            className={navButton}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </Reveal>
      </div>

      <Reveal className="mt-10 md:mt-14">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {items.map((c, i) => (
              <div
                key={c.category}
                className={`min-w-0 shrink-0 grow-0 basis-[82%] pr-0.5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 ${
                  i % 2 ? "sm:pt-8" : "sm:pb-8"
                }`}
              >
                <motion.div variants={rise({ y: 70, delay: (i % VISIBLE) * 0.12, duration: 0.9 })}>
                  <Link
                    to="/categories"
                    search={{ cat: c.category }}
                    className="group relative rounded-2xl block h-[26rem] overflow-hidden bg-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper sm:h-[30rem] xl:h-[36rem]"
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/55 transition-opacity duration-500 group-hover:opacity-70"
                    />

                    <div className="absolute inset-x-[8%] rounded-2xl bottom-[7%] h-44 bg-paper transition duration-500 ease-out can-hover:translate-y-10 can-hover:opacity-0 can-hover:group-hover:translate-y-0 can-hover:group-hover:opacity-100 can-hover:group-focus-visible:translate-y-0 can-hover:group-focus-visible:opacity-100 motion-reduce:transition-none sm:h-48">
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-[16%] w-px origin-top bg-accent-red transition-transform delay-200 duration-700 ease-out can-hover:scale-y-0 can-hover:group-hover:scale-y-100 can-hover:group-focus-visible:scale-y-100"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute bottom-[2.9rem] left-0 h-px w-[30%] origin-left bg-accent-red transition-transform delay-300 duration-700 ease-out can-hover:scale-x-0 can-hover:group-hover:scale-x-100 can-hover:group-focus-visible:scale-x-100"
                      />
                      <div className="absolute bottom-9 left-[34%] right-6 text-right transition delay-300 duration-500 can-hover:translate-y-2 can-hover:opacity-0 can-hover:group-hover:translate-y-0 can-hover:group-hover:opacity-100 can-hover:group-focus-visible:translate-y-0 can-hover:group-focus-visible:opacity-100">
                        <h3 className="line-clamp-3 font-sans text-base font-semibold uppercase leading-tight tracking-wide text-ink sm:text-lg sm:leading-tight">
                          {c.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink-soft">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </>
  );
}

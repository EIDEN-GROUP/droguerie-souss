import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { useRef } from "react";
import { ABOUT } from "@/lib/about";
import { BUSINESS } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion/Reveal";
import { fromTo, rise, wipe } from "./motion/reveals";
import { SplitReveal } from "./motion/SplitReveal";

/** Photos d'ambiance du catalogue interactif, avec leur légende d'origine. */
const PHOTOS = {
  first: { src: "/catalogue-photos/ambiance-salon.webp", alt: "Effet parquet 45×45 · séjour" },
  second: {
    src: "/catalogue-photos/ambiance-cuisine.webp",
    alt: "Grand format effet bois · cuisine ouverte",
  },
};

/** Aplat ou cadre en retrait, qui depasse sous un coin de la photo. */
const decor = fromTo({ opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }, { delay: 0.5 });

/** Photo qui se dévoile en rideau (`from`), puis défile un peu moins vite que la page. A
 *  poser dans un `Reveal`, qui lui annonce son entree dans l'ecran. */
function Photo({
  src,
  alt,
  from,
  className,
}: {
  src: string;
  alt: string;
  from: "left" | "right";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div variants={wipe(from)} className="relative h-full overflow-hidden rounded-2xl">
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ y }}
          variants={fromTo({ scale: 1.18 }, { scale: 1 }, { duration: 1.6 })}
          className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover"
        />
      </motion.div>
    </div>
  );
}

export function IntroSection() {
  return (
    <section className="overflow-hidden bg-paper pb-16 pt-16 md:pb-20 md:pt-24 lg:pt-28">
      <div className="container-xs flex flex-col gap-y-10 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-16 xl:gap-x-24">
        <div className="contents lg:flex lg:flex-col">
          <Reveal className="relative order-2 mr-10 sm:mr-28 lg:order-none lg:mr-0">
            <motion.span
              aria-hidden="true"
              variants={decor}
              className="absolute -bottom-5 -right-5 h-32 w-32 bg-mint sm:-bottom-7 sm:-right-7 sm:h-44 sm:w-44 rounded-2xl"
            />
            <Photo
              {...PHOTOS.first}
              from="left"
              className="aspect-[7/8] sm:aspect-[4/3] lg:aspect-[7/8]"
            />
            <motion.p
              variants={rise({ x: -20, y: 0, delay: 0.7, duration: 0.7 })}
              className="absolute bottom-6 left-0 bg-accent-red rounded-r-md px-5 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-paper"
            >
              Depuis {BUSINESS.sinceYear}
            </motion.p>
          </Reveal>

          <Reveal as="figure" className="order-3 lg:order-none lg:mt-20 lg:pr-6">
            <motion.div variants={rise()}>
              <Quote className="h-9 w-9 text-accent-red" strokeWidth={1.25} />
            </motion.div>
            <motion.blockquote
              variants={rise({ delay: 0.12 })}
              className="mt-5 font-display text-xl leading-relaxed text-ink sm:text-2xl sm:leading-relaxed"
            >
              {ABOUT.director.body[1]}
            </motion.blockquote>
            <motion.figcaption
              variants={rise({ delay: 0.24 })}
              className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              <span className="h-px w-10 bg-accent-red" />
              {ABOUT.director.signature}
              <span className="font-medium normal-case tracking-normal text-ink-soft">
                {ABOUT.director.kicker}
              </span>
            </motion.figcaption>
          </Reveal>
        </div>

        <div className="contents lg:flex lg:flex-col">
          <Reveal className="order-1 lg:order-none lg:pt-6">
            <div className="inline-flex items-center gap-2">
              <motion.span
                variants={fromTo({ scaleX: 0 }, { scaleX: 1 })}
                className="h-px w-8 origin-left bg-accent-red"
              />
              <motion.span
                variants={rise({ x: -8, y: 0, delay: 0.2, duration: 0.6 })}
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-red"
              >
                {ABOUT.director.title.join(" ")}
              </motion.span>
            </div>
            <SplitReveal
              as="h2"
              className="mt-4 max-w-xl text-balance font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl xl:text-5xl xl:leading-[1.1]"
            >
              {ABOUT.opening}
            </SplitReveal>
            <motion.p
              variants={rise({ y: 24, delay: 0.15, duration: 0.7 })}
              className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base"
            >
              {ABOUT.intro[1]}
            </motion.p>
            <motion.div variants={rise({ y: 24, delay: 0.27, duration: 0.7 })} className="mt-7">
              <Link
                to="/categories"
                className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink transition hover:text-accent-red"
              >
                Voir nos produits
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </Reveal>

          <Reveal className="relative order-4 ml-10 sm:ml-28 lg:order-none lg:ml-0 lg:mt-20">
            <motion.span
              aria-hidden="true"
              variants={decor}
              className="absolute -left-5 -top-5 h-28 w-28 border border-accent-red/40 sm:-left-7 sm:-top-7 sm:h-40 sm:w-40 rounded-2xl"
            />
            <Photo {...PHOTOS.second} from="right" className="aspect-[4/3]" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

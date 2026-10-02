import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useState } from "react";
import { stores } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion/Reveal";
import { rise, wipe } from "./motion/reveals";
import { SectionHeader } from "./SectionHeader";

export function StoresShowcase() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="overflow-hidden bg-cream py-16 md:py-24">
      <div className="container-x">
        <SectionHeader
          kicker="Le groupe"
          title="Daoud Building & Dune Distribution"
          align="left"
          animated
        />

        <Reveal
          onPointerLeave={() => setActive(null)}
          className="mt-10 flex flex-col gap-3 md:mt-14 lg:h-[38rem] lg:flex-row"
        >
          {stores.map((s, i) => (
            <motion.article
              key={s.name}
              variants={wipe("bottom", { delay: i * 0.15, duration: 1.1 })}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              className={cn(
                "group relative rounded-2xl isolate flex min-h-[32rem] flex-col justify-between overflow-hidden bg-black p-6 text-paper sm:p-9 lg:min-h-0 lg:basis-1/2 lg:transition-[flex-basis] lg:duration-700 lg:ease-[cubic-bezier(0.22,1,0.36,1)] xl:p-11 motion-reduce:transition-none",
                active === i && "lg:basis-[62%]",
                active !== null && active !== i && "lg:basis-[38%]",
              )}
            >
              <img
                src={s.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/70 to-black/25"
              />

              <motion.div
                variants={rise({ y: -16, delay: 0.5 + i * 0.15, duration: 0.7 })}
                className="flex items-start justify-between gap-4"
              >
                <span className="h-14 w-40 p-2 lg:h-16 lg:w-48">
                  {/* Logos en couleur sur fond transparent : le filtre les passe en blanc. */}
                  <img
                    src={s.logo}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain brightness-0 invert"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="font-display text-5xl leading-none text-paper/25 transition-colors duration-500 group-hover:text-paper/60 sm:text-6xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>

              <motion.div variants={rise({ delay: 0.45 + i * 0.15 })} className="mt-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky">
                  {s.baseline}
                </p>
                <h3 className="mt-3 font-display text-3xl uppercase leading-none sm:text-4xl xl:text-5xl">
                  <Link
                    to={s.to}
                    className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-paper"
                  >
                    {s.name}
                  </Link>
                </h3>
                <p className="mt-3 font-display text-lg italic text-paper/85 sm:text-xl">
                  {s.tagline}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-5 block h-0.5 w-12 bg-accent-red transition-[width] duration-500 ease-out group-hover:w-24 group-focus-within:w-24"
                />

                {/* Deplie au survol (souris, `lg`) ; toujours affiche ailleurs. */}
                <div className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:can-hover:grid-rows-[0fr] lg:can-hover:opacity-0 lg:can-hover:group-hover:grid-rows-[1fr] lg:can-hover:group-hover:opacity-100 lg:can-hover:group-focus-within:grid-rows-[1fr] lg:can-hover:group-focus-within:opacity-100 motion-reduce:transition-none">
                  <div className="overflow-hidden">
                    {/* Largeur fixe en `xl` : le texte ne se recoupe pas pendant que le
                        panneau s'elargit. */}
                    <p className="max-w-md pt-5 text-sm leading-relaxed text-paper/80 xl:w-[28rem]">
                      {s.text}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <span className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider">
                    Feuilleter en ligne
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-red transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                  {s.place && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-paper/75">
                      <MapPin className="h-4 w-4 text-sky" />
                      {s.place}
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

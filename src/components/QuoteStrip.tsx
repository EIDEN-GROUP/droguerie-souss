import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronsRight, Phone } from "lucide-react";
import photo from "@/assets/hero-1.jpg";
import { BUSINESS } from "@/lib/contact";
import { Reveal } from "./motion/Reveal";
import { fromTo, rise } from "./motion/reveals";
import { SplitReveal } from "./motion/SplitReveal";

/**
 * Appel a devis qui ferme l'accueil : un bandeau rouge, et a gauche une photo au bord droit
 * en biais qui depasse au-dessus de lui. Le petit triangle sombre, entre le coin de la photo
 * et le bandeau, donne l'illusion que celui-ci se replie derriere elle.
 *
 * Sous `md`, la photo passe au-dessus du bandeau, sans biais.
 */
export function QuoteStrip() {
  return (
    <section className="overflow-hidden bg-paper md:pt-10">
      <Reveal margin="-40px" className="overflow-hidden md:hidden">
        <motion.img
          src={photo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          variants={fromTo({ opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1 }, { duration: 1 })}
          className="h-44 w-full object-cover"
        />
      </Reveal>

      {/* L'entree dans l'ecran est guettee sur le bandeau : la photo, glissee hors du cadre,
          n'y entrerait jamais. */}
      <Reveal margin="-60px" className="relative bg-accent-red">
        {/* <motion.span
          aria-hidden="true"
          variants={fromTo({ opacity: 0 }, { opacity: 1 }, { delay: 0.9, duration: 0.4 })}
          className="absolute -top-10 left-[38%] hidden h-10 w-12 -translate-x-5 bg-ink [clip-path:polygon(42%_0,100%_100%,0_100%)] md:block"
        /> */}
        <motion.div
          aria-hidden="true"
          variants={fromTo({ x: "-100%" }, { x: 0 }, { duration: 1.1 })}
          className="absolute -top-10 bottom-0 left-0 hidden w-[38%] [clip-path:polygon(0_0,100%_0,calc(100%_-_7rem)_100%,0_100%)] md:block"
        >
          <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-ink/25" />
        </motion.div>

        <div className="relative flex flex-col gap-7 px-4 py-12 sm:px-6 md:py-14 md:pl-[40%] md:pr-8 lg:py-16 xl:flex-row xl:items-center xl:justify-between xl:gap-8 xl:pr-[max(2rem,calc((100vw_-_1500px)_/_2_+_2rem))]">
          <div className="text-paper">
            <motion.p
              variants={rise({ y: 12, delay: 0.3, duration: 0.6 })}
              className="text-xs font-medium tracking-[0.3em] text-paper/90 sm:text-sm"
            >
              Vous avez un projet ?
            </motion.p>
            <SplitReveal
              as="h2"
              delay={0.2}
              className="mt-2 font-display text-3xl leading-tight sm:text-4xl"
            >
              Recevez votre devis gratuit en {BUSINESS.quoteSlaShort}
            </SplitReveal>
          </div>

          <motion.div
            variants={rise({ x: 30, y: 0, delay: 0.4, duration: 0.7 })}
            className="flex shrink-0 flex-wrap items-center gap-3"
          >
            <Link
              to="/contact"
              className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-paper px-8 py-3 text-sm font-bold text-ink transition duration-300 hover:bg-ink hover:text-paper"
            >
              Demander un devis
              <ChevronsRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-paper/50 px-6 py-3 text-sm font-bold text-paper transition duration-300 hover:border-ink hover:bg-ink"
            >
              <Phone className="h-4 w-4" /> Nous appeler
            </a>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { useRef } from "react";
import banner from "@/assets/banner-cta.jpg";
import { SplitReveal } from "./motion/SplitReveal";

export function CtaBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(enter, [0, 1], [reduce ? 1 : 0.9, 1]);
  const imageY = useTransform(pass, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <section className="container-x pb-20 pt-10 md:pb-24">
      <motion.div ref={ref} style={{ scale }} className="relative overflow-hidden rounded-xl">
        {/* Plus haute que l'encart (-10 % en haut et en bas) pour que le glissement ne
            decouvre jamais de bord. */}
        <motion.img
          src={banner}
          alt=""
          loading="lazy"
          style={{ y: imageY }}
          className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/100 via-black/80 to-black/50" />
        <div className="relative grid gap-8 px-6 py-10 sm:px-12 sm:py-12 md:grid-cols-2 md:items-center md:px-20 md:py-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-paper"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky">
              Vous avez un projet ?
            </span>
            <SplitReveal
              as="h3"
              delay={0.15}
              className="mt-3 font-display text-md font-bold uppercase leading-tight sm:text-lg md:text-4xl"
            >
              Recevez votre devis gratuit en 48h
            </SplitReveal>
            <p className="mt-4 max-w-md text-paper/80">
              Notre équipe technique étudie votre chantier et vous propose la meilleure
              combinaison prix / délais / qualité.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col flex-wrap gap-3 sm:flex-row md:justify-end"
          >
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent-red px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-accent-red/90"
            >
              Demander un devis
            </Link>
            <a
              href="tel:+212528838992"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-paper px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-paper hover:text-ink"
            >
              <Phone className="h-4 w-4" /> Nous appeler
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

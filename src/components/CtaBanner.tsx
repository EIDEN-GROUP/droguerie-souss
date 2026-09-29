import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { useRef } from "react";
import banner from "@/assets/banner-cta.jpg";
import { SplitReveal } from "./motion/SplitReveal";

export function CtaBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(enter, [0, 1], [reduce ? 1 : 0.9, 1]);
  const imageY = useTransform(pass, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  return (
    <section>
      <motion.div ref={ref} style={{ scale }} className="relative overflow-hidden">
        <motion.img
          src={banner}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{ y: imageY }}
          className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/100 via-ink/85 to-ink/50" />
        <div className="container-x relative grid gap-8 py-12 sm:py-14  md:items-center md:py-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-paper w-full md:w-[35%]"
          >
            <span className="text-[12px] font-semibold uppercase tracking-[0.3em] text-sky">
              Vous avez un projet ?
            </span>
            <SplitReveal
              as="h3"
              delay={0.15}
              className="mt-3 font-display text-3xl font-bold uppercase leading-tight sm:text-lg md:text-5xl"
            >
              Recevez votre devis gratuit en 48h
            </SplitReveal>
            <p className="mt-4 max-w-md text-paper/80">
              Notre équipe technique étudie votre chantier et vous propose la meilleure combinaison
              prix / délais / qualité.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col flex-wrap gap-3 sm:flex-row md:justify-start"
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

import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import banner from "@/assets/banner-cta.jpg";

export function CtaBanner() {
  return (
    <section className="container-x py-16">
      <div className="relative overflow-hidden rounded-3xl">
        <img
          src={banner}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/40" />
        <div className="relative grid gap-8 p-8 sm:p-12 md:grid-cols-2 md:items-center md:p-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-paper"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky">
              Vous avez un projet ?
            </span>
            <h3 className="mt-3 font-display text-3xl font-bold uppercase leading-tight sm:text-4xl md:text-5xl">
              Recevez votre devis gratuit en 24h
            </h3>
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
              to="/contactez-nousez-nous"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent-red px-7 py-4 text-sm font-bold uppercase tracking-wider text-paper hover:bg-accent-red/90"
            >
              Demander un devis
            </Link>
            <a
              href="tel:+212528000000"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-paper px-7 py-4 text-sm font-bold uppercase tracking-wider text-paper hover:bg-paper hover:text-ink"
            >
              <Phone className="h-4 w-4" /> Nous appeler
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

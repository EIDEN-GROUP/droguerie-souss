import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-ink">
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 aspect-video"
      >
        <video
          src="/hero.mp4"
          poster="/hero-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
      </motion.div>

      <div className="container-x relative z-10 flex h-full items-center">
        <div className="max-w-2xl text-paper">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              Bâtissez avec les meilleurs matériaux
            </h1>
            <p className="mt-5 max-w-lg text-base text-paper/80 sm:text-lg">
              Ciment, granulats, plâtre   tout pour votre chantier livré rapidement dans le Souss.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/rubriques"
                className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
              >
                Explorer la boutique
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper backdrop-blur transition hover:bg-paper hover:text-ink"
              >
                Demander un devis
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

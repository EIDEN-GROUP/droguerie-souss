import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    image: hero1,
    kicker: "Matériaux de construction",
    title: "Bâtissez avec les meilleurs matériaux",
    subtitle: "Ciment, granulats, plâtre   tout pour votre chantier livré rapidement dans le Souss.",
    cta: "Explorer la boutique",
  },
  {
    image: hero2,
    kicker: "Marbre & Zellige",
    title: "L'élégance marocaine, artisanale",
    subtitle: "Marbres nobles et zelliges de Fès faits main pour vos projets d'exception.",
    cta: "Découvrir la collection",
  },
  {
    image: hero3,
    kicker: "Quincaillerie professionnelle",
    title: "Tout pour les pros du bâtiment",
    subtitle: "Outillage, électricité, plomberie   équipez vos équipes en un seul lieu.",
    cta: "Voir les produits",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const s = slides[index];
  return (
    <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden bg-ink">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container-x relative z-10 flex h-full items-center">
        <div className="max-w-2xl text-paper">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand/20 px-4 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky">
                  {s.kicker}
                </span>
              </div> */}
              <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
                {s.title}
              </h1>
              <p className="mt-5 max-w-lg text-base text-paper/80 sm:text-lg">
                {s.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/produits"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
                >
                  {s.cta}
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
          </AnimatePresence>
        </div>
      </div>

      {/* controls */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 sm:bottom-40 sm:left-auto sm:right-8 sm:translate-x-0">
        <button
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="grid h-11 w-11 place-items-center rounded-full border border-paper/30 text-paper backdrop-blur transition hover:bg-paper hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-accent-red" : "w-4 bg-paper/40"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="grid h-11 w-11 place-items-center rounded-full border border-paper/30 text-paper backdrop-blur transition hover:bg-paper hover:text-ink"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

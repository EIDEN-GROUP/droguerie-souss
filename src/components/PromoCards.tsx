import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import collectionBath from "@/assets/collection-bath.jpg";
import collectionLiving from "@/assets/collection-living.jpg";
import { SectionHeader } from "./SectionHeader";

export function PromoCards() {
  return (
    <section className="container-x py-16">
      <SectionHeader kicker="Promo du Mois" title="Profitez de nos offres exclusives" />
      <div className="grid gap-5 md:grid-cols-2 pt-20">
          {[
            { img: collectionBath, label: "Salle de bain moderne", desc: "Marbre & finitions haut de gamme" },
            { img: collectionLiving, label: "Salon oriental", desc: "Zellige & inspirations marocaines" },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <img src={c.img} alt={c.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-cyan">Collection</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{c.label}</h3>
                <p className="mt-1 text-sm text-white/80">{c.desc}</p>
                <Link to="/produits" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-brand-cyan">
                  Voir la collection <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
      </div>
    </section>
  );
}

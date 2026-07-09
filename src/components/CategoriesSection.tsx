import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/products";
import { SectionHeader } from "./SectionHeader";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

export function CategoriesSection() {
  return (
    <section className="container-x py-20">
      <SectionHeader kicker="Nos rayons" title="Toutes les catégories" />
      <Carousel opts={{ align: "start", loop: true }} className="mt-10">
        <CarouselContent>
          {categories.map((c, i) => (
            <CarouselItem key={c.slug} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to="/produits"
                  search={{ cat: c.category }}
                  className="group block relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <img src={c.image} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <div className="font-display uppercase text-xl tracking-wide">{c.name}</div>
                    <div className="text-xs text-white/80 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      Voir les produits <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      <div className="mt-10 text-center">
        <Link
          to="/produits"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-ink hover:text-paper"
        >
          Voir tous les produits <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

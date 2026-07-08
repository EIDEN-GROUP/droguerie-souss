import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ServiceBar } from "@/components/ServiceBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductCard } from "@/components/ProductCard";
import { SuppliersCarousel } from "@/components/SuppliersCarousel";
import { PromoCards } from "@/components/PromoCards";
import { CategoriesSection } from "@/components/CategoriesSection";
import { CtaBanner } from "@/components/CtaBanner";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import promoImg from "@/assets/promo-collection.jpg";
import { useAdminStore } from "@/lib/adminStore";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const products = useAdminStore((s) => s.products);
  const bestSellers = products.filter((p) => p.bestseller);

  return (
    <Layout>
      <HeroCarousel />
      <ServiceBar />

      <section className="container-x py-20">
        <SectionHeader kicker="Best-sellers" title="Nos produits populaires" />
        <Carousel opts={{ align: "start", loop: true }} className="mt-12">
          <CarouselContent>
            {bestSellers.map((p, i) => (
              <CarouselItem key={p.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/4">
                <ProductCard product={p} index={i} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </section>

      <SuppliersCarousel />

      <PromoCards />

      <section className="container-x py-16">
        <SectionHeader kicker="Notre catalogue" title="Découvrez nos produits" />
        <div className="mt-12">
          <ProductGrid items={products.slice(0, 8)} />
        </div>
      </section>

      <section  className="container-x py-20">
        <div className="grid gap-8 lg:grid-cols-2 items-center bg-mint/50 rounded-3xl overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            src={promoImg} alt="Collection saison" loading="lazy"
            className="h-full w-full object-cover aspect-[4/3] lg:aspect-auto"
          />
          <div className="p-10 lg:p-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Collection de saison</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl uppercase text-brand-navy leading-tight">
              L'élégance marocaine, du sol au plafond
            </h2>
            <p className="mt-4 text-brand-ink/80">
              Zellige émaillé, marbre poli et carrelage grand format   sélectionnés pour vos projets résidentiels et hôteliers.
            </p>
            <Link to="/shop" className="group mt-10 inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90">
              Explorer la collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <CategoriesSection />

      <CtaBanner />
    </Layout>
  );
}

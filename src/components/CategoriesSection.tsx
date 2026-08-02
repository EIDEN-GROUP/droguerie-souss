import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/products";
import { SectionHeader } from "./SectionHeader";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

function CategoryCardBody({
  name,
  image,
  compact = false,
  active = false,
}: {
  name: string;
  image: string;
  compact?: boolean;
  active?: boolean;
}) {
  return (
    <>
      <img
        src={image}
        alt={name}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${
          active ? "scale-100" : "group-hover:scale-110"
        }`}
      />
      {/* Dark by default so the label reads; lifts on hover and while active to reveal the photo. */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 transition-opacity duration-300 ${
          active ? "opacity-0" : "opacity-100 group-hover:opacity-0"
        }`}
      />
      {/* Active card keeps the photo clear, so the label gets its own footer gradient. */}
      {active && (
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
      )}
      <div className={`absolute inset-x-0 bottom-0 text-white ${compact ? "p-3" : "p-5"}`}>
        <div
          className={`font-display uppercase tracking-wide [text-shadow:0_2px_8px_rgba(0,0,0,0.85)] ${
            compact ? "text-xs leading-tight sm:text-sm" : "text-xl"
          }`}
        >
          {name}
        </div>
        {!compact && (
          <div className="text-xs text-white/90 mt-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100 [text-shadow:0_2px_8px_rgba(0,0,0,0.85)]">
            Voir les produits <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>
    </>
  );
}

export function CategoriesSection({
  variant = "home",
  onCategorySelect,
  selectedCategory,
}: {
  variant?: "home" | "shop";
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}) {
  const isShop = variant === "shop";

  return (
    <section className={isShop ? "border-b bg-cream py-8" : "container-x py-20"}>
      {!isShop && (
        <SectionHeader kicker="Nos rayons" title="Toutes les catégories" />
      )}
      <Carousel
        opts={{ align: "start", loop: true }}
        className={isShop ? "mx-12 md:mx-16" : "mt-10 mx-10 md:mx-14"}
      >
        <CarouselContent className={isShop ? "-ml-3 items-center" : undefined}>
          {categories.map((c, i) => (
            <CarouselItem
              key={c.slug}
              className={
                isShop
                  ? `pl-3 transition-[flex-basis] duration-300 ${
                      selectedCategory === c.category
                        ? "basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-[28%]"
                        : "basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                    }`
                  : "basis-full md:basis-1/3 lg:basis-1/4"
              }
            >
              <div className={isShop ? "" : "mx-auto max-w-sm md:max-w-none"}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  {isShop && onCategorySelect ? (
                    <button
                      type="button"
                      onClick={() => onCategorySelect(c.category)}
                      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl text-left transition duration-300"
                    >
                      <CategoryCardBody
                        name={c.name}
                        image={c.image}
                        compact={selectedCategory !== c.category}
                        active={selectedCategory === c.category}
                      />
                    </button>
                  ) : (
                    <Link
                      to="/rubriques"
                      search={{ cat: c.category }}
                      className="group block relative aspect-[4/3] overflow-hidden rounded-2xl"
                    >
                      <CategoryCardBody name={c.name} image={c.image} />
                    </Link>
                  )}
                </motion.div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={isShop ? "-left-12 h-9 w-9 md:-left-14" : "-left-10 md:-left-14 h-10 w-10"} />
        <CarouselNext className={isShop ? "-right-12 h-9 w-9 md:-right-14" : "-right-10 md:-right-14 h-10 w-10"} />
      </Carousel>
      {variant === "home" && (
        <div className="mt-10 text-center">
          <Link
            to="/rubriques"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-ink hover:text-paper"
          >
            Découvrir tous les produits <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

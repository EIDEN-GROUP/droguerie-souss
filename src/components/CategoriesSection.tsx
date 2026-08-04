import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { categories as fallbackCategories, categoryImage, type CategoryInfo } from "@/lib/products";
import { useCategories } from "@/lib/adminStore";
import { SectionHeader } from "./SectionHeader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

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
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Voile cantonné au bas : la photo reste lisible au repos et couvre un peu
          plus l'image au survol, le temps de dégager le libellé. */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent transition-all duration-300 group-hover:h-full group-hover:via-black/60 ${
          compact ? "h-1/2" : "h-2/3"
        }`}
      />
      <div className={`absolute inset-x-0 bottom-0 text-white ${compact ? "p-3" : "p-4"}`}>
        <div
          className={`text-shadow-overlay font-display font-bold uppercase leading-tight tracking-wide ${
            active
              ? /* Le bloc est ancré en bas : un nom long grandirait vers le haut et se
                   ferait rogner par la carte. D'où la taille progressive et le garde-fou. */
                "line-clamp-3 text-lg leading-tight sm:text-xl"
              : compact
                ? "text-xs leading-tight sm:text-sm"
                : "text-sm"
          }`}
        >
          {name}
        </div>
        {/* Le filet rouge de la marque : court au repos, il s'étire au survol. */}
        <span
          className={`mt-2 block h-1 rounded-full bg-accent-red transition-all duration-300 group-hover:w-16 ${
            active ? "w-16" : "w-8"
          }`}
        />
        {/* max-h plutôt qu'un simple opacity : le libellé pousse le titre vers le haut
            en s'ouvrant, glissement identique aux fiches À propos. */}
        <span
          className={`text-shadow-overlay flex items-center gap-1 overflow-hidden text-[11px] font-semibold uppercase tracking-wider text-white/90 transition-all duration-300 ${
            active
              ? "mt-2 max-h-6 opacity-100"
              : compact
                ? "mt-0 max-h-0 opacity-0"
                : "mt-0 max-h-0 opacity-0 group-hover:mt-2 group-hover:max-h-6 group-hover:opacity-100"
          }`}
        >
          Voir les produits <ArrowRight className="h-3 w-3" />
        </span>
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
  const { data: dbCategories } = useCategories();

  /** Admin-managed categories drive the carousel; the bundled list only covers the first paint
   *  and any fetch failure, so the section never renders empty. */
  const items: CategoryInfo[] = useMemo(() => {
    if (!dbCategories || dbCategories.length === 0) return fallbackCategories;
    return dbCategories.map((c) => ({
      slug: c.slug,
      category: c.name,
      name: c.name,
      image: c.image_url || categoryImage(c.slug),
      description: c.description,
    }));
  }, [dbCategories]);

  return (
    <section className={isShop ? "border-b bg-cream py-8" : "container-x py-20"}>
      {!isShop && <SectionHeader kicker="Nos rayons" title="Toutes les catégories" />}
      <Carousel
        opts={{ align: "start", loop: true }}
        className={isShop ? "mx-12 md:mx-16" : "mt-10 mx-10 md:mx-14"}
      >
        <CarouselContent className={isShop ? "-ml-3 items-center" : undefined}>
          {items.map((c, i) => (
            <CarouselItem
              key={c.category}
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  {isShop && onCategorySelect ? (
                    <button
                      type="button"
                      onClick={() => onCategorySelect(c.category)}
                      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl text-left shadow-sm transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]"
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
                      className="group block relative aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]"
                    >
                      <CategoryCardBody name={c.name} image={c.image} />
                    </Link>
                  )}
                </motion.div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className={isShop ? "-left-12 h-9 w-9 md:-left-14" : "-left-10 md:-left-14 h-10 w-10"}
        />
        <CarouselNext
          className={isShop ? "-right-12 h-9 w-9 md:-right-14" : "-right-10 md:-right-14 h-10 w-10"}
        />
      </Carousel>
      {variant === "home" && (
        <div className="mt-10 text-center">
          <Link
            to="/rubriques"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-bold uppercase tracking-wider transition hover:bg-ink hover:text-paper"
          >
            Découvrir tous les produits <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

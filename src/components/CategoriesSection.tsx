import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { categories as bundledCategories, categoryImage, type CategoryInfo } from "@/lib/products";
import { useCategories } from "@/lib/adminStore";
import { SectionHeader } from "./SectionHeader";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,} from "@/components/ui/carousel";

export function CategoryCardBody({
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
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"/>
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent transition-all duration-300 group-hover:h-full group-hover:via-black/60 ${ compact ? "h-1/2" : "h-2/3"}`} />
      <div className={`absolute inset-x-0 bottom-0 text-white ${compact ? "p-3" : "p-4"}`}>
        <div className={`text-shadow-overlay font-display font-bold uppercase leading-tight tracking-wide ${
            active
              ?
                "line-clamp-3 text-lg leading-tight sm:text-xl"
              : compact
                ? "text-xs leading-tight sm:text-sm"
                : "text-sm"
          }`}
        >
          {name}
        </div>
        <span
          className={`mt-2 block h-1 rounded-full bg-accent-red transition-all duration-300 group-hover:w-16 ${
            active ? "w-16" : "w-8"
          }`}
        />
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
  const items: CategoryInfo[] = useMemo(() => {
    if (isShop) return bundledCategories;
    if (!dbCategories || dbCategories.length === 0) return bundledCategories;
    return dbCategories.map((c) => ({
      slug: c.slug,
      category: c.name,
      name: c.name,
      image: c.image_url || categoryImage(c.slug),
      description: c.description,
    }));
  }, [dbCategories, isShop]);

  if (!isShop) {
    return (
      <section className="py-10 px-3 bg-paper">
        <SectionHeader kicker="Nos rayons" title="Toutes les catégories" animated />
        <CategoryCardsCarousel items={items} />
        <div className="mt-8 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-bold uppercase tracking-wider transition hover:bg-ink hover:text-paper"
          >
            Découvrir tous les produits <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b bg-cream py-8">
      <Carousel opts={{ align: "start", loop: true }} className="mx-12 md:mx-16">
        <CarouselContent className="-ml-3 items-center">
          {items.map((c, i) => (
            <CarouselItem
              key={c.category}
              className={`pl-3 transition-[flex-basis] duration-300 ${
                selectedCategory === c.category
                  ? "basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-[28%]"
                  : "basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              }`}
            >
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} >
                <button type="button" onClick={() => onCategorySelect?.(c.category)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl text-left shadow-sm transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]">
                  <CategoryCardBody
                    name={c.name}
                    image={c.image}
                    compact={selectedCategory !== c.category}
                    active={selectedCategory === c.category}
                  />
                </button>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-12 h-9 w-9 md:-left-14" />
        <CarouselNext className="-right-12 h-9 w-9 md:-right-14" />
      </Carousel>
    </section>
  );
}

export function CategoryCardsCarousel({ items }: { items: CategoryInfo[] }) {
  return (
    <Carousel opts={{ align: "start" }}>
      <div className="mb-4 flex justify-end gap-1">
        <CarouselPrevious variant="ghost" className="static h-9 w-9 translate-y-0" />
        <CarouselNext variant="ghost" className="static h-9 w-9 translate-y-0" />
      </div>
      <CarouselContent className="-ml-5">
        {items.map((c, i) => (
          <CarouselItem key={c.category} className="basis-[80%] pl-5 sm:basis-[45%] md:basis-[31%] lg:basis-[23.5%]">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} >
              <Link to="/categories" search={{ cat: c.category }} className="group relative block aspect-[7/10] overflow-hidden rounded-xl">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="text-shadow-overlay absolute inset-x-0 bottom-0 p-4 font-display text-2xl font-medium leading-tight text-white md:p-5 md:text-[1.7rem]">
                  {c.name}
                </h3>
              </Link>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

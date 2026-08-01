import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoriesSection } from "@/components/CategoriesSection";
import { useProducts } from "@/lib/adminStore";
import { type Category } from "@/lib/products";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, SlidersHorizontal } from "lucide-react";

const searchSchema = z.object({
  cat: z.string().optional(),
  subcat: z.string().optional(),
  q: z.string().optional(),
});

type Search = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/rubriques")({
  validateSearch: searchSchema,
  component: Shop,
  head: () => ({
    meta: [
      { title: "Boutique   Souss Droguerie" },
      { name: "description", content: "Catalogue complet de matériaux de construction : carrelage, marbre, peinture, ciment, plomberie et plus." },
    ],
  }),
});

type SubcatTab = { label: string; value: string | undefined };

function Shop() {
  const { cat: urlCat, subcat: urlSubcat, q: urlQ } = Route.useSearch();
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useProducts();
  const activeCat = (urlCat as Category) || undefined;
  const activeSubcat = urlSubcat || undefined;
  const [query, setQuery] = useState(urlQ || "");
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const productList = useMemo(() => (products || []) as unknown as any[], [products]);

  const subcategories = useMemo(() => {
    if (!activeCat) return [];
    const values = new Set<string>();
    productList.forEach((p: any) => {
      if (p.category === activeCat && p.subcategory) {
        values.add(p.subcategory);
      }
    });
    return Array.from(values).sort();
  }, [activeCat, productList]);

  /** Only shown once a category is picked: its subcategories. Picking the category
   *  itself happens on the cards above, so the chips never repeat them. */
  const tabs: SubcatTab[] = useMemo(() => {
    if (!activeCat || subcategories.length === 0) return [];
    return [
      { label: "Toutes", value: undefined } as SubcatTab,
      ...subcategories.map((s) => ({ label: s, value: s })),
    ];
  }, [activeCat, subcategories]);

  const activeTab = activeSubcat;

  const filtered = useMemo(() => {
    let list = productList;
    if (activeCat) list = list.filter((p: any) => p.category === activeCat);
    if (activeSubcat) list = list.filter((p: any) => p.subcategory === activeSubcat);
    if (query.trim())
      list = list.filter((p: any) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );
    if (sort === "asc") list = [...list].sort((a: any, b: any) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a: any, b: any) => b.price - a.price);
    return list;
  }, [productList, activeCat, activeSubcat, query, sort]);

  const handleCategorySelect = useCallback(
    (category: string) => {
      if (category === activeCat) {
        navigate({ search: (prev: Search) => ({ ...prev, cat: undefined, subcat: undefined }) });
      } else {
        navigate({ search: (prev: Search) => ({ ...prev, cat: category, subcat: undefined }) });
      }
    },
    [activeCat, navigate],
  );

  const handleTabClick = useCallback(
    (value: string | undefined) => {
      navigate({ search: (prev: Search) => ({ ...prev, subcat: value }) });
    },
    [navigate],
  );

  return (
    <Layout>
      <section className="relative overflow-hidden bg-brand-secondary text-paper">
        <div className="container-x relative py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/50">
                <Link to="/" className="transition hover:text-paper">
                  Accueil
                </Link>
                <span>/</span>
                <span className="text-sky">Boutique</span>
              </nav>

              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
                Boutique
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
              <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
                Matériaux, outillage et finitions sélectionnés pour tous vos projets de
                construction dans le Souss.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <CategoriesSection
        variant="shop"
        onCategorySelect={handleCategorySelect}
        selectedCategory={activeCat}
      />

      <div className="sticky top-20 z-30 w-full border-b bg-paper/95 py-4 backdrop-blur md:py-5">
        <div className="container-x flex items-center justify-between md:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div
          className={`container-x ${filtersOpen ? "mt-4 flex" : "hidden"} flex-col gap-4 md:mt-0 md:flex md:flex-row md:items-center md:justify-between`}
        >
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-full border border-border bg-paper py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-full border border-border bg-paper px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="default">Trier par défaut</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>

        {tabs.length > 0 && (
          <CatTabs open={filtersOpen}>
            {tabs.map((tab) => (
              <CatChip
                key={tab.label}
                active={tab.value === activeTab}
                onClick={() => handleTabClick(tab.value)}
              >
                {tab.label}
              </CatChip>
            ))}
          </CatTabs>
        )}
      </div>

      <div className="container-x py-10">
        {isError && (
          <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm font-semibold text-accent-red">
            Erreur de chargement. Veuillez réessayer.
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : filtered.length > 0 ? (
          <ProductGrid items={filtered as any} />
        ) : (
          <div className="rounded-2xl border-2 border-dashed py-20 text-center text-ink-soft">
            Aucun produit ne correspond à votre recherche.
          </div>
        )}
      </div>
    </Layout>
  );
}


/** Two 36px arrow buttons plus the flex gaps around them. */
const ARROWS_WIDTH = 88;

function CatTabs({ open, children }: { open: boolean; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [scrollable, setScrollable] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    setScrollable((shown) =>
      shown
        ? el.scrollWidth > el.clientWidth + ARROWS_WIDTH
        : el.scrollWidth > el.clientWidth + 1,
    );
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateArrows]);

  useEffect(updateArrows);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const delta = dir * Math.max(200, el.clientWidth * 0.7);
    const target = Math.min(max, Math.max(0, el.scrollLeft + delta));
    el.scrollTo({ left: target, behavior: "smooth" });
    setCanLeft(target > 1);
    setCanRight(target < max - 1);
  };

  return (
    <div className={`container-x mt-4 ${open ? "flex" : "hidden"} items-center gap-2 md:flex`}>
      {scrollable && (
        <button
          type="button"
          aria-label="Catégories précédentes"
          onClick={() => scrollBy(-1)}
          disabled={!canLeft}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-paper text-ink transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex flex-1 gap-2 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {children}
      </div>

      {scrollable && (
        <button
          type="button"
          aria-label="Catégories suivantes"
          onClick={() => scrollBy(1)}
          disabled={!canRight}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-paper text-ink transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
        active
          ? "bg-ink text-paper"
          : "border border-border bg-paper text-ink hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { useAdminStore } from "@/lib/adminStore";
import { categories, type Category } from "@/lib/products";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

const searchSchema = z.object({
  cat: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  component: Shop,
  head: () => ({
    meta: [
      { title: "Boutique   Droguerie Souss" },
      { name: "description", content: "Catalogue complet de matériaux de construction : carrelage, marbre, peinture, ciment, plomberie et plus." },
    ],
  }),
});

function Shop() {
  const { cat: initialCat, q: initialQ } = Route.useSearch();
  const products = useAdminStore((s) => s.products);
  const [activeCat, setActiveCat] = useState<Category | "all">(
    (initialCat as Category) || "all",
  );
  const [query, setQuery] = useState(initialQ || "");
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCat !== "all") list = list.filter((p) => p.category === activeCat);
    if (query.trim())
      list = list.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCat, query, sort]);

  return (
    <Layout>
      <div className="bg-gradient-to-br from-brand to-brand-dark py-16 text-paper">
        <div className="container-x">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky">
              Notre catalogue
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase sm:text-5xl md:text-6xl">
              Boutique
            </h1>
            <p className="mt-3 max-w-xl text-paper/80">
              {products.length} produits sélectionnés pour tous vos projets de construction.
            </p>
          </motion.div>
        </div>
      </div>

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

        <div
          className={`container-x mt-4 ${filtersOpen ? "flex" : "hidden"} gap-2 overflow-x-auto no-scrollbar md:flex`}
        >
          <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
            Toutes ({products.length})
          </CatChip>
          {categories.map((c) => (
            <CatChip
              key={c.slug}
              active={activeCat === c.category}
              onClick={() => setActiveCat(c.category)}
            >
              {c.name}
            </CatChip>
          ))}
        </div>
      </div>

      <div className="container-x py-10">
        {filtered.length > 0 ? (
          <ProductGrid items={filtered} />
        ) : (
          <div className="rounded-2xl border-2 border-dashed py-20 text-center text-ink-soft">
            Aucun produit ne correspond à votre recherche.
          </div>
        )}
      </div>
    </Layout>
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

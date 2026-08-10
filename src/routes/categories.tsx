import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoriesSection } from "@/components/CategoriesSection";
import { useProducts, useSubcategories } from "@/lib/adminStore";
import { categories, categoryGroup, type Category } from "@/lib/products";
import { searchProducts } from "@/lib/search";
import { seo, jsonLd, canonical } from "@/lib/seo";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, SlidersHorizontal } from "lucide-react";

const searchSchema = z.object({
  cat: z.string().optional(),
  subcat: z.string().optional(),
  q: z.string().optional(),
});

type Search = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/categories")({
  validateSearch: searchSchema,
  component: Shop,
  head: ({ match }) => {
    // Le contexte head n'expose pas `search` directement : il est porté par le match.
    const search = (match.search ?? {}) as { cat?: string; subcat?: string; q?: string };
    const cat = search.cat;
    const q = search.q;
    const catInfo = categories.find((c) => c.category === cat);
    // Facettes : le canonical ne garde que la catégorie (les sous-catégories et la
    // recherche sont des variantes du même contenu, elles ne doivent pas être
    // indexées séparément). La recherche (?q=) est en plus marquée noindex.
    const catPath = cat ? `?cat=${encodeURIComponent(cat)}` : "";
    return seo({
      title: catInfo
        ? `${catInfo.name} à Agadir chez Souss Droguerie`
        : "Droguerie & Matériaux de construction à Agadir | Souss Droguerie",
      description: catInfo
        ? `Achetez ${catInfo.name.toLowerCase()} à Agadir chez Souss Droguerie : ${catInfo.description}. Devis gratuit sous 48h, livraison dans tout le Souss.`
        : "Souss Droguerie (Droguerie Souss) : droguerie et catalogue complet de matériaux de construction à Agadir. Carrelage, marbre, zellige, peinture, ciment, plomberie, électricité et quincaillerie. Devis gratuit sous 48h.",
      path: `/categories${catPath}`,
      noindex: !!q,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: canonical("/") },
            { "@type": "ListItem", position: 2, name: "Boutique", item: canonical("/categories") },
            ...(cat
              ? [
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: catInfo?.name ?? cat,
                    item: canonical(`/categories?cat=${encodeURIComponent(cat)}`),
                  },
                ]
              : []),
          ],
        }),
      ],
    });
  },
});

type SubcatTab = { label: string; value: string | undefined; count: number };

function Shop() {
  const { cat: urlCat, subcat: urlSubcat, q: urlQ } = Route.useSearch();
  // Fiche de la catégorie sélectionnée : alimente le H1, le texte SEO et les liens
  // internes vers les autres rayons (undefined si ?cat= est absent ou inconnu).
  const catInfo = urlCat ? categories.find((c) => c.category === urlCat) : undefined;
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useProducts();
  const { data: dbSubcategories } = useSubcategories();
  const activeCat = (urlCat as Category) || undefined;
  const activeSubcat = urlSubcat || undefined;
  const [query, setQuery] = useState(urlQ || "");
  const [sort, setSort] = useState<"default" | "asc" | "desc">("default");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const productList = useMemo(() => (products || []) as unknown as any[], [products]);

  /** The pool the chips count from: everything the category and the search leave standing,
   *  before the subcategory filter. Each chip's number is therefore what clicking it yields.
   *  The search ranks matches across name, description and subcategory, accent-insensitive. */
  /** Une carte de vitrine peut recouvrir plusieurs categories de l'admin (Carrelage &
   *  Zellige regroupe Carrelage, Ceramique et Zellige) : on filtre sur le groupe entier. */
  const activeGroup = useMemo(() => (activeCat ? categoryGroup(activeCat) : []), [activeCat]);

  const catFiltered = useMemo(() => {
    let list = productList;
    if (activeCat) list = list.filter((p: any) => activeGroup.includes(p.category));
    if (query.trim())
      list = searchProducts(list, query).map((r) => r.product);
    return list;
  }, [productList, activeCat, activeGroup, query]);

  /** Admin-managed subcategories come first, in the order the admin sees them, and only when
   *  they actually hold products. Anything a product carries outside that list still gets a chip
   *  so no product becomes unreachable. */
  const subcategories = useMemo(() => {
    if (!activeCat) return [];
    const counts = new Map<string, number>();
    catFiltered.forEach((p: any) => {
      if (p.subcategory) counts.set(p.subcategory, (counts.get(p.subcategory) ?? 0) + 1);
    });
    const managed = (dbSubcategories || [])
      .filter((s) => activeGroup.includes(s.category))
      .map((s) => s.name);
    const unmanaged = Array.from(counts.keys())
      .filter((name) => !managed.includes(name))
      .sort();
    const names = [...managed.filter((name) => counts.has(name)), ...unmanaged];
    /** A search can empty the selected subcategory — keep its chip so the active filter
     *  never disappears out from under the user. */
    if (activeSubcat && !names.includes(activeSubcat)) names.push(activeSubcat);
    return names.map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [activeCat, activeGroup, activeSubcat, catFiltered, dbSubcategories]);

  /** Only shown once a category is picked: its subcategories. Picking the category
   *  itself happens on the cards above, so the chips never repeat them. */
  const tabs: SubcatTab[] = useMemo(() => {
    if (!activeCat || subcategories.length === 0) return [];
    return [
      { label: "Toutes", value: undefined, count: catFiltered.length } as SubcatTab,
      ...subcategories.map((s) => ({ label: s.name, value: s.name, count: s.count })),
    ];
  }, [activeCat, subcategories, catFiltered]);

  const activeTab = activeSubcat;

  const filtered = useMemo(() => {
    let list = catFiltered;
    if (activeSubcat) list = list.filter((p: any) => p.subcategory === activeSubcat);
    if (sort === "asc") list = [...list].sort((a: any, b: any) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a: any, b: any) => b.price - a.price);
    return list;
  }, [catFiltered, activeSubcat, sort]);

  const handleCategorySelect = useCallback(
    (category: string) => {
      if (category === activeCat) {
        navigate({
          to: "/categories",
          search: (prev: Search) => ({ ...prev, cat: undefined, subcat: undefined }),
        });
      } else {
        /** resetScroll: false — the router's scroll reset would otherwise cancel the jump below. */
        navigate({
          to: "/categories",
          search: (prev: Search) => ({ ...prev, cat: category, subcat: undefined }),
          resetScroll: false,
        });
        /** Next frame, so the filtered grid has laid out before we scroll to it. */
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    },
    [activeCat, navigate],
  );

  const handleTabClick = useCallback(
    (value: string | undefined) => {
      navigate({ to: "/categories", search: (prev: Search) => ({ ...prev, subcat: value }) });
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
                {catInfo ? `${catInfo.name} à Agadir` : "Boutique"}
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
              <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
                {catInfo
                  ? `${catInfo.description}. Achetez en ligne ou demandez un devis gratuit : livraison dans tout le Souss sous 48h.`
                  : "Matériaux, outillage et finitions sélectionnés pour tous vos projets de construction dans le Souss."}
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
                count={tab.count}
                onClick={() => handleTabClick(tab.value)}
              >
                {tab.label}
              </CatChip>
            ))}
          </CatTabs>
        )}
      </div>

      {/* scroll-mt clears the sticky header + filter bar when we jump here on category select. */}
      <div ref={resultsRef} className="container-x scroll-mt-[14rem] py-10">
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

      {/* Texte SEO + maillage interne : visible uniquement sur une catégorie précise.
          Rédigé pour les visiteurs (contexte, conseil, NAP), jamais pour bourrer des
          mots-clés. L'ItemList est rendu côté client une fois les produits chargés. */}
      {catInfo && (
        <section className="border-t border-border/60 bg-cream/50">
          <div className="container-x py-14">
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl font-bold uppercase leading-tight text-ink sm:text-3xl">
                {catInfo.name} à Agadir : notre expertise
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">{catInfo.seoText}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
                Besoin d'un conseil ou d'un devis ? Appelez le{" "}
                <a href="tel:+212528838992" className="font-semibold text-brand underline-offset-4 hover:underline">
                  +212 528 838 992
                </a>{" "}
                ou{" "}
                <Link to="/contact" className="font-semibold text-brand underline-offset-4 hover:underline">
                  contactez-nous
                </Link>{" "}
                : réponse sous 48h ouvrées.
              </p>
            </div>

            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                Autres rayons de la droguerie
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories
                  .filter((c) => c.category !== catInfo.category)
                  .map((c) => (
                    <Link
                      key={c.category}
                      to="/categories"
                      search={{ cat: c.category }}
                      className="rounded-full border border-border bg-paper px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink transition hover:border-brand hover:text-brand"
                    >
                      {c.name}
                    </Link>
                  ))}
              </div>
            </div>

            {filtered.length > 0 && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    name: `${catInfo.name} à Agadir`,
                    url: canonical(`/categories?cat=${encodeURIComponent(catInfo.category)}`),
                    numberOfItems: filtered.length,
                    itemListElement: filtered.slice(0, 30).map((p: any, i: number) => ({
                      "@type": "ListItem",
                      position: i + 1,
                      name: p.name,
                      url: canonical(`/product/${p.id}`),
                    })),
                  }).replace(/</g, "\\u003c"),
                }}
              />
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}


/** Two 40px arrow buttons plus the flex gaps around them. */
const ARROWS_WIDTH = 96;

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
          aria-label="Sous-catégories précédentes"
          onClick={() => scrollBy(-1)}
          disabled={!canLeft}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-paper text-ink transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
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
          aria-label="Sous-catégories suivantes"
          onClick={() => scrollBy(1)}
          disabled={!canRight}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-paper text-ink transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function CatChip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
        active
          ? "bg-ink text-paper"
          : "border border-border bg-paper text-ink hover:border-brand hover:text-brand"
      }`}
    >
      {children}
      {/* The count rides the active chip only, so the bar stays quiet until you pick something. */}
      {active && <span className="ml-1.5 font-bold">({count})</span>}
    </button>
  );
}

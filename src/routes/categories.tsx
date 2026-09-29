import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { ProductGrid } from "@/components/ProductGrid";
import { CategorySpotlight } from "@/components/CategorySpotlight";
import { CategoriesSection } from "@/components/CategoriesSection";
import { SectionHeader } from "@/components/SectionHeader";
import { ShopSidebar } from "@/components/ShopSidebar";
import { useProducts, useSubcategories } from "@/lib/adminStore";
import { BUSINESS } from "@/lib/contact";
import { categories, categoryGroup, type Category } from "@/lib/products";
import { searchProducts } from "@/lib/search";
import { seo, jsonLd, canonical } from "@/lib/seo";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import heroImg from "@/assets/categorie-hero.png";

const searchSchema = z.object({
  cat: z.string().optional(),
  subcat: z.string().optional(),
  q: z.string().optional(),
  bestseller: z.boolean().optional(),
  page: z.number().int().min(2).optional().catch(undefined),
});

const PAGE_SIZE = 12;

type Search = z.infer<typeof searchSchema>;

const HEADER_HEIGHT = 80;

export const Route = createFileRoute("/categories")({
  validateSearch: searchSchema,
  component: Shop,
  head: ({ match }) => {
    const search = (match.search ?? {}) as Search;
    const cat = search.cat;
    const q = search.q;
    const catInfo = categories.find((c) => c.category === cat);
    const bestTitle = search.bestseller && !catInfo ? "Best-sellers | " : "";
    const catPath = cat ? `?cat=${encodeURIComponent(cat)}` : "";
    return seo({
      title: catInfo
        ? `${catInfo.name} à Agadir chez Souss Droguerie`
        : `${bestTitle}Droguerie & Matériaux de construction à Agadir | Souss Droguerie`,
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
        jsonLd({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: catInfo
            ? `${catInfo.name} à Agadir | Souss Droguerie`
            : "Boutique | Souss Droguerie",
          url: canonical(`/categories${catPath}`),
          inLanguage: "fr-FR",
          speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
        }),
      ],
    });
  },
});

type SubcatTab = { label: string; value: string | undefined; count: number };

function Shop() {
  const { cat: urlCat, subcat: urlSubcat, q: urlQ, bestseller, page: urlPage } = Route.useSearch();
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
  const cardsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(88);
  const [pastCards, setPastCards] = useState(false);
  const productList = useMemo(() => (products || []) as unknown as any[], [products]);
  const activeGroup = useMemo(() => (activeCat ? categoryGroup(activeCat) : []), [activeCat]);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setPastCards(
          !entry.isIntersecting && entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0),
        ),
      { rootMargin: `-${HEADER_HEIGHT + barHeight}px 0px 0px 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [barHeight]);

  const categoryCounts = useMemo(() => {
    let list = productList;
    if (bestseller) list = list.filter((p: any) => p.bestseller);
    if (query.trim()) list = searchProducts(list, query).map((r) => r.product);
    const counts = new Map(
      categories.map((c) => {
        const group = categoryGroup(c.category);
        return [c.category, list.filter((p: any) => group.includes(p.category)).length];
      }),
    );
    return { counts, total: list.length };
  }, [productList, bestseller, query]);

  const catFiltered = useMemo(() => {
    let list = productList;
    if (bestseller) list = list.filter((p: any) => p.bestseller);
    if (activeCat) list = list.filter((p: any) => activeGroup.includes(p.category));
    if (query.trim()) list = searchProducts(list, query).map((r) => r.product);
    return list;
  }, [productList, bestseller, activeCat, activeGroup, query]);

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
    if (activeSubcat && !names.includes(activeSubcat)) names.push(activeSubcat);
    return names.map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [activeCat, activeGroup, activeSubcat, catFiltered, dbSubcategories]);

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(urlPage ?? 1, pageCount);
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const resetPage = useCallback(() => {
    if (!urlPage) return;
    navigate({
      to: "/categories",
      search: (prev: Search) => ({ ...prev, page: undefined }),
      replace: true,
      resetScroll: false,
    });
  }, [urlPage, navigate]);

  const handleCategorySelect = useCallback(
    (category: string) => {
      if (category === activeCat) {
        navigate({
          to: "/categories",
          search: (prev: Search) => ({
            ...prev,
            cat: undefined,
            subcat: undefined,
            page: undefined,
          }),
        });
      } else {
        navigate({
          to: "/categories",
          search: (prev: Search) => ({
            ...prev,
            cat: category,
            subcat: undefined,
            page: undefined,
          }),
          resetScroll: false,
        });
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    },
    [activeCat, navigate],
  );

  const backToResults = useCallback(() => {
    requestAnimationFrame(() => {
      const el = resultsRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < parseFloat(getComputedStyle(el).scrollMarginTop)) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  const selectCategory = useCallback(
    (category?: string) => {
      navigate({
        to: "/categories",
        search: (prev: Search) => ({ ...prev, cat: category, subcat: undefined, page: undefined }),
        resetScroll: false,
      });
      backToResults();
    },
    [navigate, backToResults],
  );

  /** Les sous-categories sont dans la barre collante : meme comportement. */
  const handleTabClick = useCallback(
    (value: string | undefined) => {
      navigate({
        to: "/categories",
        search: (prev: Search) => ({ ...prev, subcat: value, page: undefined }),
        resetScroll: false,
      });
      backToResults();
    },
    [navigate, backToResults],
  );

  const toggleBestseller = useCallback(() => {
    navigate({
      to: "/categories",
      search: (prev: Search) => ({
        ...prev,
        bestseller: prev.bestseller ? undefined : true,
        page: undefined,
      }),
      resetScroll: false,
    });
  }, [navigate]);

  return (
    <Layout>
      {/* Photo du rayon choisi, sinon celle de la droguerie. */}
      <PageHero
        image={catInfo?.image ?? heroImg}
        crumb="Boutique"
        title={catInfo ? `${catInfo.name} à Agadir` : bestseller ? "Best-sellers" : "Boutique"}
      >
        {catInfo
          ? `${catInfo.description}. Achetez en ligne ou demandez un devis gratuit : livraison dans tout le Souss sous 48h.`
          : bestseller
            ? "Les produits les plus demandés par nos clients, disponibles à la droguerie et livrés dans tout le Souss."
            : "Matériaux, outillage et finitions sélectionnés pour tous vos projets de construction dans le Souss."}
      </PageHero>

      <div ref={cardsRef}>
        <CategoriesSection
          variant="shop"
          onCategorySelect={handleCategorySelect}
          selectedCategory={activeCat}
        />
      </div>

      <div
        ref={barRef}
        className="sticky top-20 z-30 w-full border-b bg-paper/95 py-4 backdrop-blur md:py-5"
      >
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
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div
          className={`container-x ${filtersOpen ? "mt-4 flex" : "hidden"} flex-col gap-4 md:mt-0 md:flex md:flex-row md:items-center md:justify-between`}
        >
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
              placeholder="Rechercher un produit..."
              className="w-full rounded-full border border-border bg-paper py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Le filtre d'arrivee depuis l'accueil reste visible, et se retire d'un clic. */}
            <CatChip active={!!bestseller} onClick={toggleBestseller}>
              Best-sellers
            </CatChip>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as typeof sort);
                resetPage();
              }}
              className="flex-1 rounded-full border border-border bg-paper px-4 py-3 text-sm outline-none focus:border-brand md:flex-none"
            >
              <option value="default">Trier par défaut</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {pastCards && (
          <div className={`${filtersOpen ? "block" : "hidden md:block"} lg:hidden`}>
            <CatTabs open>
              <CatChip
                active={!activeCat}
                count={categoryCounts.total}
                onClick={() => selectCategory(undefined)}
              >
                Tous les rayons
              </CatChip>
              {categories.map((c) => (
                <CatChip
                  key={c.category}
                  active={activeCat === c.category}
                  count={categoryCounts.counts.get(c.category)}
                  onClick={() => selectCategory(c.category)}
                >
                  {c.name}
                </CatChip>
              ))}
            </CatTabs>
          </div>
        )}

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

      <div
        id="produits"
        ref={resultsRef}
        style={{ scrollMarginTop: HEADER_HEIGHT + barHeight }}
        className="container-x py-10 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-10"
      >
        <aside className="hidden lg:block">
          <div
            style={{
              top: HEADER_HEIGHT + barHeight + 24,
              maxHeight: `calc(100vh - ${HEADER_HEIGHT + barHeight + 48}px)`,
            }}
            className="no-scrollbar sticky overflow-y-auto overscroll-contain"
          >
            <AnimatePresence>
              {pastCards && (
                <ShopSidebar
                  items={categories}
                  active={activeCat}
                  counts={isLoading ? undefined : categoryCounts.counts}
                  total={isLoading ? undefined : categoryCounts.total}
                  onSelect={selectCategory}
                />
              )}
            </AnimatePresence>
          </div>
        </aside>

        <div className="min-w-0">
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
            <>
              <ProductGrid items={pageItems as any} />
              {pageCount > 1 && (
                <Pagination
                  page={currentPage}
                  pageCount={pageCount}
                  total={filtered.length}
                  onNavigate={backToResults}
                />
              )}
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed py-20 text-center text-ink-soft">
              Aucun produit ne correspond à votre recherche.
            </div>
          )}
        </div>
      </div>

      {catInfo && (
        <section className="border-t border-border/60 bg-cream">
          <div className="container-x py-16 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:gap-24">
              <div>
                <SectionHeader
                  key={catInfo.category}
                  kicker="Notre expertise"
                  title={`${catInfo.name} à Agadir`}
                  align="left"
                  animated
                />
                {catInfo.seoText && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base"
                  >
                    {catInfo.seoText}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      to="/commande-rapide"
                      className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
                    >
                      Demander un devis
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                    <a
                      href={BUSINESS.phoneHref}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
                    >
                      <Phone className="h-4 w-4" /> {BUSINESS.phoneDisplay}
                    </a>
                  </div>
                  <p className="mt-5 text-sm text-ink-soft">
                    Conseil et devis gratuits, réponse sous {BUSINESS.quoteSla} ·{" "}
                    <Link
                      to="/contact"
                      className="font-semibold text-brand underline-offset-4 hover:underline"
                    >
                      Nous écrire
                    </Link>
                  </p>
                </motion.div>
              </div>
              <CategorySpotlight
                key={catInfo.category}
                items={categories.filter((c) => c.category !== catInfo.category)}
                title="Autres rayons de la droguerie"
              />
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
      shown ? el.scrollWidth > el.clientWidth + ARROWS_WIDTH : el.scrollWidth > el.clientWidth + 1,
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
  count?: number;
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
      {active && count !== undefined && <span className="ml-1.5 font-bold">({count})</span>}
    </button>
  );
}

/** Numeros affiches : tous jusqu'a sept pages ; au-dela, toujours sept cases (premiere,
 *  derniere, la page courante et ses voisines, des points pour le reste), pour que la barre
 *  ne change pas de largeur d'une page a l'autre. */
function pageNumbers(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "gap", count];
  if (page >= count - 3) return [1, "gap", count - 4, count - 3, count - 2, count - 1, count];
  return [1, "gap", page - 1, page, page + 1, "gap", count];
}

/**
 * Pagination de la grille : de vrais liens (`?page=`), ouvrables dans un onglet et que le
 * bouton retour du navigateur sait defaire. Sans remise en haut de page : `onNavigate`
 * ramene la grille sous la barre de filtres. Sur telephone, les numeros laissent la place
 * a « Page x / n » entre les deux fleches.
 *
 * `activeOptions.exact` : par defaut le routeur compare la recherche en partie et
 * marquerait « 1 » et « Precedent » comme page courante (`aria-current`) sur toute page.
 */
function Pagination({
  page,
  pageCount,
  total,
  onNavigate,
}: {
  page: number;
  pageCount: number;
  total: number;
  onNavigate: () => void;
}) {
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);
  const search = (p: number) => (prev: Search) => ({ ...prev, page: p > 1 ? p : undefined });
  const arrow =
    "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold uppercase tracking-wider text-ink transition md:px-5";

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-col items-center gap-4">
      <p className="text-sm text-ink-soft">
        Produits{" "}
        <span className="font-semibold tabular-nums text-ink">
          {first}–{last}
        </span>{" "}
        sur <span className="font-semibold tabular-nums text-ink">{total}</span>
      </p>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {page > 1 ? (
          <Link
            to="/categories"
            search={search(page - 1)}
            resetScroll={false}
            activeOptions={{ exact: true }}
            onClick={onNavigate}
            rel="prev"
            aria-label="Page précédente"
            className={`${arrow} hover:border-ink hover:bg-ink hover:text-paper`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:inline">Précédent</span>
          </Link>
        ) : (
          <span aria-hidden="true" className={`${arrow} opacity-30`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden md:inline">Précédent</span>
          </span>
        )}

        <span className="px-3 text-sm font-semibold tabular-nums text-ink sm:hidden">
          Page {page} / {pageCount}
        </span>

        <ol className="hidden items-center gap-1.5 sm:flex">
          {pageNumbers(page, pageCount).map((n, i) =>
            n === "gap" ? (
              <li key={`gap-${i}`} aria-hidden="true" className="w-6 text-center text-ink-soft">
                …
              </li>
            ) : (
              <li key={n}>
                <Link
                  to="/categories"
                  search={search(n)}
                  resetScroll={false}
                  activeOptions={{ exact: true }}
                  onClick={onNavigate}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? "page" : undefined}
                  className={`grid h-11 min-w-11 place-items-center rounded-full px-2 text-sm font-bold tabular-nums transition ${
                    n === page
                      ? "bg-brand-secondary text-paper shadow-[var(--shadow-card)]"
                      : "text-ink hover:bg-cream"
                  }`}
                >
                  {n}
                </Link>
              </li>
            ),
          )}
        </ol>

        {page < pageCount ? (
          <Link
            to="/categories"
            search={search(page + 1)}
            resetScroll={false}
            activeOptions={{ exact: true }}
            onClick={onNavigate}
            rel="next"
            aria-label="Page suivante"
            className={`${arrow} hover:border-ink hover:bg-ink hover:text-paper`}
          >
            <span className="hidden md:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span aria-hidden="true" className={`${arrow} opacity-30`}>
            <span className="hidden md:inline">Suivant</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoriesSection } from "@/components/CategoriesSection";
import { ShopSidebar } from "@/components/ShopSidebar";
import { useProducts, useSubcategories } from "@/lib/adminStore";
import { categories, categoryGroup, type Category } from "@/lib/products";
import { searchProducts } from "@/lib/search";
import { seo, jsonLd, canonical } from "@/lib/seo";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import heroImg from "@/assets/hero-3.jpg";

const searchSchema = z.object({
  cat: z.string().optional(),
  subcat: z.string().optional(),
  q: z.string().optional(),
  bestseller: z.boolean().optional(),
});

type Search = z.infer<typeof searchSchema>;

/** Hauteur de l'en-tete du site (`h-20`), sous lequel colle la barre de filtres. */
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
  const { cat: urlCat, subcat: urlSubcat, q: urlQ, bestseller } = Route.useSearch();
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

  /** Hauteur de la barre de filtres collante : elle varie (sous-categories, panneau mobile)
   *  et fixe a la fois le seuil ou le carrousel est depasse et le haut de la colonne. */
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /** Le carrousel des rayons est depasse quand son bas passe sous l'en-tete et la barre de
   *  filtres : la colonne laterale (bureau) et la rangee de rayons (mobile) prennent le relais,
   *  et s'effacent quand on remonte jusqu'a lui. */
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

  /** Produits par rayon avec la recherche et le filtre best-sellers en cours, hors rayon :
   *  ce que chaque entree de la colonne donnerait si on la choisissait. */
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

  const handleCategorySelect = useCallback(
    (category: string) => {
      if (category === activeCat) {
        navigate({
          to: "/categories",
          search: (prev: Search) => ({ ...prev, cat: undefined, subcat: undefined }),
        });
      } else {
        /** resetScroll: false - the router's scroll reset would otherwise cancel the jump below. */
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

  /** Apres un filtre choisi en cours de defilement : si la grille est deja entamee, on
   *  ramene son debut sous la barre ; sinon la page ne bouge pas. Image suivante, pour que
   *  la grille filtree soit en place. */
  const backToResults = useCallback(() => {
    requestAnimationFrame(() => {
      const el = resultsRef.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < parseFloat(getComputedStyle(el).scrollMarginTop)) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  /** Choix d'un rayon depuis la colonne ou la rangee de rayons : sans remise en haut de
   *  page (le routeur la ferait par defaut), la grille filtree reste sous les yeux. */
  const selectCategory = useCallback(
    (category?: string) => {
      navigate({
        to: "/categories",
        search: (prev: Search) => ({ ...prev, cat: category, subcat: undefined }),
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
        search: (prev: Search) => ({ ...prev, subcat: value }),
        resetScroll: false,
      });
      backToResults();
    },
    [navigate, backToResults],
  );

  const toggleBestseller = useCallback(() => {
    navigate({
      to: "/categories",
      search: (prev: Search) => ({ ...prev, bestseller: prev.bestseller ? undefined : true }),
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
              onChange={(e) => setQuery(e.target.value)}
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
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="flex-1 rounded-full border border-border bg-paper px-4 py-3 text-sm outline-none focus:border-brand md:flex-none"
            >
              <option value="default">Trier par défaut</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Sous `lg`, pas de colonne laterale : une fois le carrousel depasse, les rayons
            passent en rangee dans la barre (dans le panneau « Filtres » sur telephone). */}
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

      {/* scroll-mt clears the sticky header + filter bar when we jump here on category select,
          or arrive through `#produits` (the home page "Voir tous" links). */}
      {/* La marge de defilement suit la barre collante : un saut ici (rayon choisi, lien
          `#produits` de l'accueil) pose la grille juste dessous. En `lg`, la colonne des
          rayons est toujours reservee : son apparition ne fait pas sauter la grille. */}
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
            <ProductGrid items={filtered as any} />
          ) : (
            <div className="rounded-2xl border-2 border-dashed py-20 text-center text-ink-soft">
              Aucun produit ne correspond à votre recherche.
            </div>
          )}
        </div>
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
              <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
                {catInfo.seoText}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
                Besoin d'un conseil ou d'un devis ? Appelez le{" "}
                <a
                  href="tel:+212528838992"
                  className="font-semibold text-brand underline-offset-4 hover:underline"
                >
                  +212 528 838 992
                </a>{" "}
                ou{" "}
                <Link
                  to="/contact"
                  className="font-semibold text-brand underline-offset-4 hover:underline"
                >
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

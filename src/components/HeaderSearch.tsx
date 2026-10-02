import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { useProducts } from "@/lib/adminStore";
import { categories, type Product } from "@/lib/products";
import { searchProducts } from "@/lib/search";
import { cn } from "@/lib/utils";

/** Produits proposes sous le champ ; le reste est dans la boutique. */
const MAX_RESULTS = 5;
const EASE = [0.22, 1, 0.36, 1] as const;

const panel = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: EASE },
};

/**
 * Recherche de l'en-tete. Des `lg`, un champ en pastille dans la barre, avec ses resultats
 * deroules dessous ; avant, une loupe qui ouvre le champ sous la barre, sur toute la largeur.
 *
 * A chaque frappe, les produits les plus proches sont proposes (meme classement que la
 * boutique) ; champ vide, ce sont les rayons. Entree, ou « Voir tous », mene a la boutique
 * filtree sur la recherche. Fleches haut / bas pour parcourir, Echap pour refermer.
 *
 * `transparent` : l'en-tete survole un bandeau sombre, le champ passe en verre depoli.
 */
export function HeaderSearch({ transparent }: { transparent: boolean }) {
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });
  const { data: products } = useProducts();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetInput = useRef<HTMLInputElement>(null);
  const id = useId();

  const term = query.trim();
  const matches = useMemo(
    () => searchProducts((products || []) as Product[], term).map((r) => r.product),
    [products, term],
  );
  const shown = matches.slice(0, MAX_RESULTS);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  // Refermee et videe a chaque changement de page.
  useEffect(() => {
    setOpen(false);
    setActive(-1);
    setQuery("");
  }, [href]);

  useEffect(() => {
    if (!open) return;
    // Volet mobile : le champ prend la main des l'ouverture (sans effet sur grand ecran, ou
    // ce champ-la n'est pas affiche).
    sheetInput.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const picked = shown[active];
    if (picked) navigate({ to: "/product/$id", params: { id: picked.id } });
    else if (term)
      navigate({
        to: "/categories",
        search: { q: term },
        hash: "produits",
        hashScrollIntoView: { behavior: "instant", block: "start" },
      });
    else return;
    close();
  };

  const field = (list: string) => ({
    value: query,
    list,
    open,
    activeId: active >= 0 ? `${list}-${active}` : undefined,
    onChange: (value: string) => {
      setQuery(value);
      setActive(-1);
      setOpen(true);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      if (shown.length === 0) return;
      setOpen(true);
      // De -1 (le champ) au dernier resultat, en boucle.
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => ((a + 1 + step + shown.length + 1) % (shown.length + 1)) - 1);
    },
  });

  const results = (list: string) => (
    <div id={list} role="listbox" aria-label="Résultats">
      {!term ? (
        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Nos rayons</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/categories"
                search={{ cat: c.category }}
                onClick={close}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand hover:bg-brand hover:text-brand-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      ) : shown.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-ink-soft">
          Aucun produit ne correspond à votre recherche.
        </p>
      ) : (
        <>
          <ul className="p-2">
            {shown.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03, ease: EASE }}
              >
                <Link
                  id={`${list}-${i}`}
                  role="option"
                  aria-selected={active === i}
                  to="/product/$id"
                  params={{ id: p.id }}
                  onClick={close}
                  onPointerEnter={() => setActive(i)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl p-2 transition-colors",
                    active === i ? "bg-cream" : "hover:bg-cream",
                  )}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream">
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      {p.subcategory || p.category}
                    </span>
                  </span>
                  <ArrowRight
                    className={cn(
                      "h-4 w-4 shrink-0 text-accent-red transition",
                      active === i ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0",
                    )}
                  />
                </Link>
              </motion.li>
            ))}
          </ul>
          <Link
            to="/categories"
            search={{ q: term }}
            hash="produits"
            hashScrollIntoView={{ behavior: "instant", block: "start" }}
            onClick={close}
            className="group flex items-center justify-between gap-3 border-t bg-cream px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink transition hover:text-accent-red"
          >
            <span className="flex items-center gap-2">
              Voir tous
              <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] tabular-nums text-ink">
                {matches.length}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </>
      )}
    </div>
  );

  return (
    // `contents` : le champ et la loupe restent des elements de la barre, et le volet
    // mobile se cale sur l'en-tete (son ancetre positionne), pas sur ce conteneur.
    <div ref={rootRef} className="contents">
      <form role="search" onSubmit={submit} className="relative hidden lg:block">
        <SearchField
          {...field(`${id}-bar`)}
          onFocus={() => setOpen(true)}
          tone={transparent ? "glass" : "solid"}
          className="h-10 w-44 xl:w-60 2xl:w-72"
        />
        <AnimatePresence>
          {open && (
            <motion.div
              {...panel}
              className="absolute right-0 top-[calc(100%+0.75rem)] w-[24rem] overflow-hidden rounded-2xl border bg-paper shadow-[var(--shadow-elevated)]"
            >
              {results(`${id}-bar`)}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Rechercher"
        aria-expanded={open}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full transition lg:hidden",
          transparent ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-mint",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            {...panel}
            className="absolute inset-x-0 top-full border-b bg-paper shadow-[var(--shadow-elevated)] lg:hidden"
          >
            <form role="search" onSubmit={submit} className="container-x pt-4">
              <SearchField
                {...field(`${id}-sheet`)}
                inputRef={sheetInput}
                tone="solid"
                className="h-12"
              />
            </form>
            <div className="container-x max-h-[60vh] overflow-y-auto pb-2">
              <div className="-mx-2">{results(`${id}-sheet`)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Le champ en pastille : saisie, croix pour vider, bouton rond pour lancer la recherche. */
function SearchField({
  value,
  list,
  open,
  activeId,
  onChange,
  onKeyDown,
  onFocus,
  inputRef,
  tone,
  className,
}: {
  value: string;
  /** Identifiant de la liste de resultats que ce champ pilote. */
  list: string;
  open: boolean;
  activeId?: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  tone: "solid" | "glass";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border pl-4 pr-1 transition duration-300",
        tone === "glass"
          ? "border-paper/30 bg-paper/10 text-paper backdrop-blur-sm focus-within:border-paper focus-within:bg-paper focus-within:text-ink"
          : "border-border bg-cream text-ink focus-within:border-brand/40 focus-within:bg-paper focus-within:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        role="combobox"
        aria-expanded={open}
        aria-controls={list}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-label="Rechercher un produit"
        placeholder="Rechercher un produit..."
        autoComplete="off"
        enterKeyHint="search"
        className="min-w-0 flex-1 text-ellipsis bg-transparent text-sm outline-none placeholder:text-current placeholder:opacity-60"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full opacity-60 transition hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="submit"
        aria-label="Rechercher"
        className="grid aspect-square h-[calc(100%-0.5rem)] shrink-0 place-items-center rounded-full bg-accent-red text-paper transition duration-300 hover:scale-105 hover:bg-accent-red/85"
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}

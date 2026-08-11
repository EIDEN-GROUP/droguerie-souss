import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { products, type Product } from "@/data/products";
import logo from "@/assets/logo.png";

/** A4 portrait, comme le catalogue imprimé. */
export const PAGE_W = 500;
export const PAGE_H = 707;

const PH = "/catalogue-photos/";

/* ───────────────────────────────────────────── primitives */

export const Sheet = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function Sheet({ children, className = "" }, ref) {
    return (
      <div ref={ref} className="h-full w-full bg-paper">
        {/* data-page : repère utilisé par l'export PDF pour photographier chaque feuille */}
        <div data-page className={`relative h-full w-full overflow-hidden ${className}`}>
          {children}
          {/*
          Ombre de gouttière portée par la page elle-même, et non par le livre :
          elle suit donc la feuille pendant le tournage, comme sur un ouvrage
          relié. Assombrit les deux chants ; au centre, les deux pages voisines
          forment le pli.
        */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              boxShadow:
                "inset 14px 0 22px -16px rgba(0,0,0,.55), inset -14px 0 22px -16px rgba(0,0,0,.55)",
            }}
          />
        </div>
      </div>
    );
  },
);

/** Hauteur réservée au folio : aucun contenu ne doit descendre en dessous. */
export const FOLIO_H = 34;

function Folio({ n, label, light }: { n: number; label?: string; light?: boolean }) {
  return (
    <div
      className={`absolute inset-x-8 bottom-4 z-30 flex items-end justify-between text-[8px] uppercase tracking-[0.2em] ${
        light ? "text-paper/60" : "text-ink-soft"
      }`}
    >
      <span className="truncate pr-4">{label ?? "Souss Droguerie · Catalogue 2026"}</span>
      <span className={`font-semibold tabular-nums ${light ? "text-paper" : "text-brand"}`}>
        {String(n).padStart(2, "0")}
      </span>
    </div>
  );
}

/** Titre éditorial : un mot léger, un mot gras. */
function Title({
  light,
  bold,
  size = "text-[30px]",
  tone = "text-ink",
}: {
  light: string;
  bold: string;
  size?: string;
  tone?: string;
}) {
  return (
    <h2 className={`${size} ${tone} leading-[0.95] tracking-[-0.035em]`}>
      <span className="font-light">{light} </span>
      <span className="font-extrabold">{bold}</span>
    </h2>
  );
}

function Kicker({ children, tone = "text-accent-red" }: { children: ReactNode; tone?: string }) {
  return <p className={`text-[7.5px] font-bold uppercase tracking-[0.26em] ${tone}`}>{children}</p>;
}

function Rule({ tone = "bg-accent-red" }: { tone?: string }) {
  return <span className={`block h-[2px] w-9 ${tone}`} />;
}

function Ghost({
  n,
  className = "",
  style,
}: {
  n: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none select-none font-extrabold leading-none tracking-[-0.05em] ${className}`}
      style={{
        WebkitTextStrokeWidth: "1.4px",
        WebkitTextStrokeColor: "currentColor",
        color: "transparent",
        ...style,
      }}
    >
      {n}
    </span>
  );
}

function Photo({
  src,
  alt = "",
  className = "",
  fit = "cover",
  style,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fit?: "cover" | "contain";
  style?: CSSProperties;
}) {
  if (!src)
    return (
      <div className={`flex items-center justify-center bg-mint ${className}`} style={style}>
        <span className="text-[7px] uppercase tracking-[0.24em] text-sky">Visuel à venir</span>
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={style}
      className={`${className} ${fit === "cover" ? "object-cover" : "object-contain"}`}
    />
  );
}

/** Légende : ce que l'on regarde exactement. */
function Caption({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`mt-1.5 text-[7px] uppercase tracking-[0.16em] ${
        light ? "text-paper/70" : "text-ink-soft"
      }`}
    >
      {children}
    </p>
  );
}

/* ───────────────────────────────────────────── couverture */

export const Cover = forwardRef<HTMLDivElement, object>(function Cover(_, ref) {
  return (
    <Sheet ref={ref}>
      <div className="relative flex h-full flex-col">
        <Photo
          src={`${PH}cover.webp`}
          alt="Siège de Sté. Souss Droguerie, Dcheira — Inezgane"
          className="absolute inset-0 h-full w-full"
        />
        {/*
          Voile dégressif : dense en pied pour porter le titre, très léger au
          centre pour laisser lire l'enseigne allumée, moyen en tête pour que le
          logo blanc se détache du ciel.
        */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-secondary/60 via-brand-secondary/25 to-brand-secondary/95" />
        <div className="absolute left-0 top-0 h-full w-[7px] bg-accent-red" />

        <div className="relative flex h-full flex-col px-9 pt-10 text-paper">
          <img
            src={logo}
            alt="Souss Droguerie"
            width={2337}
            height={1102}
            className="h-auto w-[150px] shrink-0 self-start brightness-0 invert"
          />
          <p className="mt-2 text-[7.5px] uppercase tracking-[0.3em] text-paper/70">
            Matériaux de construction · Agadir
          </p>

          <div className="mt-auto pb-2">
            <Kicker tone="text-paper/70">Édition 2026</Kicker>
            <h1 className="mt-3 leading-[0.88] tracking-[-0.045em]">
              <span className="block text-[52px] font-extrabold">Catalogue</span>
              <span className="block text-[52px] font-light italic">Général</span>
            </h1>
            <div className="mt-5 flex items-center gap-4">
              <span className="h-px flex-1 bg-paper/30" />
              <span className="border border-paper/40 px-3 py-1 text-[8px] tracking-[0.3em]">
                DEPUIS 1993
              </span>
            </div>
            <p className="mt-6 max-w-[80%] text-[9px] leading-[1.7] text-paper/75">
              Céramique, sanitaire, ciments, métallurgie, peinture et électricité. Distributeur
              agréé dans la région du Souss Massa.
            </p>
          </div>

          <div className="mt-6 border-t border-paper/20 pb-8 pt-3">
            <p className="text-[7.5px] uppercase tracking-[0.24em] text-paper/60">
              www.soussdroguerie.com
            </p>
          </div>
        </div>
      </div>
    </Sheet>
  );
});

/* ───────────────────────────────────────────── mot du directeur */

export const Editorial = forwardRef<
  HTMLDivElement,
  {
    page: number;
    kicker: string;
    light: string;
    bold: string;
    body: string[];
    photo: string;
    caption: string;
    signature?: string;
  }
>(function Editorial({ page, kicker, light, bold, body, photo, caption, signature }, ref) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col">
        <div className="relative h-[42%] w-full">
          <Photo src={photo} className="h-full w-full" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-8 pb-3 pt-10">
            <Caption light>{caption}</Caption>
          </div>
        </div>
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-9 pt-7"
          style={{ paddingBottom: FOLIO_H }}
        >
          <Kicker>{kicker}</Kicker>
          <div className="mt-2.5">
            <Title light={light} bold={bold} size="text-[26px]" />
          </div>
          <div className="mt-2.5">
            <Rule />
          </div>
          <div className="mt-4 space-y-2.5">
            {body.map((t, i) => (
              <p key={i} className="text-[8.5px] leading-[1.75] text-ink-soft">
                {t}
              </p>
            ))}
          </div>
          {signature && (
            <p className="mt-auto text-[8px] font-bold uppercase tracking-[0.2em] text-brand">
              {signature}
            </p>
          )}
        </div>
      </div>
      <Folio n={page} label="L'entreprise" />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── chiffres + marques */

export const Brands = forwardRef<
  HTMLDivElement,
  { page: number; stats: [string, string][]; brands: string[] }
>(function Brands({ page, stats, brands }, ref) {
  return (
    <Sheet ref={ref}>
      <div
        className="flex h-full flex-col overflow-hidden px-9 pt-11"
        style={{ paddingBottom: FOLIO_H }}
      >
        <Kicker>En quelques chiffres</Kicker>
        <div className="mt-2.5">
          <Title light="Notre" bold="maison" size="text-[26px]" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-px bg-border">
          {stats.map(([v, l]) => (
            <div key={l} className="bg-paper px-2 py-4">
              <div className="text-[24px] font-extrabold leading-none tracking-[-0.04em] text-brand">
                {v}
              </div>
              <div className="mt-1.5 text-[6.5px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                {l}
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-6 h-[28%] w-full">
          <Photo
            src={`${PH}showroom-multicerame.webp`}
            alt="Présentoirs Multicérame et Argenta, showroom de Dcheira"
            className="h-full w-full"
          />
        </div>
        <Caption>Présentoirs Multicérame &amp; Argenta · notre showroom</Caption>

        <div className="mt-5">
          <Kicker>Marques distribuées</Kicker>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-[5px]">
            {brands.map((b) => (
              <div key={b} className="flex items-baseline gap-2 border-b border-border pb-[4px]">
                <span className="h-[5px] w-[5px] shrink-0 bg-accent-red" />
                <span className="truncate text-[8px] font-medium text-ink">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Folio n={page} label="Nos partenaires" />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── sommaire */

export const Sommaire = forwardRef<
  HTMLDivElement,
  { page: number; entries: { label: string; page: number; note?: string }[] }
>(function Sommaire({ page, entries }, ref) {
  return (
    <Sheet ref={ref}>
      <div
        className="flex h-full flex-col overflow-hidden px-9 pt-11"
        style={{ paddingBottom: FOLIO_H }}
      >
        <Kicker>Dans ce catalogue</Kicker>
        <div className="mt-2.5">
          <Title light="Le" bold="sommaire" size="text-[26px]" />
        </div>
        <div className="mt-2.5">
          <Rule />
        </div>
        <ul className="mt-6 space-y-[7px]">
          {entries.map((e) => (
            <li key={e.label} className="flex items-baseline gap-2.5">
              <span className="text-[9px] font-medium text-ink">{e.label}</span>
              {e.note && (
                <span className="text-[7px] uppercase tracking-[0.14em] text-ink-soft">
                  {e.note}
                </span>
              )}
              <span className="mx-1 flex-1 border-b border-dotted border-border" />
              <span className="text-[8.5px] font-bold tabular-nums text-brand">
                {String(e.page).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-auto text-[7.5px] leading-[1.7] text-ink-soft">
          Prix sur demande. Chaque référence fait l'objet d'un devis nominatif établi sous 24
          heures.
        </p>
      </div>
      <Folio n={page} label="Sommaire" />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── page pleine image */

export const FullBleed = forwardRef<
  HTMLDivElement,
  { photo: string; caption?: string; quote?: string; page: number }
>(function FullBleed({ photo, caption, quote, page }, ref) {
  return (
    <Sheet ref={ref}>
      <div className="relative h-full">
        <Photo src={photo} className="h-full w-full" />
        {quote && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute inset-x-9 bottom-14">
              <p className="font-display text-[19px] font-light italic leading-[1.35] text-paper">
                {quote}
              </p>
            </div>
          </>
        )}
        {caption && (
          <div className="absolute inset-x-9 bottom-7">
            <Caption light>{caption}</Caption>
          </div>
        )}
      </div>
      <Folio n={page} light />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── ouverture de famille */

export const Divider = forwardRef<
  HTMLDivElement,
  { index: number; category: string; count: number; page: number; photo: string; blurb: string }
>(function Divider({ index, category, count, page, photo, blurb }, ref) {
  const num = String(index).padStart(2, "0");
  return (
    <Sheet ref={ref}>
      {/*
        Composition en deux temps plutôt qu'un voile de couleur : la photo garde
        ses teintes réelles sur la moitié haute, le texte repose sur un aplat
        bleu de marque en bas. Un filtre uniforme virait au mauve et écrasait
        l'image ; ici la couleur de marque redevient un élément graphique.
      */}
      <div className="relative flex h-full flex-col">
        <div className="relative h-[52%] w-full shrink-0 overflow-hidden">
          <Photo src={photo} alt={category} className="h-full w-full" />
          {/* raccord discret vers l'aplat, pour éviter la coupe nette */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-brand-secondary" />
        </div>

        <div className="relative flex flex-1 flex-col bg-brand-secondary px-9 pt-9 text-paper">
          <Kicker tone="text-accent-red">Famille {num}</Kicker>
          <div className="mt-3">
            <Title light="La gamme" bold={category} size="text-[27px]" tone="text-paper" />
          </div>
          <div className="mt-3">
            <Rule />
          </div>
          <p className="mt-5 max-w-[74%] text-[9px] leading-[1.75] text-paper/70">{blurb}</p>
          <p className="mt-auto pb-8 text-[8px] uppercase tracking-[0.24em] text-paper/45">
            {count} référence{count > 1 ? "s" : ""}
          </p>
        </div>

        {/* le numéro chevauche la ligne de partage : c'est lui qui tient la page */}
        <Ghost
          n={num}
          className="absolute right-7 text-[128px] text-paper/70"
          style={{ top: "52%", transform: "translateY(-58%)" }}
        />
        <div className="absolute left-0 top-0 h-full w-[6px] bg-accent-red" />
      </div>
      <Folio n={page} label={category} light />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── page format */

export const FormatPage = forwardRef<
  HTMLDivElement,
  {
    page: number;
    family: string;
    origin: string;
    format: string;
    dims: [number, number] | null;
    items: Product[];
    photo?: string;
    caption?: string;
    allFormats: [number, number][];
  }
>(function FormatPage(
  { page, family, origin, format, dims, items, photo, caption, allFormats },
  ref,
) {
  const biggest = allFormats.length ? Math.max(...allFormats.map(([w, h]) => w * h)) : 1;
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col">
        {photo && (
          <div className="relative h-[34%] w-full">
            <Photo src={photo} className="h-full w-full" />
            {caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-8 pb-2.5 pt-9">
                <Caption light>{caption}</Caption>
              </div>
            )}
          </div>
        )}

        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pt-6"
          style={{ paddingBottom: FOLIO_H }}
        >
          <div className="flex shrink-0 items-start justify-between">
            <div>
              <Kicker>{origin}</Kicker>
              <div className="mt-2">
                <Title light="Format" bold={format} size="text-[26px]" />
              </div>
            </div>
            <span className="mt-1 text-[7px] uppercase tracking-[0.18em] text-ink-soft">
              {items.length} réf.
            </span>
          </div>

          {/*
            Les teintes gardent la proportion réelle du carreau, mais leur
            hauteur est plafonnée : sans cela un format portrait (25×75) fait
            déborder la page et vient chevaucher le bloc des formats.
          */}
          <div className="mt-4 grid shrink-0 grid-cols-3 gap-x-3 gap-y-3">
            {items.slice(0, 6).map((p) => (
              <figure key={p.name} className="min-w-0">
                <Photo
                  src={p.image ? `/product-images/${p.image}` : null}
                  alt={p.name}
                  className="w-full border border-border"
                  style={{
                    aspectRatio: dims ? `${dims[0]} / ${dims[1]}` : "4 / 3",
                    maxHeight: 62,
                  }}
                />
                <figcaption className="mt-1 truncate text-[7.5px] font-semibold text-ink">
                  {p.name}
                </figcaption>
              </figure>
            ))}
          </div>

          {/*
            Formats de la gamme, dessinés à l'échelle relative réelle.
            Chaque vignette réserve au moins la largeur de son étiquette, sinon
            les formats étroits (20×120) laissent leurs libellés se chevaucher ;
            et le bloc garde ses distances avec le folio.
          */}
          {allFormats.length > 1 && (
            <div className="mt-auto shrink-0 pt-3">
              <p className="mb-2 text-[6.5px] font-bold uppercase tracking-[0.2em] text-ink">
                Formats de la gamme
              </p>
              <div className="flex flex-wrap items-end gap-x-2 gap-y-3">
                {allFormats.slice(0, 6).map(([w, h]) => {
                  const s = Math.sqrt((w * h) / biggest);
                  const long = Math.max(w, h);
                  const on = dims && dims[0] === w && dims[1] === h;
                  return (
                    <div
                      key={`${w}x${h}`}
                      className="flex min-w-[34px] shrink-0 flex-col items-center"
                    >
                      <div
                        className={on ? "bg-brand" : "border border-ink-soft/60"}
                        style={{
                          width: Math.max(4, 34 * s * (w / long)),
                          height: Math.max(4, 34 * s * (h / long)),
                        }}
                      />
                      <span
                        className={`mt-[3px] whitespace-nowrap text-[5.5px] leading-none tabular-nums ${
                          on ? "font-bold text-brand" : "text-ink-soft"
                        }`}
                      >
                        {w}×{h}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Folio n={page} label={family} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── planche de références */

export const Grid = forwardRef<
  HTMLDivElement,
  { category: string; items: Product[]; page: number }
>(function Grid({ category, items, page }, ref) {
  return (
    <Sheet ref={ref}>
      {/*
        Trois colonnes sur trois rangées : neuf références tiennent dans la page
        sans jamais toucher le folio. Deux colonnes obligeaient à trois rangées
        de 213 px, soit plus que la hauteur utile.
      */}
      <div
        className="flex h-full flex-col overflow-hidden px-8 pt-10"
        style={{ paddingBottom: FOLIO_H }}
      >
        <div className="flex shrink-0 items-baseline justify-between border-b-2 border-brand pb-2">
          <Title light="La gamme" bold={category} size="text-[14px]" />
          <span className="text-[7px] uppercase tracking-[0.2em] text-ink-soft">
            {items.length} références
          </span>
        </div>
        <div className="mt-4 grid min-h-0 grid-cols-3 content-start gap-x-3 gap-y-3 overflow-hidden">
          {items.map((p) => (
            <figure key={p.name} className="min-w-0">
              <Photo
                src={p.image ? `/product-images/${p.image}` : null}
                alt={p.name}
                className="w-full border border-border"
                style={{ aspectRatio: "4 / 3", maxHeight: 94 }}
              />
              <figcaption className="mt-1.5">
                <p className="truncate text-[8px] font-semibold leading-tight text-ink">{p.name}</p>
                <p className="mt-[2px] line-clamp-2 text-[6px] leading-[1.45] text-ink-soft">
                  {p.description}
                </p>
                <p className="mt-[3px] text-[6px] font-bold uppercase tracking-[0.14em] text-accent-red">
                  Sur devis{p.unit ? ` · ${p.unit}` : ""}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <Folio n={page} label={category} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── contact */

export const BackCover = forwardRef<HTMLDivElement, { page: number }>(function BackCover(
  { page },
  ref,
) {
  return (
    <Sheet ref={ref}>
      <div className="relative h-full">
        <Photo src={`${PH}ambiance-restaurant.webp`} className="h-full w-full" />
        <div className="absolute inset-0 bg-brand-secondary/88" />
        <div className="absolute inset-0 flex flex-col px-9 pt-11 text-paper">
          <img
            src={logo}
            alt="Souss Droguerie"
            width={2337}
            height={1102}
            className="h-auto w-[135px] shrink-0 self-start brightness-0 invert"
          />
          <h2 className="mt-7 leading-[0.9] tracking-[-0.04em]">
            <span className="block text-[30px] font-extrabold">Parlons de</span>
            <span className="block text-[34px] font-light italic">votre projet</span>
          </h2>
          <div className="mt-3">
            <Rule />
          </div>

          <dl className="mt-7 space-y-3.5 text-[9px]">
            {[
              ["Adresse", "29, Bd Mohamed V, Dcheira — Inezgane\nQI Tassila, 80360 · Agadir"],
              ["Fixe", "+212 528 83 66 91 · +212 528 83 89 92"],
              ["GSM / WhatsApp", "+212 661 55 54 63 · +212 661 84 77 59"],
              ["Email", "contact@soussdroguerie.com"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[6.5px] font-bold uppercase tracking-[0.22em] text-sky">{k}</dt>
                <dd className="mt-[3px] whitespace-pre-line leading-[1.6] text-paper/90">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto pb-9">
            <span className="inline-block bg-accent-red px-5 py-2 text-[8px] font-bold uppercase tracking-[0.18em]">
              Devis sous 24 h
            </span>
            <p className="mt-4 text-[7px] uppercase tracking-[0.24em] text-paper/55">
              www.soussdroguerie.com · {products.length} références
            </p>
          </div>
        </div>
      </div>
      <Folio n={page} light />
    </Sheet>
  );
});

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import {
  DUNE,
  duneAbout,
  duneCeramicIntro,
  duneCoverFront,
  duneFactoryRanges,
  duneGlueBrands,
  duneImg,
  duneLogo,
  duneModelLabel,
  type DunePlate,
} from "@/data/dune-catalogue";

/**
 * Même format que le catalogue « interactif » (PAGE_WIDTH × PAGE_HEIGHT dans
 * `src/lib/catalogue.ts`) : les deux livres ont des pages identiques.
 */
export const DUNE_W = 550;
export const DUNE_H = 778;

const FOLIO_H = 34;

/* ───────────────────────────────────────────── primitives */

export const Sheet = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function Sheet({ children, className = "" }, ref) {
    return (
      <div ref={ref} className="h-full w-full bg-paper">
        <div data-page className={`relative h-full w-full overflow-hidden ${className}`}>
          {children}
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

/** Le numéro de page du catalogue vit en bas à droite. */
function Folio({ n, light }: { n: number; light?: boolean }) {
  return (
    <div
      className={`absolute bottom-3 right-9 z-30 text-[13px] font-bold tabular-nums ${
        light ? "text-paper/85" : "text-dune-ink"
      }`}
      style={{
        fontFamily: "var(--font-dune)",
        textShadow: light ? "0 1px 6px rgba(0,0,0,.5)" : "none",
      }}
    >
      {n}
    </div>
  );
}

function Kick({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[9px] font-bold uppercase tracking-[0.3em] text-dune-orange"
      style={{ fontFamily: "var(--font-dune)" }}
    >
      {children}
    </p>
  );
}

/** Titre d'affichage : League Gothic, le vrai corps du catalogue Dune. */
export function DuneTitle({
  light,
  bold,
  size = "text-[34px]",
  tone = "text-dune-ink",
}: {
  light: string;
  bold: string;
  size?: string;
  tone?: string;
}) {
  return (
    <h2
      className={`${size} ${tone} uppercase leading-[1.02]`}
      style={{ fontFamily: "var(--font-dune-display)" }}
    >
      <span className="opacity-45">{light} </span>
      <span>{bold}</span>
    </h2>
  );
}

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`text-[11px] leading-[1.8] text-dune-ink ${className}`}
      style={{ fontFamily: "var(--font-dune)" }}
    >
      {children}
    </p>
  );
}

function Caption({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`mt-1 text-[8px] uppercase tracking-[0.14em] ${light ? "text-paper/80" : "text-dune-ink/60"}`}
      style={{ fontFamily: "var(--font-dune)" }}
    >
      {children}
    </p>
  );
}

/** Les visuels remplissent toujours leur cadre (recadrage accepté) : aucun coin noir. */
function Photo({
  src,
  alt = "",
  className = "",
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      style={style}
      className={`h-full w-full select-none object-cover ${className}`}
    />
  );
}

/* ───────────────────────────────────────────── couverture */

export const DuneCover = forwardRef<HTMLDivElement, object>(function DuneCover(_, ref) {
  return (
    <Sheet ref={ref}>
      <Photo src={duneCoverFront} alt="Dune Distribution — Catalogue 2026" />
      <Folio n={1} light />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── introduction */

export const DuneAbout = forwardRef<HTMLDivElement, { page: number }>(function DuneAbout(
  { page },
  ref,
) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col px-10 pt-10" style={{ paddingBottom: FOLIO_H + 10 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Kick>Introduction</Kick>
            <div className="mt-2">
              <DuneTitle light="Un acteur de" bold="référence" size="text-[32px]" />
            </div>
            <span className="mt-3 block h-[3px] w-10 rounded-full bg-dune-orange" />
          </div>
          <img src={duneLogo} alt="Dune Distribution" className="w-[168px] shrink-0" />
        </div>
        <div className="mt-6 space-y-3.5">
          {duneAbout.map((t, i) => (
            <Body key={i}>{t}</Body>
          ))}
        </div>
        <figure className="mt-auto">
          <div className="h-[218px] overflow-hidden rounded-md">
            <Photo src={duneImg("about-photo")} alt="Dune Distribution · Laâyoune" />
          </div>
          <Caption>
            {DUNE.name} · {DUNE.city}
          </Caption>
        </figure>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── famille céramique */

export const DuneCeramic = forwardRef<HTMLDivElement, { page: number }>(function DuneCeramic(
  { page },
  ref,
) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col">
        <div className="relative h-[190px] w-full shrink-0">
          <Photo src={duneImg("ceramique-banner")} alt="Carrelages · showroom" />
        </div>
        <div
          className="flex min-h-0 flex-1 flex-col px-10 pt-7"
          style={{ paddingBottom: FOLIO_H + 8 }}
        >
          <h2
            className="text-[42px] uppercase leading-none text-dune-ink"
            style={{ fontFamily: "var(--font-dune-display)" }}
          >
            CÉRAMIQUE
          </h2>
          <div className="mt-4 grid grid-cols-[1.25fr_1fr] gap-6">
            <p
              className="text-[16px] uppercase leading-[1.35] text-dune-ink"
              style={{ fontFamily: "var(--font-dune-display)" }}
            >
              {duneCeramicIntro.headline}
            </p>
            <Body>{duneCeramicIntro.body}</Body>
          </div>
          <div className="mt-6 grid flex-1 grid-cols-2 items-end gap-4">
            <figure className="min-h-0">
              <div className="h-[190px] overflow-hidden rounded-md">
                <Photo src={duneImg("ceramique-sdb")} alt="Carrelage · salle de bain" />
              </div>
              <Caption>Zellige &amp; faïence · salle de bain</Caption>
            </figure>
            <figure className="min-h-0">
              <div className="h-[190px] overflow-hidden rounded-md">
                <Photo src={duneImg("ceramique-tiles")} alt="Collections de carrelage" />
              </div>
              <Caption>Collections · sols &amp; murs</Caption>
            </figure>
          </div>
        </div>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── planche de modèles */

const PLATE_RATIO: Record<string, string> = {
  "CARREAUX 120X60": "2 / 1",
  "CARREAUX 60X60": "3 / 2",
  "CARREAUX 30X90": "3 / 1",
  "CARREAUX 30X60 · Genova & Java": "2 / 1",
  "CARREAUX 30X60 · Java Loft & Saragossa": "2 / 1",
  "CARREAUX 25X50": "2 / 1",
  "PARQUET 20X60": "3 / 1",
  "CARREAUX 33X33": "3 / 2",
  "CARREAUX 40X60": "2 / 1",
};

export const DunePlates = forwardRef<
  HTMLDivElement,
  { plate: DunePlate; page: number; family?: string }
>(function DunePlates({ plate, page, family }, ref) {
  const ratio = PLATE_RATIO[plate.format] ?? "2 / 1";
  const cols = plate.models.length <= 2 ? "grid-cols-1" : "grid-cols-2";
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col px-10 pt-7" style={{ paddingBottom: FOLIO_H + 4 }}>
        {family && <Kick>{family}</Kick>}
        <div className="mt-2 flex shrink-0 items-baseline justify-between border-b-2 border-dune-blue pb-2">
          <h2
            className="text-[27px] uppercase leading-none text-dune-ink"
            style={{ fontFamily: "var(--font-dune-display)" }}
          >
            {plate.format}
          </h2>
          <span
            className="text-[8px] font-bold uppercase tracking-[0.2em] text-dune-ink/50"
            style={{ fontFamily: "var(--font-dune)" }}
          >
            {plate.models.length} modèles
          </span>
        </div>
        <div className={`mt-5 grid min-h-0 ${cols} content-start gap-x-4 gap-y-5`}>
          {plate.models.map((mdl) => (
            <figure key={mdl.name} className="min-w-0">
              <p
                className="truncate text-[15px] uppercase leading-none text-dune-ink"
                style={{ fontFamily: "var(--font-dune-display)" }}
              >
                <span className="mr-1.5 inline-block h-[9px] w-[9px] rounded-[2px] bg-dune-orange align-middle" />
                {duneModelLabel[mdl.name] ?? mdl.name}
              </p>
              <div
                className="mt-2 overflow-hidden rounded-md border border-dune-ink/10 bg-dune-sand"
                style={{ aspectRatio: ratio }}
              >
                <Photo src={mdl.image} alt={mdl.name} />
              </div>
            </figure>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <span className="block h-px w-full bg-dune-ink/10" />
          <p
            className="mt-2 text-[8px] font-bold uppercase tracking-[0.3em] text-dune-ink/40"
            style={{ fontFamily: "var(--font-dune)" }}
          >
            {DUNE.name} · {DUNE.city}
          </p>
        </div>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── usines / marques */

export const DuneUsines = forwardRef<HTMLDivElement, { page: number }>(function DuneUsines(
  { page },
  ref,
) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col px-10 pt-10" style={{ paddingBottom: FOLIO_H + 10 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Kick>Production</Kick>
            <div className="mt-2">
              <DuneTitle light="Les leaders" bold="de fabrication" size="text-[32px]" />
            </div>
            <span className="mt-3 block h-[3px] w-10 rounded-full bg-dune-orange" />
          </div>
          <img src={duneLogo} alt="Dune Distribution" className="w-[168px] shrink-0" />
        </div>
        <div className="mt-6 space-y-3.5">
          <Body>{duneFactoryRanges.intro}</Body>
          <Body>{duneFactoryRanges.dims}</Body>
          <Body>{duneFactoryRanges.pastes}</Body>
        </div>
        <div className="mt-auto">
          <p
            className="text-[8px] font-bold uppercase tracking-[0.24em] text-dune-ink/60"
            style={{ fontFamily: "var(--font-dune)" }}
          >
            Marques de référence
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-[7px]">
            {duneFactoryRanges.brands.map((b) => (
              <div
                key={b}
                className="flex items-baseline gap-2 border-b border-dune-ink/15 pb-[6px]"
              >
                <span className="h-[6px] w-[6px] shrink-0 rounded-[1px] bg-dune-orange" />
                <span
                  className="truncate text-[11px] font-semibold text-dune-ink"
                  style={{ fontFamily: "var(--font-dune)" }}
                >
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── page thème (familles) */

export const DuneTopicPage = forwardRef<
  HTMLDivElement,
  {
    page: number;
    title: string;
    intro: string[];
    banner: string;
    bannerCaption: string;
    photos: { src: string; caption: string }[];
  }
>(function DuneTopicPage({ page, title, intro, banner, bannerCaption, photos }, ref) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col">
        <div className="relative h-[200px] w-full shrink-0">
          <Photo src={banner} alt={title} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-10 pb-2.5 pt-8">
            <Caption light>{bannerCaption}</Caption>
          </div>
        </div>
        <div
          className="flex min-h-0 flex-1 flex-col px-10 pt-6"
          style={{ paddingBottom: FOLIO_H + 8 }}
        >
          <h2
            className="text-[34px] uppercase leading-[1.05] text-dune-ink"
            style={{ fontFamily: "var(--font-dune-display)" }}
          >
            {title}
          </h2>
          <div className="mt-3 space-y-2.5">
            {intro.map((t, i) => (
              <Body key={i}>{t}</Body>
            ))}
          </div>
          <div className="mt-5 grid flex-1 grid-cols-2 items-end gap-4">
            {photos.map((ph) => (
              <figure key={ph.caption} className="min-h-0">
                <div className="h-[152px] overflow-hidden rounded-md">
                  <Photo src={ph.src} alt={ph.caption} />
                </div>
                <Caption>{ph.caption}</Caption>
              </figure>
            ))}
          </div>
        </div>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── marques ciment-colle */

export const DuneGlueBrands = forwardRef<HTMLDivElement, { page: number }>(function DuneGlueBrands(
  { page },
  ref,
) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col px-10 pt-10" style={{ paddingBottom: FOLIO_H + 10 }}>
        <Kick>La gamme</Kick>
        <div className="mt-2">
          <DuneTitle light="Ciment-colle &" bold="mortiers" size="text-[32px]" />
        </div>
        <span className="mt-3 block h-[3px] w-10 rounded-full bg-dune-orange" />
        <Body className="mt-5">
          Notre gamme comprend notamment des solutions de marques reconnues telles que{" "}
          <span className="font-bold text-dune-blue">{duneGlueBrands.join(", ")}</span>,
          sélectionnées pour leur tenue sur tous supports, en intérieur comme en extérieur.
        </Body>
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2">
          {duneGlueBrands.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2.5 rounded-md border border-dune-ink/10 bg-dune-sand px-3 py-2.5"
            >
              <span className="h-[8px] w-[8px] shrink-0 rounded-[2px] bg-dune-orange" />
              <span
                className="truncate text-[12px] font-bold text-dune-ink"
                style={{ fontFamily: "var(--font-dune)" }}
              >
                {b}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid flex-1 grid-cols-2 items-end gap-4">
          <figure className="min-h-0">
            <div className="h-[168px] overflow-hidden rounded-md">
              <Photo src={duneImg("ciment-colle-sacs")} alt="Sacs de ciment-colle" />
            </div>
            <Caption>Ciment-colle · sacs 25 kg</Caption>
          </figure>
          <figure className="min-h-0">
            <div className="h-[168px] overflow-hidden rounded-md">
              <Photo src={duneImg("ciment-colle-poudre")} alt="Mortiers & powders" />
            </div>
            <Caption>Mortiers · enduits</Caption>
          </figure>
        </div>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── sommaire */

export interface DuneSommaireEntry {
  label: string;
  page: number;
  note?: string;
}

export const DuneSommaire = forwardRef<
  HTMLDivElement,
  { page: number; entries: DuneSommaireEntry[] }
>(function DuneSommaire({ page, entries }, ref) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col px-10 pt-11" style={{ paddingBottom: FOLIO_H + 10 }}>
        <Kick>Dans ce catalogue</Kick>
        <div className="mt-2">
          <DuneTitle light="Le" bold="sommaire" size="text-[32px]" />
        </div>
        <span className="mt-3 block h-[3px] w-10 rounded-full bg-dune-orange" />
        <ul className="mt-7 space-y-[11px]">
          {entries.map((e) => (
            <li key={e.label} className="flex items-baseline gap-3">
              <span
                className="text-[12px] font-semibold text-dune-ink"
                style={{ fontFamily: "var(--font-dune)" }}
              >
                {e.label}
              </span>
              {e.note && (
                <span
                  className="text-[8px] uppercase tracking-[0.14em] text-dune-ink/50"
                  style={{ fontFamily: "var(--font-dune)" }}
                >
                  {e.note}
                </span>
              )}
              <span className="mx-1 flex-1 border-b border-dotted border-dune-ink/30" />
              <span
                className="text-[12px] font-bold tabular-nums text-dune-blue"
                style={{ fontFamily: "var(--font-dune)" }}
              >
                {String(e.page).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── interlude */

export const DuneInterlude = forwardRef<HTMLDivElement, { page: number }>(function DuneInterlude(
  { page },
  ref,
) {
  return (
    <Sheet ref={ref} className="bg-dune-sand">
      <div className="flex h-full flex-col items-center justify-center px-10 text-center">
        <p
          dir="rtl"
          className="text-[48px] leading-none text-dune-orange"
          style={{ fontFamily: "var(--font-dune-arabic)" }}
        >
          {DUNE.taglineAr}
        </p>
        <p
          className="mt-5 text-[28px] tracking-[0.04em] text-dune-blue"
          style={{ fontFamily: "var(--font-dune-serif)" }}
        >
          {DUNE.taglineFr}
        </p>
        <span className="mt-7 block h-[3px] w-14 rounded-full bg-dune-orange" />
        <p
          className="mt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-dune-ink/50"
          style={{ fontFamily: "var(--font-dune)" }}
        >
          {DUNE.name} · {DUNE.city}
        </p>
      </div>
      <Folio n={page} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── quatrième de couverture
   Même structure que le dos de l'« interactif » : fond uni sombre, logo blanc
   centré, pastille de marque et bloc contact. */

export const DuneBackCover = forwardRef<HTMLDivElement, { page: number }>(
  function DuneBackCover(_, ref) {
    return (
      <Sheet ref={ref} className="bg-dune-deep">
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-[10%] text-center">
          <img src={duneLogo} alt="Dune Distribution" className="h-12 w-auto brightness-0 invert" />
          <span className="block h-[3px] w-12 rounded-full bg-dune-orange" />
          <div
            className="space-y-1 text-[11.5px] leading-relaxed text-paper/70"
            style={{ fontFamily: "var(--font-dune)" }}
          >
            <p
              className="text-[22px] font-normal uppercase tracking-[0.08em] text-paper"
              style={{ fontFamily: "var(--font-dune-display)" }}
            >
              {DUNE.name}
            </p>
            <p
              className="text-[12px] tracking-[0.04em] text-dune-orange"
              style={{ fontFamily: "var(--font-dune-serif)" }}
            >
              {DUNE.baseline}
            </p>
            <p className="pt-2">{DUNE.address}</p>
            <p className="font-bold text-paper">{DUNE.phones.join(" / ")}</p>
            <p>{DUNE.email}</p>
            <p>{DUNE.website}</p>
          </div>
        </div>
      </Sheet>
    );
  },
);

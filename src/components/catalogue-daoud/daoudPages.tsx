import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";
import {
  DAOUD,
  daoudAgglosIntro,
  daoudAttestations,
  daoudBordureIntro,
  daoudBordures,
  daoudEngagements,
  daoudExpertise,
  daoudImg,
  daoudMateriaux,
  daoudMotDirecteur,
  daoudIntro,
  daoudPaveIntro,
  daoudPaves,
  daoudPavesCalepinage,
  daoudPlanchersIntro,
  daoudServices,
  daoudSol33,
  daoudSol40,
  daoudSpeciaux,
  daoudTechno,
  daoudValeurs,
  daoudVisions,
  type DaoudSpecTable,
} from "@/data/daoud-catalogue";

/**
 * Catalogue Daoud Building, même design que l'« interactif » (et le catalogue
 * Dune) : pages blanches A4 portrait (550 × 778), titres deux tons, kickers et
 * filets rouges, folio légendé, accents bleu Daoud.
 */

export const DAOUD_W = 550;
export const DAOUD_H = 778;

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

const serif = { fontFamily: "var(--font-db-serif)" } as const;

/** Folio légendé, comme l'interactif : mention à gauche, numéro à droite. */
function Folio({ n, label, light }: { n: number; label?: string; light?: boolean }) {
  return (
    <div
      className={`absolute inset-x-8 bottom-4 z-30 flex items-end justify-between text-[8px] uppercase tracking-[0.2em] ${
        light ? "text-paper/60" : "text-ink-soft"
      }`}
    >
      <span className="truncate pr-4">{label ?? "Daoud Building · Catalogue 2026"}</span>
      <span className={`font-semibold tabular-nums ${light ? "text-paper" : "text-db-blue"}`}>
        {String(n).padStart(2, "0")}
      </span>
    </div>
  );
}

/** Titre deux tons : régulier estompé + gras, comme l'interactif. */
function DbTitle({
  light,
  bold,
  size = "text-[30px]",
  tone = "text-db-ink",
}: {
  light: string;
  bold: string;
  size?: string;
  tone?: string;
}) {
  return (
    <h2 className={`${size} ${tone} uppercase leading-[1.02]`} style={serif}>
      <span className="font-normal opacity-45">{light} </span>
      <span className="font-bold">{bold}</span>
    </h2>
  );
}

function Kick({ children }: { children: ReactNode }) {
  return <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-db-red">{children}</p>;
}

function Rule() {
  return <span className="mt-3 block h-[3px] w-10 rounded-full bg-db-red" />;
}

function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] leading-[1.8] text-db-ink ${className}`}>{children}</p>;
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[11.5px] font-bold leading-[1.75] text-db-blue">{children}</p>;
}

function Caption({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`mt-1.5 text-[8px] uppercase tracking-[0.16em] ${light ? "text-paper/70" : "text-ink-soft"}`}
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

/** Documents (attestations) : jamais recadrés. */
function Doc({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      className="h-full w-full select-none rounded-[3px] border border-db-blue/20 bg-white object-contain"
    />
  );
}

/** En-tête de page : titre à gauche, logo horizontal à droite, comme Dune. */
function Head({ kicker, light, bold }: { kicker: string; light: string; bold: string }) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4">
      <div>
        <Kick>{kicker}</Kick>
        <div className="mt-2">
          <DbTitle light={light} bold={bold} size="text-[32px]" />
        </div>
        <Rule />
      </div>
      <img
        src="/catalogue-daoud/horizantel-logo.png"
        alt="Daoud Building"
        className="w-[132px] shrink-0 pt-1"
      />
    </div>
  );
}

/** Page de contenu standard : en-tête, corps, folio légendé. */
const ContentPage = forwardRef<
  HTMLDivElement,
  { children: ReactNode; page: number; folio: string }
>(function ContentPage({ children, page, folio }, ref) {
  return (
    <Sheet ref={ref}>
      <div className="flex h-full flex-col px-10 pt-8" style={{ paddingBottom: FOLIO_H + 10 }}>
        {children}
      </div>
      <Folio n={page} label={folio} />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── couverture */

export const DaoudCover = forwardRef<HTMLDivElement, object>(function DaoudCover(_, ref) {
  return (
    <Sheet ref={ref}>
      <Photo
        src="/catalogue-daoud/daoudbuilding(front-cover).jpg"
        alt="Daoud Building — Catalogue 2026"
      />
      <Folio n={1} light />
    </Sheet>
  );
});

/* ───────────────────────────────────────────── mot du directeur */

export const DaoudMot = forwardRef<HTMLDivElement, { page: number; part: 1 | 2 }>(function DaoudMot(
  { page, part },
  ref,
) {
  const paras = part === 1 ? daoudMotDirecteur.slice(0, 5) : daoudMotDirecteur.slice(5);
  return (
    <ContentPage ref={ref} page={page} folio="Mot du directeur">
      <Head kicker="Éditorial" light="Mot du" bold="directeur" />
      <div className="mt-5 space-y-3 overflow-hidden">
        {part === 1 && <Lead>{paras[0]}</Lead>}
        {(part === 1 ? paras.slice(1) : paras).map((t, i) => (
          <Body key={i}>{t}</Body>
        ))}
        {part === 2 && (
          <p className="pt-2 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-db-blue">
            Le Directeur Général
          </p>
        )}
      </div>
      {part === 1 && (
        <figure className="mt-auto">
          <div className="h-[190px] overflow-hidden rounded-md">
            <Photo src={daoudImg("yard-photo")} alt="Parc de stockage Daoud Building" />
          </div>
          <Caption>Parc de stockage · unité industrielle</Caption>
        </figure>
      )}
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── introduction */

export const DaoudIntro = forwardRef<HTMLDivElement, { page: number }>(function DaoudIntro(
  { page },
  ref,
) {
  return (
    <ContentPage ref={ref} page={page} folio="L'entreprise">
      <Head kicker="L'entreprise" light="Un acteur" bold="majeur" />
      <div className="mt-5 space-y-3">
        <Lead>{daoudIntro[0]}</Lead>
        {daoudIntro.slice(1).map((t, i) => (
          <Body key={i}>{t}</Body>
        ))}
      </div>
      <figure className="mt-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[190px] overflow-hidden rounded-md">
            <Photo src={daoudImg("usine-photo")} alt="Unité industrielle Daoud Building" />
          </div>
          <div className="h-[190px] overflow-hidden rounded-md">
            <Photo src={daoudImg("machine-photo")} alt="Équipements de production" />
          </div>
        </div>
        <Caption>
          {DAOUD.name} — {DAOUD.tagline}
        </Caption>
      </figure>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── sommaire */

export interface DaoudSommaireEntry {
  label: string;
  page: number;
  note?: string;
}

export const DaoudSommaire = forwardRef<
  HTMLDivElement,
  { page: number; entries: DaoudSommaireEntry[] }
>(function DaoudSommaire({ page, entries }, ref) {
  return (
    <ContentPage ref={ref} page={page} folio="Sommaire">
      <Head kicker="Dans ce catalogue" light="Le" bold="sommaire" />
      <ul className="mt-6 space-y-[11px]">
        {entries.map((e) => (
          <li key={e.label} className="flex items-baseline gap-3">
            <span className="text-[12px] font-semibold text-db-ink">{e.label}</span>
            {e.note && (
              <span className="text-[8px] uppercase tracking-[0.14em] text-ink-soft">{e.note}</span>
            )}
            <span className="mx-1 flex-1 border-b border-dotted border-db-blue/30" />
            <span className="text-[12px] font-bold tabular-nums text-db-blue">
              {String(e.page).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-auto text-[10px] leading-[1.7] text-ink-soft">
        Béton préfabriqué · Agadir — {DAOUD.website}.
      </p>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── visions & missions */

export const DaoudVisions = forwardRef<HTMLDivElement, { page: number }>(function DaoudVisions(
  { page },
  ref,
) {
  return (
    <ContentPage ref={ref} page={page} folio="Visions · Missions">
      <Head kicker="Cap" light="Nos" bold="visions" />
      <div className="mt-5 space-y-3">
        <Lead>{daoudVisions.lead}</Lead>
        <Body>{daoudVisions.body}</Body>
      </div>
      <figure className="mt-5">
        <div className="h-[185px] overflow-hidden rounded-md">
          <Photo src={daoudImg("silos-photo")} alt="Centrale à béton Daoud Building" />
        </div>
        <Caption>Centrale à béton · unité industrielle</Caption>
      </figure>
      <div className="mt-5">
        <DbTitle light="Nos" bold="missions" size="text-[24px]" />
      </div>
      <ol className="mt-3 space-y-2">
        {daoudVisions.missions.map((m, i) => (
          <li key={i} className="flex items-baseline gap-2.5">
            <span className="text-[12px] font-bold text-db-red">{i + 1}.</span>
            <Body>{m}</Body>
          </li>
        ))}
      </ol>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── valeurs */

export const DaoudValeurs = forwardRef<HTMLDivElement, { page: number }>(function DaoudValeurs(
  { page },
  ref,
) {
  return (
    <ContentPage ref={ref} page={page} folio="Nos valeurs">
      <Head kicker="Valeurs" light="Nos" bold="valeurs" />
      <figure className="mt-5">
        <div className="h-[185px] overflow-hidden rounded-md">
          <Photo src={daoudImg("machine-photo")} alt="Précision industrielle" />
        </div>
        <Caption>Savoir-faire industriel · qualité constante</Caption>
      </figure>
      <ul className="mt-5 space-y-3">
        {daoudValeurs.map((v, i) => (
          <li key={i} className="flex items-center gap-2 border-b border-db-blue/10 pb-2.5">
            <ChevronRight className="h-4 w-4 shrink-0 text-db-red" strokeWidth={3} />
            <span className="text-[13px] font-bold text-db-ink">{v}</span>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── intro de famille */

export const DaoudFamilyIntro = forwardRef<
  HTMLDivElement,
  {
    page: number;
    folio: string;
    kicker: string;
    light: string;
    bold: string;
    paras: string[];
    images: { src: string; alt: string; height: number }[];
  }
>(function DaoudFamilyIntro({ page, folio, kicker, light, bold, paras, images }, ref) {
  return (
    <ContentPage ref={ref} page={page} folio={folio}>
      <Head kicker={kicker} light={light} bold={bold} />
      <div className="mt-5 space-y-3">
        {paras.map((t, i) => (
          <Body key={i}>{t}</Body>
        ))}
      </div>
      <div
        className={`mt-6 grid flex-1 gap-4 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {images.map((im) => (
          <figure key={im.src} className="min-h-0">
            <div
              className="overflow-hidden rounded-md border border-db-blue/10"
              style={{ height: im.height }}
            >
              <Photo src={im.src} alt={im.alt} />
            </div>
          </figure>
        ))}
      </div>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── planchers */

export const DaoudPlanchers = forwardRef<HTMLDivElement, { page: number }>(function DaoudPlanchers(
  { page },
  ref,
) {
  return (
    <ContentPage ref={ref} page={page} folio="Planchers">
      <Head kicker="Béton préfabriqué" light="Les" bold="planchers" />
      <div className="mt-5 space-y-3">
        <Lead>{daoudPlanchersIntro[0]}</Lead>
        <Body>{daoudPlanchersIntro[1]}</Body>
      </div>
      <div className="mt-5 grid grid-cols-3 items-end gap-3">
        {[
          { src: daoudImg("plancher-schema-1"), h: 150 },
          { src: daoudImg("plancher-schema-2"), h: 190 },
          { src: daoudImg("plancher-schema-3"), h: 170 },
        ].map((s) => (
          <div
            key={s.src}
            className="overflow-hidden rounded-md border border-db-blue/10 bg-white"
            style={{ height: s.h }}
          >
            <Photo src={s.src} alt="Schéma technique hourdis" />
          </div>
        ))}
      </div>
      <Caption>Hourdis · coupes techniques — cotes en cm</Caption>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── tableau de spécifications */

export const DaoudSpecTablePage = forwardRef<
  HTMLDivElement,
  {
    page: number;
    folio: string;
    kicker?: string;
    titleLight: string;
    titleBold: string;
    table: DaoudSpecTable;
    banner?: string;
    bannerAlt?: string;
    galleries?: { label: string; images: { src: string; caption?: string }[] }[];
  }
>(function DaoudSpecTablePage(
  {
    page,
    folio,
    kicker = "Fiche technique",
    titleLight,
    titleBold,
    table,
    banner,
    bannerAlt = "",
    galleries = [],
  },
  ref,
) {
  const cols = table.headers.length;
  return (
    <ContentPage ref={ref} page={page} folio={folio}>
      <Head kicker={kicker} light={titleLight} bold={titleBold} />
      {banner && (
        <div className="mt-4 h-[140px] overflow-hidden rounded-md">
          <Photo src={banner} alt={bannerAlt} />
        </div>
      )}
      <div className="mt-4 overflow-hidden rounded-md border border-db-blue/40">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: "30%" }} />
            {table.headers.slice(1).map((_, i) => (
              <col key={i} style={{ width: `${70 / Math.max(cols - 1, 1)}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="border border-db-blue/40 bg-db-blue/10 px-2 py-2 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-db-blue">
                Désignation
              </th>
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  className="border border-db-blue/40 bg-db-blue px-2 py-2 text-center text-[10px] font-bold uppercase leading-tight text-white"
                >
                  {h || "—"}
                </th>
              ))}
            </tr>
            {table.images.some(Boolean) && (
              <tr>
                <td className="border border-db-blue/40 bg-db-blue/10 px-2 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-db-blue">
                  Type
                </td>
                {table.images.map((src, i) => (
                  <td key={i} className="border border-db-blue/40 p-1.5 align-middle">
                    {src ? (
                      <div className="mx-auto h-[64px] max-w-[150px] overflow-hidden rounded-[3px]">
                        <Photo src={src} alt={table.headers[i]} />
                      </div>
                    ) : (
                      <span className="text-[10px] text-ink-soft">—</span>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.label}>
                <td className="border border-db-blue/40 bg-db-blue/10 px-2 py-[7px] text-[9.5px] font-bold text-db-blue">
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className="border border-db-blue/40 px-1 py-[7px] text-center text-[10.5px] font-semibold tabular-nums text-db-ink"
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {galleries.map((g) => (
        <div key={g.label} className="mt-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-db-blue">{g.label}</p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {g.images.map((im) => (
              <figure key={im.src}>
                <div className="h-[96px] overflow-hidden rounded-md border border-db-blue/15">
                  <Photo src={im.src} alt={im.caption ?? g.label} />
                </div>
                {im.caption && <Caption>{im.caption}</Caption>}
              </figure>
            ))}
          </div>
        </div>
      ))}
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── revêtement du sol */

export const DaoudSol = forwardRef<
  HTMLDivElement,
  { page: number; format: string; tiles: { name: string; image: string }[]; cols?: 2 | 3 }
>(function DaoudSol({ page, format, tiles, cols = 2 }, ref) {
  return (
    <ContentPage ref={ref} page={page} folio="Revêtement du sol">
      <div className="flex shrink-0 items-end justify-between gap-4">
        <div>
          <Kick>Revêtement du sol</Kick>
          <div className="mt-2">
            <DbTitle light="Format" bold={format} size="text-[32px]" />
          </div>
          <Rule />
        </div>
        <img
          src="/catalogue-daoud/horizantel-logo.png"
          alt="Daoud Building"
          className="w-[132px] shrink-0 pt-1"
        />
      </div>
      <div
        className={`mt-5 grid flex-1 content-start gap-x-4 gap-y-4 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}
      >
        {tiles.map((t) => (
          <figure key={t.name}>
            <div
              className="overflow-hidden rounded-md border border-db-blue/15"
              style={{ aspectRatio: cols === 3 ? "1 / 1" : "4 / 3" }}
            >
              <Photo src={t.image} alt={t.name} />
            </div>
            <p
              className={`mt-1.5 text-center font-semibold text-db-blue ${cols === 3 ? "text-[10px]" : "text-[12px]"}`}
            >
              {t.name}
            </p>
          </figure>
        ))}
      </div>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── generic topic */

export const DaoudTopic = forwardRef<
  HTMLDivElement,
  {
    page: number;
    folio: string;
    kicker: string;
    light: string;
    bold: string;
    paras: string[];
    bullets?: string[];
    photos: { src: string; caption: string }[];
  }
>(function DaoudTopic({ page, folio, kicker, light, bold, paras, bullets = [], photos }, ref) {
  return (
    <ContentPage ref={ref} page={page} folio={folio}>
      <Head kicker={kicker} light={light} bold={bold} />
      <div className="mt-5 space-y-3">
        {paras.map((t, i) => (
          <Body key={i}>{t}</Body>
        ))}
      </div>
      {bullets.length > 0 && (
        <ul className="mt-4 space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight className="mt-[3px] h-4 w-4 shrink-0 text-db-red" strokeWidth={3} />
              <span className="text-[10.5px] leading-[1.7] text-db-ink">{b}</span>
            </li>
          ))}
        </ul>
      )}
      <div
        className={`mt-5 grid flex-1 gap-4 ${photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {photos.map((ph) => (
          <figure key={ph.src} className="min-h-0">
            <div className="h-[148px] overflow-hidden rounded-md">
              <Photo src={ph.src} alt={ph.caption} />
            </div>
            <Caption>{ph.caption}</Caption>
          </figure>
        ))}
      </div>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── expertise */

export const DaoudExpertise = forwardRef<HTMLDivElement, { page: number }>(function DaoudExpertise(
  { page },
  ref,
) {
  return (
    <ContentPage ref={ref} page={page} folio="Notre expertise">
      <Head kicker="Savoir-faire" light="Notre" bold="expertise" />
      <div className="mt-5 grid grid-cols-[1.35fr_1fr] gap-5">
        <div className="space-y-3">
          {daoudExpertise.intro.map((t, i) => (
            <Body key={i}>{t}</Body>
          ))}
          <div className="rounded-md border border-db-blue/25 bg-db-blue/5 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-db-blue">
              Partenaires nationaux
            </p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-db-ink">
              {daoudExpertise.nationaux}
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-db-blue">
              Partenaires internationaux
            </p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-db-ink">
              {daoudExpertise.internationaux}
            </p>
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="h-[235px] overflow-hidden rounded-md">
            <Photo src={daoudImg("tower-photo")} alt="Tour en construction" />
          </div>
          <Caption>Grands projets · gros œuvre</Caption>
          <p className="mt-3 text-[10.5px] font-bold text-db-blue">{daoudExpertise.closing}</p>
          <ul className="mt-2 space-y-1.5">
            {daoudExpertise.items.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ChevronRight
                  className="mt-[2px] h-3.5 w-3.5 shrink-0 text-db-red"
                  strokeWidth={3}
                />
                <span className="text-[9.5px] leading-relaxed text-db-ink">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── matériaux (mosaïque) */

export const DaoudMateriaux = forwardRef<HTMLDivElement, { page: number }>(function DaoudMateriaux(
  { page },
  ref,
) {
  return (
    <ContentPage ref={ref} page={page} folio="Aciers & bétons">
      <Head kicker="Négoce" light="Aciers" bold="& bétons" />
      <div className="mt-5 grid flex-1 grid-cols-2 content-start gap-x-5 gap-y-5">
        <Body>{daoudMateriaux.acier}</Body>
        <div className="h-[168px] overflow-hidden rounded-md">
          <Photo src={daoudImg("treillis-photo")} alt="Treillis soudé" />
        </div>
        <div className="h-[198px] overflow-hidden rounded-md">
          <Photo src={daoudImg("rebar-photo")} alt="Fer à béton" />
        </div>
        <Body>{daoudMateriaux.beton}</Body>
        <div className="h-[148px] overflow-hidden rounded-md">
          <Photo src={daoudImg("beton-photo")} alt="Béton prêt à l'emploi" />
        </div>
        <div className="h-[148px] overflow-hidden rounded-md">
          <Photo src={daoudImg("agregats-photo")} alt="Agrégats" />
        </div>
      </div>
    </ContentPage>
  );
});

/* ───────────────────────────────────────────── engagements */

export const DaoudEngagements = forwardRef<HTMLDivElement, { page: number }>(
  function DaoudEngagements({ page }, ref) {
    return (
      <ContentPage ref={ref} page={page} folio="Nos engagements">
        <Head kicker="RSE" light="Nos" bold="engagements" />
        <div className="mt-4 h-[160px] overflow-hidden rounded-md">
          <Photo src={daoudImg("city-photo")} alt="Ville durable" />
        </div>
        <div className="mt-3 space-y-2">
          {daoudEngagements.intro.map((t, i) => (
            <Body key={i}>{t}</Body>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-bold text-db-blue">{daoudEngagements.lead}</p>
        <ul className="mt-2 space-y-2">
          {daoudEngagements.items.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-[7px] h-[7px] w-[7px] shrink-0 rounded-[2px] bg-db-red" />
              <span className="text-[10px] leading-[1.65] text-db-ink">{s}</span>
            </li>
          ))}
        </ul>
      </ContentPage>
    );
  },
);

/* ───────────────────────────────────────────── attestations */

export const DaoudAttestations = forwardRef<HTMLDivElement, { page: number; index: number }>(
  function DaoudAttestations({ page, index }, ref) {
    const section = daoudAttestations[index];
    const n = section.docs.length;
    const h = n === 1 ? "h-[460px]" : n <= 3 ? "h-[285px]" : "h-[248px]";
    return (
      <ContentPage ref={ref} page={page} folio="Attestations">
        <Head kicker="Qualité certifiée" light="Nos" bold="attestations" />
        <p
          className="mt-4 flex items-center gap-2 text-[14px] font-bold text-db-blue"
          style={serif}
        >
          <span className="h-[8px] w-[8px] rounded-full bg-db-red" />
          {section.label}
        </p>
        <div className="mt-4 grid flex-1 grid-cols-2 content-start items-start gap-4">
          {section.docs.map((src, i) => (
            <div
              key={src}
              className={`${h} ${n % 2 === 1 && i === n - 1 ? "col-span-2 mx-auto aspect-[3/4] w-1/2" : ""}`}
            >
              <Doc src={src} alt={`Attestation ${section.label} ${i + 1}`} />
            </div>
          ))}
        </div>
      </ContentPage>
    );
  },
);

/* ───────────────────────────────────────────── quatrième de couverture
   Même design que le dos de l'« interactif » : photo voilée, logo blanc,
   « Parlons de votre projet », bloc contact, pastille rouge, pied de page. */

export const DaoudBackCover = forwardRef<HTMLDivElement, { page: number }>(function DaoudBackCover(
  { page },
  ref,
) {
  return (
    <Sheet ref={ref}>
      <div className="relative h-full">
        <Photo src={daoudImg("contact-band")} alt="" />
        <div className="absolute inset-0 bg-db-deep/88" />
        <div className="absolute inset-0 flex flex-col px-9 pt-11 text-paper">
          <img
            src="/catalogue-daoud/logo.png"
            alt="Daoud Building"
            className="h-auto w-[135px] shrink-0 self-start brightness-0 invert"
          />
          <h2 className="mt-7 leading-[0.9] tracking-[-0.04em]">
            <span className="block text-[30px] font-extrabold">Parlons de</span>
            <span className="block text-[34px] font-light italic" style={serif}>
              votre projet
            </span>
          </h2>
          <div className="mt-3">
            <span className="block h-[2px] w-9 bg-db-red" />
          </div>

          <dl className="mt-7 space-y-3.5 text-[9px]">
            {[
              ["Usine", DAOUD.usine.join(" / ")],
              ["Administration", DAOUD.admin.join(" / ")],
              ["Email", DAOUD.email],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[6.5px] font-bold uppercase tracking-[0.22em] text-paper/60">
                  {k}
                </dt>
                <dd className="mt-[3px] whitespace-pre-line leading-[1.6] text-paper/90">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto pb-9">
            <span className="inline-block bg-db-red px-5 py-2 text-[8px] font-bold uppercase tracking-[0.18em] text-white">
              Livraison directe
            </span>
            <p className="mt-4 text-[7px] uppercase tracking-[0.24em] text-paper/55">
              {DAOUD.website}
            </p>
          </div>
        </div>
      </div>
      <Folio n={page} light />
    </Sheet>
  );
});

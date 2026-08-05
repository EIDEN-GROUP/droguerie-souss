import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  List,
  Maximize2,
  Printer,
  Search,
  Share2,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
} from "lucide-react";
import { products, type Product } from "@/data/products";
import {
  BackCover,
  Brands,
  Cover,
  Divider,
  Editorial,
  FormatPage,
  FullBleed,
  Grid,
  Sommaire,
  PAGE_W,
  PAGE_H,
} from "./pages";
import { useFlipSound } from "./useFlipSound";
import { exportCataloguePdf } from "./exportPdf";

const TITLE = "CATALOGUE SOUSS DROGUERIE 2026";
const PH = "/catalogue-photos/";
const PER_GRID = 9; // grille 3 × 3, calée sur la hauteur utile de la page

/* ─────────── lecture des formats depuis la description produit */

function readFormat(d?: string | null): [number, number] | null {
  if (!d) return null;
  const m = d.match(/format\s+(\d+)\s*[×x]\s*(\d+)/i);
  return m ? [Number(m[1]), Number(m[2])] : null;
}
function readOrigin(d?: string | null): string | null {
  if (!d) return null;
  const m = d.match(/—\s*([^.]+)\./);
  return m ? m[1].trim() : null;
}
const fmtKey = (f: [number, number]) => `${f[0]}×${f[1]}`;

/**
 * Photos d'ambiance rattachées aux formats, d'après ce que montre réellement
 * chaque prise de vue du showroom.
 */
const FORMAT_PHOTO: Record<string, { photo: string; caption: string }> = {
  "19×57": {
    photo: `${PH}showroom-gayafores.jpg`,
    caption: "Présentoirs Gayaforés · showroom Dcheira",
  },
  "20×60": {
    photo: `${PH}ambiance-bois-restaurant.jpg`,
    caption: "Carreau effet bois 20×60 · restaurant",
  },
  "20×120": {
    photo: `${PH}ambiance-cuisine.jpg`,
    caption: "Grand format effet bois · cuisine ouverte",
  },
  "25×75": { photo: `${PH}showroom-multicerame.jpg`, caption: "Multicérame & Argenta · 25×75 mat" },
  "25×50": { photo: `${PH}ambiance-sdb.jpg`, caption: "Faïence murale · salle de bain" },
  "30×60": { photo: `${PH}ambiance-sdb-rose.jpg`, caption: "Marbré rosé 30×60 · salle de bain" },
  "30×90": { photo: `${PH}showroom-deco.jpg`, caption: "Décors et listels · présentoir Gayaforés" },
  "45×45": { photo: `${PH}ambiance-salon.jpg`, caption: "Effet parquet 45×45 · séjour" },
  "41×41": { photo: `${PH}showroom-cerpa.jpg`, caption: "Présentoirs Cerpa · formats carrés" },
  "60×60": {
    photo: `${PH}ambiance-reception.jpg`,
    caption: "Marbré poli 60×60 · réception d'hôtel",
  },
  "120×60": { photo: `${PH}showroom-premium.jpg`, caption: "Multicérame Premium · grands formats" },
  "240×120": { photo: `${PH}beton-cire.jpg`, caption: "Dalle grand format · effet béton ciré" },
};

/** Ambiance d'ouverture par famille. */
const FAMILY_PHOTO: Record<string, string> = {
  Céramique: `${PH}showroom-premium.jpg`,
  Carrelage: `${PH}showroom-deco.jpg`,
  Marbre: `${PH}ambiance-reception.jpg`,
  Zellige: `${PH}ambiance-sdb.jpg`,
  "Sanitaire, Robinetterie, Plomberie": `${PH}showroom-sanitaire.jpg`,
  Plomberie: `${PH}showroom-sanitaire.jpg`,
  "Ciment Colle & Mortiers": `${PH}ciment-colle.jpg`,
  "Béton Armé, Ciments, Agrégats": `${PH}beton-cire.jpg`,
  "Ciment & Granulats": `${PH}beton-cire.jpg`,
  "Plâtres, Mono & Bicouche": `${PH}ambiance-salon.jpg`,
  Plâtre: `${PH}ambiance-salon.jpg`,
  "Peinture & Décoration": `${PH}ambiance-cuisine.jpg`,
  Peinture: `${PH}ambiance-cuisine.jpg`,
  "Étanchéité, Isolation, Bitume": `${PH}beton-cire.jpg`,
  "Fer à Béton, Treillis Soudé": `${PH}beton-cire.jpg`,
  Métallurgie: `${PH}showroom-cerpa.jpg`,
  "Produits Préfabriqués": `${PH}beton-cire.jpg`,
  "Énergie Solaire, Électricité": `${PH}ambiance-cuisine.jpg`,
  Électricité: `${PH}ambiance-cuisine.jpg`,
  "Sécurité au travail": `${PH}showroom-gayafores.jpg`,
};

const BLURB: Record<string, string> = {
  Céramique:
    "Du 19×57 effet parquet au 240×120 grand format. Collections exclusives, production nationale et importation, en mat, poli, semi-poli et relief.",
  "Sanitaire, Robinetterie, Plomberie":
    "Un choix complet d'équipements sanitaires et accessoires pour la salle de bain et la cuisine, alliant qualité, confort et design.",
  "Ciment Colle & Mortiers":
    "Produits de collage et de jointoiement de haute performance, pour une adhérence optimale et une durabilité maximale sur tous supports.",
  "Béton Armé, Ciments, Agrégats":
    "Une gamme diversifiée de matières premières sélectionnées pour accompagner vos travaux, du gros œuvre à la finition.",
  Métallurgie:
    "Fer, acier, tôles, tubes et profilés, répondant aux besoins des professionnels du BTP et de la construction métallique.",
  "Produits Préfabriqués":
    "Agglos, pavés autobloquants, hourdis, bordures et poutrelles précontraintes, garantissant solidité et fiabilité.",
  "Peinture & Décoration":
    "Peintures vinyliques, laquées, décoratives, aquatiques et alimentaires, pour apporter de l'esthétique à vos projets.",
  "Énergie Solaire, Électricité":
    "Chauffe-eaux, kits solaires, onduleurs, batteries et accessoires, pour un habitat plus économe et plus durable.",
  "Plâtres, Mono & Bicouche":
    "Plâtres et enduits projetés mono et bicouche, pour des surfaces régulières et durables, en intérieur comme en façade.",
  "Étanchéité, Isolation, Bitume":
    "Laine de verre, rouleaux bitumés et systèmes d'étanchéité répondant aux exigences d'imperméabilité et d'isolation.",
  "Fer à Béton, Treillis Soudé":
    "Indispensables au béton armé, ils assurent la résistance et la stabilité de vos ouvrages.",
};

const FAMILY_ORDER = [
  "Céramique",
  "Carrelage",
  "Marbre",
  "Zellige",
  "Ciment Colle & Mortiers",
  "Sanitaire, Robinetterie, Plomberie",
  "Plomberie",
  "Étanchéité, Isolation, Bitume",
  "Fer à Béton, Treillis Soudé",
  "Métallurgie",
  "Produits Préfabriqués",
  "Béton Armé, Ciments, Agrégats",
  "Ciment & Granulats",
  "Plâtres, Mono & Bicouche",
  "Plâtre",
  "Peinture & Décoration",
  "Peinture",
  "Énergie Solaire, Électricité",
  "Électricité",
  "Sécurité au travail",
];

function ToolButton({
  label,
  onClick,
  href,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const cls = `grid h-9 w-9 place-items-center rounded transition-colors hover:bg-mint hover:text-brand ${
    active ? "text-brand" : "text-ink-soft"
  }`;
  if (href)
    return (
      <a href={href} download title={label} aria-label={label} className={cls}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={cls}>
      {children}
    </button>
  );
}

/** react-pageflip n'expose pas ses types : on déclare la surface utilisée. */
interface PageFlipApi {
  flip: (page: number) => void;
  flipNext: () => void;
  flipPrev: () => void;
}
interface BookHandle {
  pageFlip: () => PageFlipApi | undefined;
}

/**
 * `embedded` : la liseuse est posée dans une page classique (en-tête et pied de
 * page visibles) plutôt qu'en plein écran. Seule la hauteur de la coque change —
 * la scène est mesurée au ResizeObserver, le livre se recale donc tout seul.
 */
export default function Flipbook({ embedded = false }: { embedded?: boolean }) {
  const bookRef = useRef<BookHandle | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [thumbs, setThumbs] = useState(false);
  const [finder, setFinder] = useState(false);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [portrait, setPortrait] = useState(false);
  const [sound, setSound] = useState(true);
  const [pdf, setPdf] = useState<{ done: number; total: number } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const playFlip = useFlipSound(sound);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setPortrait(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /**
   * Le chemin de fer suit celui du catalogue imprimé : couverture, mot du
   * directeur, chiffres, sommaire, puis pour chaque famille une ouverture
   * pleine page, les formats, et enfin les planches de références.
   */
  const { nodes, total, entries, index } = useMemo(() => {
    const enriched = products.map((p) => ({
      ...p,
      dims: readFormat(p.description),
      origin: readOrigin(p.description),
    }));

    const families = [...new Set(enriched.map((p) => p.category))].sort((a, b) => {
      const ia = FAMILY_ORDER.indexOf(a);
      const ib = FAMILY_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });

    const nodes: React.ReactNode[] = [];
    const entries: { label: string; page: number; note?: string }[] = [];
    const index: { name: string; category: string; page: number }[] = [];
    let n = 1;

    nodes.push(<Cover key="cover" />);
    n++;

    nodes.push(
      <Editorial
        key="mot"
        page={n}
        kicker="Mot du directeur"
        light="Construire avec"
        bold="expérience"
        photo={`${PH}facade-jour.jpg`}
        caption="Notre siège · 29 Bd Mohamed V, Dcheira — Inezgane"
        body={[
          "Chers clients et partenaires, depuis 1993 Souss Droguerie accompagne les professionnels et les particuliers dans leurs projets de construction à travers une offre complète de matériaux fiables et performants.",
          "Notre priorité a toujours été d'apporter qualité, disponibilité et conseil technique afin de garantir la réussite de vos réalisations, du gros œuvre à la finition.",
          "Nous remercions l'ensemble de nos clients, partenaires et collaborateurs pour leur confiance continue.",
        ]}
        signature="La Direction"
      />,
    );
    n++;

    nodes.push(
      <Brands
        key="brands"
        page={n}
        stats={[
          [String(products.length), "Références"],
          [String(families.length), "Familles"],
          ["1993", "Depuis"],
        ]}
        brands={[
          "Gayaforés",
          "Multicérame",
          "Argenta",
          "Cerpa",
          "Somalaval",
          "Daoud Building",
          "Super Cérame",
          "Sika Maroc",
          "Lafarge Holcim",
          "Ciment du Maroc",
        ]}
      />,
    );
    n++;

    const sommaireAt = nodes.length;
    nodes.push(<Sommaire key="sommaire" page={n} entries={[]} />);
    n++;

    nodes.push(
      <FullBleed
        key="ouverture"
        page={n}
        photo={`${PH}beton-cire.jpg`}
        quote="Chaque chantier commence par le choix d'une matière."
        caption="Effet béton ciré · grand format"
      />,
    );
    n++;

    families.forEach((fam, fi) => {
      const group = enriched.filter((p) => p.category === fam);
      entries.push({
        label: fam,
        page: n,
        note: `${group.length} réf.`,
      });

      nodes.push(
        <Divider
          key={`d-${fam}`}
          index={fi + 1}
          category={fam}
          count={group.length}
          page={n}
          photo={FAMILY_PHOTO[fam] ?? `${PH}showroom-gayafores.jpg`}
          blurb={
            BLURB[fam] ??
            "Une sélection de références disponibles en stock sur nos dépôts d'Agadir, Inezgane et Ait Melloul."
          }
        />,
      );
      n++;

      // Pages « format », d'abord — c'est la logique du catalogue papier.
      const byFormat = new Map<string, typeof group>();
      for (const p of group) {
        if (!p.dims) continue;
        const k = fmtKey(p.dims);
        byFormat.set(k, [...(byFormat.get(k) ?? []), p]);
      }
      const allFormats = [...byFormat.keys()]
        .map((k) => k.split("×").map(Number) as [number, number])
        .sort((a, b) => b[0] * b[1] - a[0] * a[1]);

      const formatted = new Set<string>();
      for (const [key, items] of [...byFormat.entries()].sort(
        (a, b) => b[1].length - a[1].length,
      )) {
        if (items.length < 3) continue;
        const dims = key.split("×").map(Number) as [number, number];
        const meta = FORMAT_PHOTO[key];
        for (const it of items) {
          index.push({ name: it.name, category: fam, page: n });
          formatted.add(it.name);
        }
        nodes.push(
          <FormatPage
            key={`fmt-${fam}-${key}`}
            page={n}
            family={fam}
            origin={items[0].origin ?? fam}
            format={`${key} cm`}
            dims={dims}
            items={items as Product[]}
            photo={meta?.photo}
            caption={meta?.caption}
            allFormats={allFormats}
          />,
        );
        n++;
      }

      // Le reste en planches classiques.
      const rest = group.filter((p) => !formatted.has(p.name));
      for (let i = 0; i < rest.length; i += PER_GRID) {
        const slice = rest.slice(i, i + PER_GRID);
        for (const it of slice) index.push({ name: it.name, category: fam, page: n });
        nodes.push(
          <Grid key={`g-${fam}-${i}`} category={fam} items={slice as Product[]} page={n} />,
        );
        n++;
      }
    });

    nodes[sommaireAt] = <Sommaire key="sommaire" page={4} entries={entries} />;
    nodes.push(<BackCover key="back" page={n} />);

    // Un livre se relie par cahiers : le nombre de pages doit rester pair.
    if (nodes.length % 2 !== 0)
      nodes.splice(nodes.length - 1, 0, <Grid key="pad" category="" items={[]} page={n} />);

    return { nodes, total: nodes.length, entries, index };
  }, []);

  const flip = useCallback(
    (to: number) => bookRef.current?.pageFlip()?.flip(Math.min(Math.max(to, 0), total - 1)),
    [total],
  );
  const next = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const prev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") {
        setThumbs(false);
        setFinder(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, index]);

  const solo = page === 0 || page >= total - 1 || portrait;

  /**
   * Le livre occupe toute la hauteur utile : on part de la place disponible et
   * on retombe sur la largeur si la double page déborde de l'écran.
   */
  /**
   * Les pages sont composées à taille fixe (500 × 707) : c'est ce qui garantit
   * que la typographie, les marges et les filets gardent leurs proportions.
   * Pour remplir l'écran on agrandit le livre entier au transform, plutôt que
   * de redimensionner les pages — sinon le texte, figé en pixels, rapetisse et
   * le bas des pages se vide.
   */
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.6);
  useEffect(() => {
    // On mesure la scène réelle plutôt que de deviner la hauteur des barres :
    // c'est la seule façon de ne jamais rogner le bas du livre.
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const availH = Math.max(240, r.height - 12);
      const availW = Math.max(240, r.width - (portrait ? 8 : 72));
      const single = portrait ? 1 : 2;
      setFit(Math.min(availH / PAGE_H, availW / (PAGE_W * single)));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Le passage en plein écran ne redimensionne pas toujours la scène au moment
    // où l'événement part : on repasse une mesure une fois la transition finie.
    const later = () => {
      measure();
      requestAnimationFrame(measure);
      setTimeout(measure, 120);
      setTimeout(measure, 400);
    };
    document.addEventListener("fullscreenchange", later);
    window.addEventListener("resize", later);
    window.addEventListener("orientationchange", later);
    return () => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", later);
      window.removeEventListener("resize", later);
      window.removeEventListener("orientationchange", later);
    };
  }, [portrait]);

  const w = PAGE_W;
  const h = PAGE_H;
  const k = fit * zoom;

  /**
   * Épaisseur du livre : la tranche de gauche grossit à mesure qu'on avance,
   * celle de droite s'amincit. C'est ce détail qui donne l'impression de tenir
   * un ouvrage plutôt que de faire défiler des images.
   */
  const progress = total > 1 ? page / (total - 1) : 0;
  const stackL = Math.round(2 + progress * 13);
  const stackR = Math.round(2 + (1 - progress) * 13);
  const SHEETS =
    "repeating-linear-gradient(to right, rgba(0,0,0,.16) 0 1px, rgba(255,255,255,.92) 1px 3px)";

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: TITLE, url });
        return;
      } catch {
        /* annulé par l'utilisateur */
      }
    }
    await navigator.clipboard?.writeText(url);
  };

  const downloadPdf = async () => {
    const stage = printRef.current;
    if (!stage || pdf) return;
    // La scène d'export est rendue par React : sans flushSync, les pages ne sont
    // pas encore dans le DOM quand la capture démarre, et le PDF échoue
    // silencieusement (« Aucune page à exporter »). On force le commit synchrone.
    flushSync(() => setPdf({ done: 0, total: total }));
    try {
      await exportCataloguePdf(stage, (done, t) => setPdf({ done, total: t }));
    } catch (err) {
      console.error("Export PDF impossible", err);
    } finally {
      setPdf(null);
    }
  };

  const fullscreen = () => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <div
      ref={shellRef}
      className={`relative flex w-full flex-col overflow-hidden bg-[#f2f2f0] ${
        embedded
          ? "h-[min(86vh,900px)] min-h-[520px] rounded-2xl border [&:fullscreen]:h-screen [&:fullscreen]:max-h-none [&:fullscreen]:rounded-none"
          : "h-[100dvh]"
      }`}
    >
      <div className="flex items-center justify-between px-5 pb-2 pt-3">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold tracking-[0.02em] text-ink">{TITLE}</span>
          <span className="rounded bg-mint px-2.5 py-1 text-[11px] tabular-nums text-ink">
            {solo
              ? `page ${page + 1} sur ${total}`
              : `pages ${page + 1} – ${Math.min(page + 2, total)} sur ${total}`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFinder((v) => !v)}
          aria-label="Rechercher"
          className="grid h-9 w-9 place-items-center rounded text-ink-soft transition-colors hover:bg-mint hover:text-brand"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-12"
      >
        <button
          type="button"
          onClick={prev}
          disabled={page === 0}
          aria-label="Page précédente"
          className="absolute left-1 z-10 grid h-14 w-9 place-items-center text-ink-soft/50 transition-colors hover:text-ink disabled:opacity-20 sm:left-4"
        >
          <ChevronLeft className="h-9 w-9" strokeWidth={1.2} />
        </button>

        {/*
          En mode double page, react-pageflip conserve un plan de travail de deux
          pages : la couverture s'affiche dans la moitié droite, la quatrième de
          couverture dans la gauche. On resserre la fenêtre sur la page utile et
          on décale le plan, sinon le livre paraît flanqué d'une page blanche.
        */}
        <div
          className="relative transition-[width,height] duration-500"
          style={{ width: (solo ? w : w * 2) * k, height: h * k }}
        >
          {/* tranches de papier : le livre s'épaissit à gauche à mesure qu'on avance */}
          {!portrait && !solo && (
            <>
              <div
                className="pointer-events-none absolute top-[1%] z-10 h-[98%] rounded-l-sm shadow-[-2px_0_6px_-2px_rgba(0,0,0,.25)] transition-[width] duration-500"
                style={{ right: "100%", width: stackL, backgroundImage: SHEETS }}
              />
              <div
                className="pointer-events-none absolute top-[1%] z-10 h-[98%] rounded-r-sm shadow-[2px_0_6px_-2px_rgba(0,0,0,.25)] transition-[width] duration-500"
                style={{ left: "100%", width: stackR, backgroundImage: SHEETS }}
              />
            </>
          )}

          <div className="overflow-hidden" style={{ width: (solo ? w : w * 2) * k, height: h * k }}>
            <div
              className="origin-top-left shadow-[0_30px_70px_-30px_rgba(17,17,20,0.55)] transition-transform duration-500"
              style={{
                width: portrait ? w : w * 2,
                transform: `scale(${k}) translateX(${!portrait && page === 0 ? -w : 0}px)`,
              }}
            >
              {/* @ts-expect-error react-pageflip ships loose types */}
              <HTMLFlipBook
                ref={bookRef}
                width={w}
                height={h}
                size="fixed"
                minWidth={w}
                maxWidth={w}
                minHeight={h}
                maxHeight={h}
                usePortrait={portrait}
                drawShadow
                flippingTime={700}
                maxShadowOpacity={0.4}
                showCover
                mobileScrollSupport
                onFlip={(e: { data: number }) => {
                  setPage(e.data);
                  playFlip();
                }}
                className="catalogue-book"
              >
                {nodes}
              </HTMLFlipBook>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          disabled={page >= total - 1}
          aria-label="Page suivante"
          className="absolute right-1 z-10 grid h-14 w-9 place-items-center text-ink-soft/50 transition-colors hover:text-ink disabled:opacity-20 sm:right-4"
        >
          <ChevronRight className="h-9 w-9" strokeWidth={1.2} />
        </button>
      </div>

      <div className="relative flex items-center justify-center px-5 pb-3 pt-2">
        <button
          type="button"
          onClick={() => flip(0)}
          aria-label="Première page"
          className="absolute left-5 grid h-9 w-9 place-items-center rounded text-ink-soft transition-colors hover:bg-mint hover:text-brand"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          <ToolButton label="Sommaire" onClick={() => setThumbs(true)}>
            <List className="h-[18px] w-[18px]" />
          </ToolButton>
          <span className="mx-1.5 h-5 w-px bg-border" />
          <ToolButton label="Partager" onClick={share}>
            <Share2 className="h-[18px] w-[18px]" />
          </ToolButton>
          <ToolButton label="Imprimer" onClick={() => window.print()}>
            <Printer className="h-[18px] w-[18px]" />
          </ToolButton>
          <ToolButton
            label={pdf ? `Export en cours… ${pdf.done}/${pdf.total}` : "Télécharger le PDF"}
            onClick={downloadPdf}
            active={!!pdf}
          >
            <Download className={`h-[18px] w-[18px] ${pdf ? "animate-pulse" : ""}`} />
          </ToolButton>
          <span className="mx-1.5 h-5 w-px bg-border" />
          <ToolButton
            label={sound ? "Couper le son" : "Activer le son"}
            onClick={() => setSound((s) => !s)}
            active={sound}
          >
            {sound ? (
              <Volume2 className="h-[18px] w-[18px]" />
            ) : (
              <VolumeX className="h-[18px] w-[18px]" />
            )}
          </ToolButton>
          <ToolButton
            label="Agrandir"
            onClick={() => setZoom((z) => (z >= 1.5 ? 1 : Math.round((z + 0.25) * 100) / 100))}
          >
            <ZoomIn className="h-[18px] w-[18px]" />
          </ToolButton>
          <ToolButton label="Plein écran" onClick={fullscreen}>
            <Maximize2 className="h-[18px] w-[18px]" />
          </ToolButton>
        </div>

        <button
          type="button"
          onClick={() => flip(total - 1)}
          aria-label="Dernière page"
          className="absolute right-5 grid h-9 w-9 place-items-center rounded text-ink-soft transition-colors hover:bg-mint hover:text-brand"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/*
        Scène d'export : les mêmes pages, rendues hors écran à leur taille de
        composition. On ne peut pas photographier le livre lui-même — ses pages
        sont transformées, retournées, et la moitié n'est pas montée.
      */}
      <div
        ref={printRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0"
        style={{ width: PAGE_W, height: PAGE_H, overflow: "hidden" }}
      >
        {pdf && (
          <div style={{ width: PAGE_W }}>
            {nodes.map((node, i) => (
              <div key={i} style={{ width: PAGE_W, height: PAGE_H }}>
                {node}
              </div>
            ))}
          </div>
        )}
      </div>

      {pdf && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-ink/70">
          <div className="w-64 rounded-lg bg-paper p-5 text-center shadow-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
              Préparation du PDF
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded bg-mint">
              <div
                className="h-full bg-brand transition-[width] duration-200"
                style={{ width: `${Math.round((pdf.done / Math.max(1, pdf.total)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] tabular-nums text-ink-soft">
              {pdf.done} / {pdf.total} pages
            </p>
          </div>
        </div>
      )}

      {finder && (
        <div className="absolute right-5 top-14 z-30 w-[min(320px,90vw)] rounded-lg border border-border bg-paper p-3 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Référence ou famille…"
              className="w-full rounded border border-border bg-cream py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>
          {query && (
            <ul className="mt-2 max-h-64 overflow-y-auto">
              {results.length === 0 && (
                <li className="px-2 py-3 text-xs text-ink-soft">Aucun résultat.</li>
              )}
              {results.map((r, i) => (
                <li key={`${r.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      flip(r.page - 1);
                      setFinder(false);
                      setQuery("");
                    }}
                    className="flex w-full items-baseline justify-between gap-3 rounded px-2 py-1.5 text-left transition hover:bg-cream"
                  >
                    <span className="truncate text-xs font-medium text-ink">{r.name}</span>
                    <span className="shrink-0 text-[10px] tabular-nums text-ink-soft">
                      p. {r.page}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {thumbs && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/95 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-paper">
                Sommaire
              </p>
              <button
                type="button"
                onClick={() => setThumbs(false)}
                aria-label="Fermer"
                className="grid h-9 w-9 place-items-center rounded-full border border-paper/30 text-paper transition hover:bg-paper/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-0">
              {entries.map((e) => (
                <li key={e.label}>
                  <button
                    type="button"
                    onClick={() => {
                      flip(e.page - 1);
                      setThumbs(false);
                    }}
                    className="flex w-full items-baseline gap-3 border-b border-paper/10 py-2.5 text-left transition hover:border-accent-red"
                  >
                    <span className="text-[13px] font-medium text-paper">{e.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-sky">
                      {e.note}
                    </span>
                    <span className="mx-1 flex-1 border-b border-dotted border-paper/20" />
                    <span className="text-[12px] font-bold tabular-nums text-paper">
                      {String(e.page).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

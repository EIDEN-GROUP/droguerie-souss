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
  Search,
  Share2,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
} from "lucide-react";
import {
  DAOUD_H,
  DAOUD_W,
  DaoudAttestations,
  DaoudBackCover,
  DaoudCover,
  DaoudEngagements,
  DaoudExpertise,
  DaoudFamilyIntro,
  DaoudIntro,
  DaoudMateriaux,
  DaoudMot,
  DaoudPlanchers,
  DaoudSol,
  DaoudSommaire,
  DaoudSpecTablePage,
  DaoudTopic,
  DaoudValeurs,
  DaoudVisions,
  type DaoudSommaireEntry,
} from "./daoudPages";
import {
  DAOUD,
  daoudAgglosA,
  daoudAgglosB,
  daoudAgglosIntro,
  daoudAttestations,
  daoudBordureIntro,
  daoudBordures,
  daoudHourdis,
  daoudImg,
  daoudPaveIntro,
  daoudPaves,
  daoudPavesCalepinage,
  daoudPoutrelleEnrobee,
  daoudPoutrellePC,
  daoudServices,
  daoudSol33,
  daoudSol40,
  daoudSpeciaux,
  daoudTechno,
} from "@/data/daoud-catalogue";
import { useFlipSound } from "@/components/preview-catalogue/useFlipSound";
import { exportDaoudCataloguePdf } from "./daoudExport";
import { Toaster } from "@/components/ui/sonner";
import { shareLink } from "@/lib/share";

const TITLE = "CATALOGUE DAOUD BUILDING";

interface PageFlipApi {
  flip: (page: number) => void;
  flipNext: () => void;
  flipPrev: () => void;
}
interface BookHandle {
  pageFlip: () => PageFlipApi | undefined;
}

export default function DaoudFlipbook({ embedded = false }: { embedded?: boolean }) {
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

  const { nodes, total, entries, index } = useMemo(() => {
    const nodes: React.ReactNode[] = [];
    const entries: DaoudSommaireEntry[] = [];
    const index: { name: string; category: string; page: number }[] = [];
    let n = 1;
    const push = (node: React.ReactNode, label?: string, note?: string) => {
      nodes.push(node);
      if (label) entries.push({ label, page: n, note });
      n++;
    };

    push(<DaoudCover key="cover" />);
    push(<DaoudMot key="mot1" page={n} part={1} />);
    push(<DaoudMot key="mot2" page={n} part={2} />);
    push(<DaoudIntro key="intro" page={n} />);
    const sommaireAt = nodes.length;
    push(<DaoudSommaire key="sommaire" page={n} entries={[]} />);
    push(<DaoudVisions key="visions" page={n} />);
    push(<DaoudValeurs key="valeurs" page={n} />);

    push(
      <DaoudFamilyIntro
        key="agglos"
        page={n}
        folio="Agglos"
        kicker="Béton préfabriqué"
        light="Les"
        bold="agglos"
        paras={daoudAgglosIntro}
        images={[
          { src: daoudImg("agglo-schema"), alt: "Bloc agglo · coupe", height: 190 },
          { src: daoudImg("brick-icon"), alt: "Mur en agglos", height: 190 },
        ]}
      />,
      "Agglos",
    );
    for (const t of [daoudAgglosA, daoudAgglosB]) {
      t.headers.forEach((h) => index.push({ name: h, category: "Agglos", page: n }));
      push(
        <DaoudSpecTablePage
          key={`spec-${t.headers[0]}`}
          page={n}
          folio="Agglos"
          titleLight="Les"
          titleBold="agglos"
          table={t}
        />,
      );
    }

    push(<DaoudPlanchers key="planchers" page={n} />, "Planchers");
    daoudHourdis.headers.forEach((h) => index.push({ name: h, category: "Planchers", page: n }));
    push(
      <DaoudSpecTablePage
        key="spec-hourdis"
        page={n}
        folio="Planchers"
        titleLight="Les"
        titleBold="hourdis"
        table={daoudHourdis}
      />,
    );

    index.push({ name: "Poutrelle Enrobée", category: "Planchers", page: n });
    push(
      <DaoudSpecTablePage
        key="spec-enrobee"
        page={n}
        folio="Planchers"
        titleLight="Poutrelle"
        titleBold="enrobée"
        table={daoudPoutrelleEnrobee}
        banner={daoudImg("poutrelle-photo")}
        bannerAlt="Poutrelle enrobée"
      />,
      "Poutrelles",
    );
    daoudPoutrellePC.rows.forEach((r) =>
      index.push({ name: r.label, category: "Poutrelles", page: n }),
    );
    push(
      <DaoudSpecTablePage
        key="spec-pc"
        page={n}
        folio="Planchers"
        titleLight="Poutrelle"
        titleBold="précontrainte"
        table={daoudPoutrellePC}
        banner={daoudImg("poutrelle-pc-photo")}
        bannerAlt="Poutrelle précontrainte"
      />,
    );

    push(
      <DaoudFamilyIntro
        key="pave"
        page={n}
        folio="Pavé autobloquant"
        kicker="Voirie"
        light="Pavé"
        bold="autobloquant"
        paras={[daoudPaveIntro.lead, ...daoudPaveIntro.bullets, daoudPaveIntro.closing]}
        images={[{ src: daoudImg("pose-photo"), alt: "Pose de pavés", height: 230 }]}
      />,
      "Pavé autobloquant",
    );
    daoudPaves.headers.forEach((h) => index.push({ name: h, category: "Pavés", page: n }));
    push(
      <DaoudSpecTablePage
        key="spec-paves"
        page={n}
        folio="Pavés"
        titleLight="Les"
        titleBold="pavés"
        table={daoudPaves}
        galleries={[
          {
            label: "Plans",
            images: [
              { src: daoudImg("pave-dim-1") },
              { src: daoudImg("pave-dim-2") },
              { src: daoudImg("pave-dim-3") },
            ],
          },
          { label: "Exemples calepinage", images: daoudPavesCalepinage },
        ]}
      />,
    );

    push(
      <DaoudFamilyIntro
        key="bordure"
        page={n}
        folio="Bordure"
        kicker="Aménagements"
        light="La"
        bold="bordure"
        paras={[
          daoudBordureIntro.lead,
          daoudBordureIntro.norm,
          ...daoudBordureIntro.bullets,
          daoudBordureIntro.closing,
        ]}
        images={[{ src: daoudImg("bordure-photo"), alt: "Bordure béton", height: 230 }]}
      />,
      "Bordure",
    );
    daoudBordures.headers.forEach((h) => index.push({ name: h, category: "Bordures", page: n }));
    push(
      <DaoudSpecTablePage
        key="spec-bordures"
        page={n}
        folio="Bordures"
        titleLight="Les"
        titleBold="bordures"
        table={daoudBordures}
        galleries={[
          {
            label: "Plans",
            images: [{ src: daoudImg("bordure-dim-t2") }, { src: daoudImg("bordure-dim-t3") }],
          },
        ]}
      />,
    );

    daoudSol33.forEach((t) => index.push({ name: t.name, category: "Revêtement du sol", page: n }));
    push(
      <DaoudSol key="sol33" page={n} format="33 × 33" tiles={daoudSol33} cols={3} />,
      "Revêtement du sol",
    );
    daoudSol40.forEach((t) => index.push({ name: t.name, category: "Revêtement du sol", page: n }));
    push(<DaoudSol key="sol40" page={n} format="40 × 60" tiles={daoudSol40} />);

    push(
      <DaoudFamilyIntro
        key="speciaux"
        page={n}
        folio="Produits spéciaux"
        kicker="Sur mesure"
        light="Produits"
        bold="spéciaux"
        paras={daoudSpeciaux}
        images={[{ src: daoudImg("blocs-photo"), alt: "Produits sur mesure", height: 230 }]}
      />,
      "Produits spéciaux",
    );

    push(
      <DaoudTopic
        key="services"
        page={n}
        folio="Services"
        kicker="Logistique"
        light="Services &"
        bold="infrastructures"
        paras={[daoudServices.intro, daoudServices.lead]}
        bullets={daoudServices.items}
        photos={[
          { src: daoudImg("trucks-photo"), caption: "Flotte logistique" },
          { src: daoudImg("highway-photo"), caption: "Livraison chantiers" },
        ]}
      />,
      "Services",
    );
    push(<DaoudExpertise key="expertise" page={n} />, "Notre expertise");
    push(<DaoudMateriaux key="materiaux" page={n} />);
    push(
      <DaoudTopic
        key="techno"
        page={n}
        folio="Technologie"
        kicker="Innovation"
        light="Technologie &"
        bold="innovation"
        paras={[...daoudTechno.intro, daoudTechno.lead]}
        bullets={[...daoudTechno.garanties, ...daoudTechno.items]}
        photos={[
          { src: daoudImg("eoliennes-photo"), caption: "Énergies renouvelables" },
          { src: daoudImg("solaire-photo"), caption: "Panneaux solaires" },
        ]}
      />,
      "Technologie",
    );
    push(<DaoudEngagements key="engagements" page={n} />, "Engagements");

    daoudAttestations.forEach((a, i) => {
      push(
        <DaoudAttestations key={`att-${i}`} page={n} index={i} />,
        i === 0 ? "Attestations" : undefined,
      );
    });

    push(<DaoudBackCover key="back" page={n} />);

    nodes[sommaireAt] = <DaoudSommaire key="sommaire" page={5} entries={entries} />;

    // Un livre se relie par cahiers : le nombre de pages doit rester pair.
    if (nodes.length % 2 !== 0)
      nodes.splice(nodes.length - 1, 0, <DaoudIntro key="pad" page={n} />);

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

  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.6);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const availH = Math.max(240, r.height - 12);
      const availW = Math.max(240, r.width - (portrait ? 8 : 72));
      const single = portrait ? 1 : 2;
      setFit(Math.min(availH / DAOUD_H, availW / (DAOUD_W * single)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
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

  const k = fit * zoom;

  const progress = total > 1 ? page / (total - 1) : 0;
  const stackL = Math.round(2 + progress * 13);
  const stackR = Math.round(2 + (1 - progress) * 13);
  const SHEETS =
    "repeating-linear-gradient(to right, rgba(0,0,0,.16) 0 1px, rgba(255,255,255,.92) 1px 3px)";

  const share = () => shareLink(TITLE);

  const downloadPdf = async () => {
    const stage = printRef.current;
    if (!stage || pdf) return;
    flushSync(() => setPdf({ done: 0, total }));
    try {
      await exportDaoudCataloguePdf(stage, (done, t) => setPdf({ done, total: t }));
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

  const toolBtn = `grid h-9 w-9 place-items-center rounded transition-colors hover:bg-db-blue/10 hover:text-db-blue ${
    pdf ? "text-db-blue" : "text-db-ink/60"
  }`;

  return (
    <div
      ref={shellRef}
      className={`relative flex w-full flex-col overflow-hidden bg-db-paper ${
        embedded
          ? "h-[min(86vh,900px)] min-h-[520px] rounded-2xl border border-db-blue/15 [&:fullscreen]:h-screen [&:fullscreen]:max-h-none [&:fullscreen]:rounded-none"
          : "h-[100dvh]"
      }`}
    >
      <div className="flex items-center justify-between px-5 pb-2 pt-3">
        <div className="flex items-center gap-3">
          <span
            className="text-[12px] font-bold tracking-[0.02em] text-db-blue"
            style={{ fontFamily: "var(--font-db-serif)" }}
          >
            {TITLE}
          </span>
          <span
            className="rounded bg-db-blue/10 px-2.5 py-1 text-[11px] tabular-nums text-db-blue"
            style={{ fontFamily: "var(--font-db-serif)" }}
          >
            {solo
              ? `page ${page + 1} sur ${total}`
              : `pages ${page + 1} - ${Math.min(page + 2, total)} sur ${total}`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFinder((v) => !v)}
          aria-label="Rechercher"
          className="grid h-9 w-9 place-items-center rounded text-db-ink/60 transition-colors hover:bg-db-blue/10 hover:text-db-blue"
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
          className="absolute left-1 z-10 grid h-14 w-9 place-items-center text-db-ink/30 transition-colors hover:text-db-blue disabled:opacity-20 sm:left-4"
        >
          <ChevronLeft className="h-9 w-9" strokeWidth={1.2} />
        </button>

        <div
          className="relative transition-[width,height] duration-500"
          style={{ width: (solo ? DAOUD_W : DAOUD_W * 2) * k, height: DAOUD_H * k }}
        >
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

          <div
            className="overflow-hidden"
            style={{ width: (solo ? DAOUD_W : DAOUD_W * 2) * k, height: DAOUD_H * k }}
          >
            <div
              className="origin-top-left shadow-[0_30px_70px_-30px_rgba(17,17,20,0.55)] transition-transform duration-500"
              style={{
                width: portrait ? DAOUD_W : DAOUD_W * 2,
                transform: `scale(${k}) translateX(${!portrait && page === 0 ? -DAOUD_W : 0}px)`,
              }}
            >
              {/* @ts-expect-error react-pageflip ships loose types */}
              <HTMLFlipBook
                ref={bookRef}
                width={DAOUD_W}
                height={DAOUD_H}
                size="fixed"
                minWidth={DAOUD_W}
                maxWidth={DAOUD_W}
                minHeight={DAOUD_H}
                maxHeight={DAOUD_H}
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
                className="daoud-book"
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
          className="absolute right-1 z-10 grid h-14 w-9 place-items-center text-db-ink/30 transition-colors hover:text-db-blue disabled:opacity-20 sm:right-4"
        >
          <ChevronRight className="h-9 w-9" strokeWidth={1.2} />
        </button>
      </div>

      <div className="relative flex items-center justify-center px-5 pb-3 pt-2">
        <button
          type="button"
          onClick={() => flip(0)}
          aria-label="Première page"
          className={`absolute left-5 ${toolBtn}`}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setThumbs(true)}
            title="Sommaire"
            aria-label="Sommaire"
            className={toolBtn}
          >
            <List className="h-[18px] w-[18px]" />
          </button>
          <span className="mx-1.5 h-5 w-px bg-db-blue/15" />
          <button
            type="button"
            onClick={share}
            title="Partager"
            aria-label="Partager"
            className={toolBtn}
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            title={pdf ? `Export en cours… ${pdf.done}/${pdf.total}` : "Télécharger le PDF"}
            aria-label="Télécharger le PDF"
            onClick={downloadPdf}
            className={`${toolBtn} ${pdf ? "text-db-blue" : ""}`}
          >
            <Download className={`h-[18px] w-[18px] ${pdf ? "animate-pulse" : ""}`} />
          </button>
          <span className="mx-1.5 h-5 w-px bg-db-ink/15" />
          <button
            type="button"
            title={sound ? "Couper le son" : "Activer le son"}
            aria-label={sound ? "Couper le son" : "Activer le son"}
            onClick={() => setSound((s) => !s)}
            className={`${toolBtn} ${sound ? "text-db-blue" : ""}`}
          >
            {sound ? (
              <Volume2 className="h-[18px] w-[18px]" />
            ) : (
              <VolumeX className="h-[18px] w-[18px]" />
            )}
          </button>
          <button
            type="button"
            title="Agrandir"
            aria-label="Agrandir"
            onClick={() => setZoom((z) => (z >= 1.5 ? 1 : Math.round((z + 0.25) * 100) / 100))}
            className={toolBtn}
          >
            <ZoomIn className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            title="Plein écran"
            aria-label="Plein écran"
            onClick={fullscreen}
            className={toolBtn}
          >
            <Maximize2 className="h-[18px] w-[18px]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => flip(total - 1)}
          aria-label="Dernière page"
          className={`absolute right-5 ${toolBtn}`}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={printRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0"
        style={{ width: DAOUD_W, height: DAOUD_H, overflow: "hidden" }}
      >
        {pdf && (
          <div style={{ width: DAOUD_W }}>
            {nodes.map((node, i) => (
              <div key={i} style={{ width: DAOUD_W, height: DAOUD_H }}>
                {node}
              </div>
            ))}
          </div>
        )}
      </div>

      {pdf && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-db-deep/70">
          <div className="w-64 rounded-lg bg-white p-5 text-center shadow-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-db-ink">
              Préparation du PDF
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded bg-db-blue/10">
              <div
                className="h-full bg-db-blue transition-[width] duration-200"
                style={{ width: `${Math.round((pdf.done / Math.max(1, pdf.total)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] tabular-nums text-db-ink/60">
              {pdf.done} / {pdf.total} pages
            </p>
          </div>
        </div>
      )}

      <Toaster position="bottom-center" />
      {finder && (
        <div className="absolute right-5 top-14 z-30 w-[min(320px,90vw)] rounded-lg border border-db-blue/15 bg-white p-3 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-db-ink/50" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produit ou famille…"
              className="w-full rounded border border-db-blue/20 bg-db-paper py-2 pl-9 pr-3 text-sm text-db-ink outline-none focus:border-db-blue"
            />
          </div>
          {query && (
            <ul className="mt-2 max-h-64 overflow-y-auto">
              {results.length === 0 && (
                <li className="px-2 py-3 text-xs text-db-ink/60">Aucun résultat.</li>
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
                    className="flex w-full items-baseline justify-between gap-3 rounded px-2 py-1.5 text-left transition hover:bg-db-blue/10"
                  >
                    <span className="truncate text-xs font-medium text-db-ink">{r.name}</span>
                    <span className="shrink-0 text-[10px] tabular-nums text-db-ink/50">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-db-deep/95 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center justify-between">
              <p
                className="text-sm font-bold uppercase tracking-[0.2em] text-paper"
                style={{ fontFamily: "var(--font-db-serif)" }}
              >
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
                    className="flex w-full items-baseline gap-3 border-b border-paper/10 py-2.5 text-left transition hover:border-db-red"
                  >
                    <span className="text-[13px] font-medium text-paper">{e.label}</span>
                    {e.note && (
                      <span className="text-[10px] uppercase tracking-[0.14em] text-paper/60">
                        {e.note}
                      </span>
                    )}
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

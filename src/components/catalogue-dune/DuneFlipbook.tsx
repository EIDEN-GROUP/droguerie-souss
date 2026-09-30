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
  DuneAbout,
  DuneBackCover,
  DuneCeramic,
  DuneCover,
  DuneGlueBrands,
  DuneInterlude,
  DunePlates,
  DuneSommaire,
  DuneTopicPage,
  DuneUsines,
  DUNE_H,
  DUNE_W,
  type DuneSommaireEntry,
} from "./dunePages";
import {
  duneCeramicPlates,
  duneFloorPlates,
  duneModelLabel,
  duneTopics,
} from "@/data/dune-catalogue";
import { useFlipSound } from "@/components/preview-catalogue/useFlipSound";
import { exportDuneCataloguePdf } from "./duneExport";
import { Toaster } from "@/components/ui/sonner";
import { shareLink } from "@/lib/share";

const TITLE = "CATALOGUE DUNE DISTRIBUTION";

interface PageFlipApi {
  flip: (page: number) => void;
  flipNext: () => void;
  flipPrev: () => void;
}
interface BookHandle {
  pageFlip: () => PageFlipApi | undefined;
}

export default function DuneFlipbook({ embedded = false }: { embedded?: boolean }) {
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
    const entries: DuneSommaireEntry[] = [];
    const index: { name: string; category: string; page: number }[] = [];
    let n = 1;
    const push = (node: React.ReactNode, label?: string, note?: string) => {
      nodes.push(node);
      if (label) entries.push({ label, page: n, note });
      n++;
    };

    push(<DuneCover key="cover" />);
    push(<DuneAbout key="about" page={n} />);
    const sommaireAt = nodes.length;
    push(<DuneSommaire key="sommaire" page={n} entries={[]} />);
    push(<DuneCeramic key="ceram" page={n} />, "Céramique");

    duneCeramicPlates.forEach((plate) => {
      plate.models.forEach((mdl) =>
        index.push({
          name: duneModelLabel[mdl.name] ?? mdl.name,
          category: "Céramique",
          page: n,
        }),
      );
      push(<DunePlates key={`p-${plate.format}`} plate={plate} page={n} />);
    });

    push(<DuneUsines key="usines" page={n} />);

    const glue = duneTopics[0];
    push(
      <DuneTopicPage
        key="glue-topic"
        page={n}
        title={glue.title}
        intro={glue.intro}
        banner={glue.banner}
        bannerCaption={glue.bannerCaption}
        photos={glue.photos}
      />,
      glue.title,
    );
    push(<DuneGlueBrands key="glue-brands" page={n} />);

    duneFloorPlates.forEach((plate, pi) => {
      plate.models.forEach((mdl) =>
        index.push({
          name: duneModelLabel[mdl.name] ?? mdl.name,
          category: "Revêtement du sol",
          page: n,
        }),
      );
      push(
        <DunePlates key={`f-${plate.format}`} plate={plate} page={n} family="Revêtement du sol" />,
        pi === 0 ? "Revêtement du sol" : undefined,
      );
    });

    duneTopics.slice(1).forEach((topic) => {
      index.push({ name: topic.title, category: topic.title, page: n });
      push(
        <DuneTopicPage
          key={`t-${topic.slug}`}
          page={n}
          title={topic.title}
          intro={topic.intro}
          banner={topic.banner}
          bannerCaption={topic.bannerCaption}
          photos={topic.photos}
        />,
        topic.title,
      );
    });

    push(<DuneInterlude key="interlude" page={n} />);
    push(<DuneBackCover key="back" page={n} />);

    nodes[sommaireAt] = <DuneSommaire key="sommaire" page={3} entries={entries} />;

    // Un livre se relie par cahiers : le nombre de pages doit rester pair.
    if (nodes.length % 2 !== 0)
      nodes.splice(nodes.length - 1, 0, <DuneInterlude key="pad" page={n} />);

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
      setFit(Math.min(availH / DUNE_H, availW / (DUNE_W * single)));
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
      await exportDuneCataloguePdf(stage, (done, t) => setPdf({ done, total: t }));
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

  const toolBtn = `grid h-9 w-9 place-items-center rounded transition-colors hover:bg-dune-sand hover:text-dune-blue ${
    pdf ? "text-dune-blue" : "text-dune-ink/60"
  }`;

  return (
    <div
      ref={shellRef}
      className={`relative flex w-full flex-col overflow-hidden bg-dune-sand ${
        embedded
          ? "h-[min(86vh,900px)] min-h-[520px] rounded-2xl border border-dune-ink/10 [&:fullscreen]:h-screen [&:fullscreen]:max-h-none [&:fullscreen]:rounded-none"
          : "h-[100dvh]"
      }`}
    >
      <div className="flex items-center justify-between px-5 pb-2 pt-3">
        <div className="flex items-center gap-3">
          <span
            className="text-[12px] font-bold tracking-[0.02em] text-dune-blue"
            style={{ fontFamily: "var(--font-dune)" }}
          >
            {TITLE}
          </span>
          <span
            className="rounded bg-dune-blue/10 px-2.5 py-1 text-[11px] tabular-nums text-dune-blue"
            style={{ fontFamily: "var(--font-dune)" }}
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
          className="grid h-9 w-9 place-items-center rounded text-dune-ink/60 transition-colors hover:bg-dune-sand hover:text-dune-blue"
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
          className="absolute left-1 z-10 grid h-14 w-9 place-items-center text-dune-ink/30 transition-colors hover:text-dune-blue disabled:opacity-20 sm:left-4"
        >
          <ChevronLeft className="h-9 w-9" strokeWidth={1.2} />
        </button>

        <div
          className="relative transition-[width,height] duration-500"
          style={{ width: (solo ? DUNE_W : DUNE_W * 2) * k, height: DUNE_H * k }}
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
            style={{ width: (solo ? DUNE_W : DUNE_W * 2) * k, height: DUNE_H * k }}
          >
            <div
              className="origin-top-left shadow-[0_30px_70px_-30px_rgba(17,17,20,0.55)] transition-transform duration-500"
              style={{
                width: portrait ? DUNE_W : DUNE_W * 2,
                transform: `scale(${k}) translateX(${!portrait && page === 0 ? -DUNE_W : 0}px)`,
              }}
            >
              {/* @ts-expect-error react-pageflip ships loose types */}
              <HTMLFlipBook
                ref={bookRef}
                width={DUNE_W}
                height={DUNE_H}
                size="fixed"
                minWidth={DUNE_W}
                maxWidth={DUNE_W}
                minHeight={DUNE_H}
                maxHeight={DUNE_H}
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
                className="dune-book"
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
          className="absolute right-1 z-10 grid h-14 w-9 place-items-center text-dune-ink/30 transition-colors hover:text-dune-blue disabled:opacity-20 sm:right-4"
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
          <span className="mx-1.5 h-5 w-px bg-dune-ink/15" />
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
            className={`${toolBtn} ${pdf ? "text-dune-blue" : ""}`}
          >
            <Download className={`h-[18px] w-[18px] ${pdf ? "animate-pulse" : ""}`} />
          </button>
          <span className="mx-1.5 h-5 w-px bg-dune-ink/15" />
          <button
            type="button"
            title={sound ? "Couper le son" : "Activer le son"}
            aria-label={sound ? "Couper le son" : "Activer le son"}
            onClick={() => setSound((s) => !s)}
            className={`${toolBtn} ${sound ? "text-dune-blue" : ""}`}
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
        style={{ width: DUNE_W, height: DUNE_H, overflow: "hidden" }}
      >
        {pdf && (
          <div style={{ width: DUNE_W }}>
            {nodes.map((node, i) => (
              <div key={i} style={{ width: DUNE_W, height: DUNE_H }}>
                {node}
              </div>
            ))}
          </div>
        )}
      </div>

      {pdf && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-dune-deep/70">
          <div className="w-64 rounded-lg bg-paper p-5 text-center shadow-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dune-ink">
              Préparation du PDF
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded bg-dune-sand">
              <div
                className="h-full bg-dune-blue transition-[width] duration-200"
                style={{ width: `${Math.round((pdf.done / Math.max(1, pdf.total)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] tabular-nums text-dune-ink/60">
              {pdf.done} / {pdf.total} pages
            </p>
          </div>
        </div>
      )}

      <Toaster position="bottom-center" />
      {finder && (
        <div className="absolute right-5 top-14 z-30 w-[min(320px,90vw)] rounded-lg border border-dune-ink/10 bg-paper p-3 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dune-ink/50" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Modèle ou famille…"
              className="w-full rounded border border-dune-ink/15 bg-dune-sand py-2 pl-9 pr-3 text-sm text-dune-ink outline-none focus:border-dune-blue"
            />
          </div>
          {query && (
            <ul className="mt-2 max-h-64 overflow-y-auto">
              {results.length === 0 && (
                <li className="px-2 py-3 text-xs text-dune-ink/60">Aucun résultat.</li>
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
                    className="flex w-full items-baseline justify-between gap-3 rounded px-2 py-1.5 text-left transition hover:bg-dune-sand"
                  >
                    <span className="truncate text-xs font-medium text-dune-ink">{r.name}</span>
                    <span className="shrink-0 text-[10px] tabular-nums text-dune-ink/50">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-dune-deep/95 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center justify-between">
              <p
                className="text-sm font-bold uppercase tracking-[0.2em] text-paper"
                style={{ fontFamily: "var(--font-dune)" }}
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
                    className="flex w-full items-baseline gap-3 border-b border-paper/10 py-2.5 text-left transition hover:border-dune-orange"
                  >
                    <span className="text-[13px] font-medium text-paper">{e.label}</span>
                    {e.note && (
                      <span className="text-[10px] uppercase tracking-[0.14em] text-dune-orange">
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

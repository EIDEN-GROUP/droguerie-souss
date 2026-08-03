import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { CoverPage, ImagePage, PlaceholderPage } from "./BookPage";
import { PAGE_HEIGHT, PAGE_RATIO, PAGE_WIDTH } from "@/lib/catalogue";

/**
 * Module chargé uniquement côté client (voir CatalogueViewer) : `page-flip` injecte sa
 * feuille de style et construit son rendu contre le DOM dès l'import.
 */

type PageFlipApi = {
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
  turnToPage: (page: number) => void;
  destroy: () => void;
  getPageCount: () => number;
  getCurrentPageIndex: () => number;
  getOrientation: () => "portrait" | "landscape";
  getUI: () => { update: () => void };
};

type FlipBookRef = { pageFlip: () => PageFlipApi | undefined };

/** Seuil de bascule en mode portrait de StPageFlip : bloc < 2 × minWidth. */
const MIN_PAGE_W = 300;
const MAX_PAGE_W = 620;
const ZOOM_STEPS = [1, 1.25, 1.5, 2] as const;

/**
 * StPageFlip (`size: "stretch"`, `autoSize: false`) déduit tout de la taille du bloc parent :
 * on la calcule donc nous-mêmes pour que le livre tienne à la fois en largeur et en hauteur,
 * et pour choisir la même orientation que la librairie.
 */
function computeBookSize(availWidth: number, availHeight: number, zoom: number) {
  /** Le plafond suit le zoom, sinon agrandir ne ferait rien sur un grand écran. */
  const cap = MAX_PAGE_W * zoom;
  const landscapePageW = Math.min(availWidth / 2, availHeight / PAGE_RATIO, cap);
  if (landscapePageW * 2 >= MIN_PAGE_W * 2) {
    return {
      width: Math.round(landscapePageW * 2),
      height: Math.round(landscapePageW * PAGE_RATIO),
      portrait: false,
    };
  }
  const portraitPageW = Math.min(availWidth, availHeight / PAGE_RATIO, cap);
  return {
    width: Math.round(portraitPageW),
    height: Math.round(portraitPageW * PAGE_RATIO),
    portrait: true,
  };
}

export default function FlipBookViewer({
  sources,
  title,
  fullscreen,
  onToggleFullscreen,
}: {
  sources: string[];
  title: string;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const bookRef = useRef<FlipBookRef>(null);
  const apiRef = useRef<PageFlipApi | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0, portrait: false });

  const zoom = ZOOM_STEPS[zoomIndex];

  const pages = useMemo(() => {
    if (sources.length > 0) {
      return sources.map((src, i) => (
        <ImagePage key={src} src={src} page={i + 1} total={sources.length} title={title} />
      ));
    }
    /** Aucune image déposée : un livre de démonstration aux couleurs de la marque. */
    const inner = 6;
    return [
      <CoverPage key="cover-front" variant="front" title={title} />,
      ...Array.from({ length: inner }, (_, i) => (
        <PlaceholderPage key={`placeholder-${i}`} page={i + 2} total={inner + 2} />
      )),
      <CoverPage key="cover-back" variant="back" title={title} />,
    ];
  }, [sources, title]);

  /** Mesure du cadre disponible : largeur du conteneur, hauteur bornée par la fenêtre. */
  useEffect(() => {
    const measure = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const availHeight = fullscreen
        ? window.innerHeight - 132
        : Math.min(window.innerHeight * 0.78, 760);
      setSize(computeBookSize(frame.clientWidth * zoom, Math.max(availHeight, 320) * zoom, zoom));
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (frameRef.current) observer.observe(frameRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [fullscreen, zoom]);

  /**
   * StPageFlip n'écoute que le redimensionnement de la fenêtre : quand c'est le bloc qui
   * change (zoom, passage en plein écran), il faut lui demander de se remesurer.
   */
  useEffect(() => {
    if (!size.width) return;
    /** L'effet s'exécute après la mise à jour du DOM : `update()` remesure directement. */
    bookRef.current?.pageFlip()?.getUI().update();
  }, [size.width, size.height]);

  /** Le plein écran prend le focus pour que les flèches du clavier soient actives d'emblée. */
  useEffect(() => {
    if (fullscreen) stageRef.current?.focus();
  }, [fullscreen]);

  /** `react-pageflip` ne détruit jamais son instance : sans ça, l'écouteur de resize de
   *  StPageFlip survit à chaque passage sur la page. */
  useEffect(() => () => apiRef.current?.destroy(), []);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        flipPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        flipNext();
      }
    },
    [flipNext, flipPrev],
  );

  const pageCount = total || pages.length;
  const atStart = page <= 0;
  const atEnd = page >= pageCount - 1;

  return (
    <div className={fullscreen ? "flex h-full flex-col" : ""}>
      <div
        ref={frameRef}
        /** `safe center` : centré tant que ça tient, aligné au début dès que le livre
         *  déborde — sinon le zoom rendrait le bord gauche inatteignable au défilement. */
        className={`flex min-h-0 flex-1 [justify-content:safe_center] ${
          zoom > 1 ? "styled-scrollbar overflow-auto" : "overflow-hidden"
        }`}
      >
        <div
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-label="Catalogue feuilletable"
          onKeyDown={handleKeyDown}
          className="outline-none ring-brand/40 focus-visible:ring-2"
          style={{ width: size.width || undefined }}
        >
          {size.width > 0 && (
            <HTMLFlipBook
              ref={bookRef}
              className="catalogue-book"
              /** `autoSize: false` : la librairie ne pose ni largeur ni hauteur sur son
               *  élément racine, or `.stf__block` s'y positionne en absolu — sans hauteur
               *  explicite le livre serait haut de 0. */
              style={{ width: size.width, height: size.height }}
              width={PAGE_WIDTH}
              height={PAGE_HEIGHT}
              size="stretch"
              minWidth={MIN_PAGE_W}
              maxWidth={MAX_PAGE_W * 2}
              minHeight={Math.round(MIN_PAGE_W * PAGE_RATIO)}
              maxHeight={Math.round(MAX_PAGE_W * 2 * PAGE_RATIO)}
              startPage={0}
              drawShadow
              flippingTime={800}
              usePortrait
              startZIndex={0}
              /** Le dimensionnement est piloté par `size` : laisser la librairie s'en charger
               *  ferait déborder le livre en hauteur sur les écrans courts. */
              autoSize={false}
              maxShadowOpacity={0.5}
              showCover
              /** `true` : sur mobile, le défilement vertical reste possible et seul un
               *  glissement horizontal tourne la page. */
              mobileScrollSupport
              swipeDistance={30}
              clickEventForward
              useMouseEvents
              showPageCorners
              disableFlipByClick={false}
              onFlip={(e: { data: number }) => setPage(e.data)}
              onInit={() => {
                const api = bookRef.current?.pageFlip();
                if (!api) return;
                apiRef.current = api;
                setTotal(api.getPageCount());
                setPage(api.getCurrentPageIndex());
              }}
            >
              {pages}
            </HTMLFlipBook>
          )}
        </div>
      </div>

      {/* Barre d'outils */}
      <div
        className={`mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${
          fullscreen ? "text-paper" : ""
        }`}
      >
        <button
          type="button"
          onClick={flipPrev}
          disabled={atStart}
          aria-label="Page précédente"
          className={`grid h-11 w-11 place-items-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${
            fullscreen
              ? "border-paper/40 text-paper hover:enabled:bg-paper hover:enabled:text-ink"
              : "border-ink text-ink hover:enabled:bg-ink hover:enabled:text-paper"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span
          className={`min-w-24 text-center font-mono text-xs tracking-widest ${
            fullscreen ? "text-paper/80" : "text-ink-soft"
          }`}
        >
          {String(Math.min(page + 1, pageCount)).padStart(2, "0")} /{" "}
          {String(pageCount).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={flipNext}
          disabled={atEnd}
          aria-label="Page suivante"
          className={`grid h-11 w-11 place-items-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${
            fullscreen
              ? "border-paper/40 text-paper hover:enabled:bg-paper hover:enabled:text-ink"
              : "border-ink text-ink hover:enabled:bg-ink hover:enabled:text-paper"
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <span className={`hidden h-6 w-px sm:block ${fullscreen ? "bg-paper/20" : "bg-border"}`} />

        <div
          className={`flex items-center gap-1 rounded-full border px-1.5 py-1 ${
            fullscreen ? "border-paper/25" : "border-border bg-paper"
          }`}
        >
          <button
            type="button"
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            disabled={zoomIndex === 0}
            aria-label="Réduire le zoom"
            className={`grid h-8 w-8 place-items-center rounded-full transition disabled:opacity-30 ${
              fullscreen ? "hover:enabled:bg-paper/15" : "hover:enabled:bg-mint"
            }`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-mono text-[11px] tracking-wider">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            aria-label="Agrandir le zoom"
            className={`grid h-8 w-8 place-items-center rounded-full transition disabled:opacity-30 ${
              fullscreen ? "hover:enabled:bg-paper/15" : "hover:enabled:bg-mint"
            }`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            fullscreen
              ? "border-2 border-paper/40 text-paper hover:bg-paper hover:text-ink"
              : "bg-brand text-brand-foreground hover:bg-brand-dark"
          }`}
        >
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          {fullscreen ? "Quitter" : "Plein écran"}
        </button>
      </div>
    </div>
  );
}

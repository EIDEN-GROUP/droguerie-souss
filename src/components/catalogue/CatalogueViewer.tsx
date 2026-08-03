import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { PAGE_RATIO } from "@/lib/catalogue";

/**
 * `react-pageflip` et `page-flip` sont strictement navigateur : la feuille de style est
 * injectée dès l'import et le livre se construit contre le DOM. Le composant n'est donc
 * jamais importé pendant le rendu serveur — d'où l'import dynamique derrière `mounted`.
 */
const FlipBookViewer = lazy(() => import("./FlipBookViewer"));

function BookSkeleton() {
  return (
    <div className="flex justify-center">
      <div
        className="grid w-full max-w-3xl place-items-center rounded-sm bg-mint/40"
        style={{ aspectRatio: `${2 / PAGE_RATIO}` }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    </div>
  );
}

export function CatalogueViewer({ sources, title }: { sources: string[]; title: string }) {
  const [mounted, setMounted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => setMounted(true), []);

  /** Plein écran : on verrouille le défilement de la page et Échap referme. */
  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  if (!mounted) return <BookSkeleton />;

  return (
    <>
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink/95 backdrop-blur"
          />
        )}
      </AnimatePresence>

      {/*
        Un seul et même conteneur dans les deux modes : passer le livre d'un arbre à l'autre
        le remonterait et ramènerait la lecture à la couverture.
      */}
      <div className={fullscreen ? "fixed inset-0 z-50 flex flex-col p-4 sm:p-6" : "relative"}>
        {fullscreen && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Fermer le plein écran"
              className="grid h-10 w-10 place-items-center rounded-full text-paper transition hover:bg-paper/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className={fullscreen ? "min-h-0 flex-1" : ""}>
          <Suspense fallback={<BookSkeleton />}>
            <FlipBookViewer
              sources={sources}
              title={title}
              fullscreen={fullscreen}
              onToggleFullscreen={() => setFullscreen((v) => !v)}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}

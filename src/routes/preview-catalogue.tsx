import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

// react-pageflip manipule le DOM au montage : jamais rendu côté serveur.
const Flipbook = lazy(() => import("@/components/preview-catalogue/Flipbook"));

export const Route = createFileRoute("/preview-catalogue")({
  component: CataloguePage,
  head: () => ({
    meta: [
      { title: "Catalogue Général 2026   Souss Droguerie" },
      {
        name: "description",
        content:
          "Feuilletez le catalogue général 2026 de Souss Droguerie : céramique, sanitaire, ciments, métallurgie, peinture et électricité. Prix sur demande, devis sous 24 h.",
      },
      { property: "og:title", content: "Catalogue Général 2026   Souss Droguerie" },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Loading() {
  return (
    <div className="grid h-[100dvh] w-full place-items-center bg-[#f2f2f0]">
      <p className="text-[10px] uppercase tracking-[0.3em] text-ink-soft">
        Ouverture du catalogue…
      </p>
    </div>
  );
}

/**
 * Page volontairement sans en-tête ni pied de page : la liseuse occupe tout
 * l'écran, comme un vrai catalogue que l'on feuillette.
 */
function CataloguePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#f2f2f0]">
      <h1 className="sr-only">Catalogue Général 2026 Souss Droguerie</h1>

      {/* seule sortie vers le site, discrète */}
      <Link
        to="/"
        aria-label="Retour au site"
        className="absolute bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full bg-paper/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft shadow-sm backdrop-blur transition hover:text-brand"
      >
        <ArrowLeft className="h-3 w-3" />
        Site
      </Link>

      {mounted ? (
        <Suspense fallback={<Loading />}>
          <Flipbook />
        </Suspense>
      ) : (
        <Loading />
      )}
    </div>
  );
}

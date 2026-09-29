import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Hand, Maximize2, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { seo, jsonLd, canonical } from "@/lib/seo";

// react-pageflip manipule le DOM au montage : jamais rendu côté serveur.
const Flipbook = lazy(() => import("@/components/preview-catalogue/Flipbook"));

export const Route = createFileRoute("/catalogue/interactif")({
  component: CatalogueInteractif,
  head: () =>
    seo({
      title: "Catalogue Général 2026 en ligne",
      description:
        "Feuilletez le catalogue général 2026 de Souss Droguerie : céramique, sanitaire, ciments, métallurgie, peinture et électricité. Prix sur demande, devis sous 48 h.",
      path: "/catalogue/interactif",
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: canonical("/") },
            { "@type": "ListItem", position: 2, name: "Catalogue", item: canonical("/catalogue") },
            {
              "@type": "ListItem",
              position: 3,
              name: "En ligne",
              item: canonical("/catalogue/interactif"),
            },
          ],
        }),
      ],
    }),
});

const tips = [
  { icon: Hand, text: "Cliquez ou faites glisser le coin d'une page pour la tourner" },
  { icon: Search, text: "Recherchez une référence ou une famille depuis la loupe" },
  { icon: Maximize2, text: "Passez en plein écran pour une lecture confortable" },
];

/** Même hauteur que la liseuse : le bloc ne saute pas quand elle se monte. */
function Loading() {
  return (
    <div className="grid h-[min(86vh,900px)] min-h-[520px] w-full place-items-center rounded-2xl border bg-[#f2f2f0]">
      <p className="text-[10px] uppercase tracking-[0.3em] text-ink-soft">
        Ouverture du catalogue…
      </p>
    </div>
  );
}

/**
 * La même liseuse que `/preview-catalogue`, mais posée dans le site : en-tête et
 * pied de page restent visibles, la carte du catalogue ouvre donc cette page-ci
 * dans un nouvel onglet sans sortir de l'univers du site.
 */
function CatalogueInteractif() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Layout>
      {/* Photo d'ambiance tiree du catalogue lui-meme. */}
      <PageHero
        image="/catalogue-photos/ambiance-salon.webp"
        parent={{ label: "Catalogue", to: "/catalogue" }}
        crumb="En ligne"
        title="Catalogue Général 2026"
        actions={
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-paper hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Tous les catalogues
          </Link>
        }
      >
        Toutes nos familles de produits à feuilleter page après page : céramique, sanitaire,
        ciments, métallurgie, peinture et électricité.
      </PageHero>

      <section className="border-y bg-cream py-12 md:py-16">
        <div className="container-x">
          {mounted ? (
            <Suspense fallback={<Loading />}>
              <Flipbook embedded />
            </Suspense>
          ) : (
            <Loading />
          )}

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {tips.map((tip) => (
              <li
                key={tip.text}
                className="flex items-center gap-3 rounded-2xl border bg-paper p-4 text-sm text-ink-soft"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-brand">
                  <tip.icon className="h-4 w-4" />
                </span>
                {tip.text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}

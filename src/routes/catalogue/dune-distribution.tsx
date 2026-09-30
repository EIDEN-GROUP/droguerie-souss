import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Hand, Maximize2, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { seo, jsonLd, canonical } from "@/lib/seo";

// react-pageflip manipule le DOM au montage : jamais rendu côté serveur.
const DuneFlipbook = lazy(() => import("@/components/catalogue-dune/DuneFlipbook"));

/** Polices du catalogue Dune (League Gothic, Montserrat, Roca One, Felfel) :
 *  chargées sur cette route seulement, la charte Souss n'y est pas touchée. */
const DUNE_FONTS =
  "https://fonts.googleapis.com/css2?family=Felfel&family=League+Gothic&family=Montserrat:wght@400;500;600;700&family=Roca+One&display=swap";

export const Route = createFileRoute("/catalogue/dune-distribution")({
  component: DuneCatalogue,
  head: () =>
    seo({
      title: "Catalogue Dune Distribution",
      description:
        "Feuilletez le catalogue Dune Distribution (Laâyoune) en ligne : carrelages, ciment-colle, revêtements, sanitaire, peinture, métallurgie et énergie solaire.",
      path: "/catalogue/dune-distribution",
      links: [{ rel: "stylesheet", href: DUNE_FONTS }],
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
              name: "Dune Distribution",
              item: canonical("/catalogue/dune-distribution"),
            },
          ],
        }),
      ],
    }),
});

const tips = [
  { icon: Hand, text: "Cliquez ou faites glisser le coin d'une page pour la tourner" },
  { icon: Search, text: "Recherchez un modèle ou une famille depuis la loupe" },
  { icon: Maximize2, text: "Passez en plein écran pour une lecture confortable" },
];

function Loading() {
  return (
    <div className="grid h-[min(86vh,900px)] min-h-[520px] w-full place-items-center rounded-2xl border border-dune-ink/10 bg-dune-sand">
      <p className="text-[10px] uppercase tracking-[0.3em] text-dune-ink/50">
        Ouverture du catalogue…
      </p>
    </div>
  );
}

function DuneCatalogue() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Layout>
      <PageHero
        image="/catalogue-dune/cover-bg.webp"
        parent={{ label: "Catalogue", to: "/catalogue" }}
        crumb="Dune Distribution"
        title="Catalogue Dune Distribution"
        actions={
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-paper hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Tous les catalogues
          </Link>
        }
      >
        Le catalogue de notre partenaire de Laâyoune à feuilleter page après page : carrelages,
        ciment-colle, revêtements du sol, sanitaire, peinture, métallurgie et énergie solaire.
      </PageHero>

      <section className="border-y bg-cream py-12 md:py-16">
        <div className="container-x">
          {mounted ? (
            <Suspense fallback={<Loading />}>
              <DuneFlipbook embedded />
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
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-dune-sand text-dune-blue">
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Hand, Maximize2, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { seo, jsonLd, canonical } from "@/lib/seo";

// react-pageflip manipule le DOM au montage : jamais rendu côté serveur.
const DaoudFlipbook = lazy(() => import("@/components/catalogue-daoud/DaoudFlipbook"));

export const Route = createFileRoute("/catalogue/daoud-building")({
  component: DaoudCatalogue,
  head: () =>
    seo({
      title: "Catalogue Daoud Building",
      description:
        "Feuilletez le catalogue Daoud Building en ligne : agglos, planchers, poutrelles, pavés, bordures, revêtement du sol et attestations.",
      path: "/catalogue/daoud-building",
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
              name: "Daoud Building",
              item: canonical("/catalogue/daoud-building"),
            },
          ],
        }),
      ],
    }),
});

const tips = [
  { icon: Hand, text: "Cliquez ou faites glisser le coin d'une page pour la tourner" },
  { icon: Search, text: "Recherchez un produit (PPR156, Bordure T2…) depuis la loupe" },
  { icon: Maximize2, text: "Passez en plein écran pour une lecture confortable" },
];

function Loading() {
  return (
    <div className="grid h-[min(86vh,900px)] min-h-[520px] w-full place-items-center rounded-2xl border border-db-blue/15 bg-db-paper">
      <p className="text-[10px] uppercase tracking-[0.3em] text-db-blue/60">
        Ouverture du catalogue…
      </p>
    </div>
  );
}

function DaoudCatalogue() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Layout>
      <PageHero
        image="/catalogue-daoud/cover-bg.webp"
        parent={{ label: "Catalogue", to: "/catalogue" }}
        crumb="Daoud Building"
        title="Catalogue Daoud Building"
        actions={
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-paper hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Tous les catalogues
          </Link>
        }
      >
        Le catalogue de notre partenaire à feuilleter page après page : agglos, planchers,
        poutrelles, pavés, bordures, revêtement du sol et attestations qualité.
      </PageHero>

      <section className="border-y bg-cream py-12 md:py-16">
        <div className="container-x">
          {mounted ? (
            <Suspense fallback={<Loading />}>
              <DaoudFlipbook embedded />
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
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-db-blue/10 text-db-blue">
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

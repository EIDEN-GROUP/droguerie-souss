import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Hand, Maximize2, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { seo } from "@/lib/seo";

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
      <section className="relative overflow-hidden bg-brand-secondary text-paper">
        <div className="container-x relative py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/50">
                <Link to="/" className="transition hover:text-paper">
                  Accueil
                </Link>
                <span>/</span>
                <Link to="/catalogue" className="transition hover:text-paper">
                  Catalogue
                </Link>
                <span>/</span>
                <span className="text-sky">En ligne</span>
              </nav>

              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
                Catalogue Général 2026
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
              <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
                Toutes nos familles de produits à feuilleter page après page : céramique, sanitaire,
                ciments, métallurgie, peinture et électricité.
              </p>
            </div>

            <Link
              to="/catalogue"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border-2 border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-paper hover:text-ink md:self-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Tous les catalogues
            </Link>
          </motion.div>
        </div>
      </section>

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

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CatalogueCard } from "@/components/catalogue/CatalogueCard";
import { visibleEditions } from "@/lib/catalogue";
import { seo, jsonLd, canonical } from "@/lib/seo";
import heroImg from "@/assets/catalogue-hero.png";

export const Route = createFileRoute("/catalogue/")({
  component: Catalogue,
  head: () =>
    seo({
      title: "Catalogue",
      description:
        "Consultez les catalogues Souss Droguerie 2026 : carrelage, marbre, zellige, peinture, ciment, plomberie et électricité.",
      path: "/catalogue",
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: canonical("/") },
            { "@type": "ListItem", position: 2, name: "Catalogue", item: canonical("/catalogue") },
          ],
        }),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Catalogues Souss Droguerie",
          numberOfItems: visibleEditions.length,
          itemListElement: visibleEditions.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: e.title,
            url: canonical(`/catalogue/${e.slug}`),
          })),
        }),
      ],
    }),
});

function Catalogue() {
  return (
    <Layout>
      <PageHero image={heroImg} crumb="Catalogue" title="Catalogues">
        Toutes nos éditions, à feuilleter en ligne ou à télécharger en PDF. Les éditions PDF
        s'ouvrent dans un nouvel onglet.
      </PageHero>

      <section className="border-y bg-cream py-12 md:py-16">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEditions.map((edition, i) => (
              <CatalogueCard key={edition.slug} edition={edition} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <h2 className="max-w-2xl font-display text-2xl font-bold uppercase leading-tight tracking-tight text-ink sm:text-3xl">
            Un produit vous intéresse ?
          </h2>
          <p className="max-w-xl text-sm text-ink-soft">
            Retrouvez l'ensemble de nos références en ligne ou demandez un devis gratuit : notre
            équipe vous répond sous 48h ouvrées.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
            >
              Voir tous les produits <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/commande-rapide"
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
            >
              Demander un devis
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CatalogueCard } from "@/components/catalogue/CatalogueCard";
import { catalogueEditions } from "@/lib/catalogue";

export const Route = createFileRoute("/catalogue/")({
  component: Catalogue,
  head: () => ({
    meta: [
      { title: "Catalogue   Souss Droguerie" },
      {
        name: "description",
        content:
          "Consultez les catalogues Souss Droguerie 2026 : carrelage, marbre, zellige, peinture, ciment, plomberie et électricité.",
      },
    ],
  }),
});

function Catalogue() {
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
                <span className="text-sky">Catalogue</span>
              </nav>

              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
                Catalogues
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
              <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
                Toutes nos éditions, à feuilleter en ligne ou à télécharger en PDF. Les éditions PDF
                s'ouvrent dans un nouvel onglet.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y bg-cream py-12 md:py-16">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalogueEditions.map((edition, i) => (
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

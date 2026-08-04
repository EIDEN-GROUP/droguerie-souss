import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Hand, Maximize2, ZoomIn } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CatalogueViewer } from "@/components/catalogue/CatalogueViewer";
import { findEdition } from "@/lib/catalogue";

export const Route = createFileRoute("/catalogue/$slug")({
  /** Une édition PDF n'a pas de visionneuse maison : on renvoie sur le fichier, que le
   *  navigateur ouvre dans sa propre visionneuse. Les types du routeur ne se propagent
   *  pas jusqu'ici, d'où l'annotation explicite. */
  beforeLoad: ({ params }: { params: { slug: string } }) => {
    const edition = findEdition(params.slug);
    if (!edition) throw notFound();
    if (edition.format === "pdf") throw redirect({ href: edition.pdf.url });
  },
  component: CatalogueEdition,
  head: ({ params }) => {
    const edition = findEdition(params.slug);
    return {
      meta: [
        { title: `${edition?.title ?? "Catalogue"}   Souss Droguerie` },
        { name: "description", content: edition?.description ?? "" },
      ],
    };
  },
});

const tips = [
  { icon: Hand, text: "Cliquez ou faites glisser le coin d'une page pour la tourner" },
  { icon: ZoomIn, text: "Zoomez pour lire les références et les finitions" },
  { icon: Maximize2, text: "Passez en plein écran pour une lecture confortable" },
];

function CatalogueEdition() {
  const { slug } = Route.useParams();
  const edition = findEdition(slug);
  if (!edition || edition.format !== "flipbook") return null;

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
                <span className="text-sky">{edition.year}</span>
              </nav>

              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
                {edition.title}
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
              <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
                {edition.description}
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
          <CatalogueViewer sources={edition.pages} title={edition.title} />

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

import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft, Hand, Maximize2, ZoomIn } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CatalogueViewer } from "@/components/catalogue/CatalogueViewer";
import { findEdition } from "@/lib/catalogue";
import { seo, jsonLd, canonical } from "@/lib/seo";
import heroImg from "@/assets/promo-collection.jpg";

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
    return seo({
      title: edition?.title ?? "Catalogue",
      description:
        edition?.description ??
        "Consultez les catalogues Souss Droguerie : carrelage, marbre, zellige, peinture, ciment et électricité.",
      path: `/catalogue/${params.slug}`,
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
              name: edition?.title ?? "Catalogue",
              item: canonical(`/catalogue/${params.slug}`),
            },
          ],
        }),
      ],
    });
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
      <PageHero
        image={heroImg}
        parent={{ label: "Catalogue", to: "/catalogue" }}
        crumb={`${edition.year}`}
        title={edition.title}
        actions={
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-paper hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Tous les catalogues
          </Link>
        }
      >
        {edition.description}
      </PageHero>

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

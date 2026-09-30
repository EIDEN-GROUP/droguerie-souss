import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import storeImg from "@/assets/22.jpg";
import { catalogueEditions, type CatalogueEdition } from "@/lib/catalogue";
import { BUSINESS } from "@/lib/contact";

const EASE = [0.22, 1, 0.36, 1] as const;
type PdfEdition = Extract<CatalogueEdition, { format: "pdf" }>;
const pdfEdition = catalogueEditions.find((e): e is PdfEdition => e.format === "pdf" && !e.hidden);

const button =
  "group/btn inline-flex items-center gap-2 rounded-full border border-ink/70 px-6 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-paper";

function Card({
  kicker,
  title,
  text,
  action,
  media,
  index,
}: {
  kicker: string;
  title: string;
  text: string;
  action: ReactNode;
  media: ReactNode;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: EASE }}
      className="group grid overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)] sm:grid-cols-2"
    >
      <div className="flex flex-col justify-center p-7 sm:p-10 xl:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-red">{kicker}</p>
        <h3 className="mt-4 text-3xl text-ink xl:text-4xl">{title}</h3>
        <p className="mt-4 text-base text-ink-soft">{text}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">{action}</div>
      </div>
      <div className="relative min-h-64 overflow-hidden sm:min-h-80 xl:min-h-96">{media}</div>
    </motion.article>
  );
}

export function VisitAndCatalogue() {
  return (
    <section className="container-x py-10">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          index={0}
          kicker="Notre magasin à Agadir"
          title="Venez nous rendre visite"
          text="Découvrez notre showroom et bénéficiez des conseils de nos experts sur place."
          action={
            <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer" className={button}>
              Voir sur la carte
              <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
            </a>
          }
          media={
            <img
              src={storeImg}
              alt="Façade du dépôt Souss Droguerie à Dcheira, Agadir"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          }
        />

        <Card
          index={1}
          kicker="Catalogue produits"
          title="Découvrez notre catalogue"
          text="Accédez à l'ensemble de nos références en un seul document."
          action={
            pdfEdition ? (
              <>
                <a
                  href={pdfEdition.pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={button}
                >
                  Télécharger le catalogue
                  <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
                </a>
                <span className="text-sm text-ink-soft">PDF · {pdfEdition.pdf.size}</span>
              </>
            ) : (
              <Link to="/catalogue" className={button}>
                Voir le catalogue
                <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
              </Link>
            )
          }
          media={
            <div className="absolute inset-0 flex items-center justify-center bg-cream">
              <div className="relative aspect-[3/4] h-[78%]">
                {pdfEdition?.cover && (
                  <img
                    src={pdfEdition.cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full translate-x-[22%] rotate-[8deg] rounded-sm object-cover shadow-lg transition duration-700 group-hover:translate-x-[28%] group-hover:rotate-[11deg]"
                  />
                )}
                <img
                  src="/catalogue-photos/cover.webp"
                  alt="Couverture du catalogue Souss Droguerie 2026"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full -translate-x-[8%] -rotate-[4deg] rounded-sm object-cover shadow-xl transition duration-700 group-hover:-rotate-[6deg]"
                />
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

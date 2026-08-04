import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, FileText, HardDrive, Star } from "lucide-react";
import logoWhite from "@/assets/icon-white.png";
import type { CatalogueEdition } from "@/lib/catalogue";

/** Couverture dessinée, utilisée tant qu'aucune image `covers/<slug>.webp` n'est fournie. */
function DrawnCover({ edition }: { edition: CatalogueEdition }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-brand-secondary p-6 text-paper">
      <div className="h-10 w-10">
        <img src={logoWhite} alt="" className="h-full w-full object-contain" />
      </div>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-sky">
          Nos collections
        </p>
        <p className="mt-2 font-display text-4xl font-bold leading-none">{edition.year}</p>
        <span className="mt-3 block h-1 w-12 rounded-full bg-accent-red" />
      </div>
    </div>
  );
}

/** Les chiffres affichés à droite du titre, en bas de la couverture. */
function metricsOf(edition: CatalogueEdition) {
  if (edition.format === "pdf") {
    return [
      { icon: FileText, value: String(edition.pdf.pageCount), label: "Pages" },
      { icon: HardDrive, value: edition.pdf.size, label: "Fichier" },
    ];
  }
  return edition.pages.length > 0
    ? [{ icon: BookOpen, value: String(edition.pages.length), label: "Pages" }]
    : [];
}

export function CatalogueCard({ edition, index }: { edition: CatalogueEdition; index: number }) {
  const isPdf = edition.format === "pdf";
  /** Les deux formats s'ouvrent dans un nouvel onglet : le PDF directement dans la
   *  visionneuse du navigateur, le flipbook via sa page dédiée. */
  const href = isPdf ? edition.pdf.url : `/catalogue/${edition.slug}`;
  const metrics = metricsOf(edition);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-paper transition hover:border-brand hover:shadow-[var(--shadow-elevated)]"
    >
      {/* Cadre 3/4 : le format des affiches de couverture, donc aucun rognage. */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-secondary">
        {edition.cover ? (
          <img
            src={edition.cover}
            alt={`Couverture du ${edition.title}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <DrawnCover edition={edition} />
        )}

        {edition.isNew && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1.5 text-[11px] font-bold text-ink shadow-sm">
            <Star className="h-3.5 w-3.5 fill-accent-red text-accent-red" />
            Nouveau
          </span>
        )}

        <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-brand opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>

        {/* Voile dégradé : le titre reste lisible quelle que soit la couverture. */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/75 to-transparent p-5 pt-20 text-paper">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate font-display text-xl font-bold leading-tight">
                {edition.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-paper/70">
                {edition.description}
              </p>
            </div>

            {metrics.length > 0 && (
              <ul className="flex shrink-0 gap-4">
                {metrics.map((metric) => (
                  <li key={metric.label} className="text-center">
                    <span className="flex items-center justify-center gap-1.5 text-sm font-semibold">
                      <metric.icon className="h-4 w-4 text-paper/60" />
                      {metric.value}
                    </span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-paper/50">
                      {metric.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 py-3.5 text-xs text-ink-soft">
        <span>{isPdf ? "PDF" : "Feuilletable"}</span>
        <span aria-hidden>•</span>
        <span className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition group-hover:decoration-brand">
          {isPdf ? "Ouvrir le PDF" : "Feuilleter en ligne"}
        </span>
        <ArrowUpRight className="ml-auto h-4 w-4 transition group-hover:text-brand" />
      </div>
    </motion.a>
  );
}

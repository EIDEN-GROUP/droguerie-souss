import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, FileText } from "lucide-react";
import logoWhite from "@/assets/icon-white.png";
import type { CatalogueEdition } from "@/lib/catalogue";

/** Couverture dessinée, utilisée tant qu'aucune image `covers/<année>.jpg` n'est fournie. */
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
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/50">
        Souss Droguerie
      </p>
    </div>
  );
}

export function CatalogueCard({ edition, index }: { edition: CatalogueEdition; index: number }) {
  const isPdf = edition.format === "pdf";
  /** Les deux formats s'ouvrent dans un nouvel onglet : le PDF via son URL statique,
   *  le flipbook via sa page dédiée. */
  const href = isPdf ? edition.pdf.url : `/catalogue/${edition.slug}`;
  const meta = isPdf
    ? `PDF · ${edition.pdf.pageCount} pages · ${edition.pdf.size}`
    : edition.pages.length > 0
      ? `Feuilletable · ${edition.pages.length} pages`
      : "Feuilletable";

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
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        {edition.cover ? (
          <img
            src={edition.cover}
            alt={`Couverture du ${edition.title}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <DrawnCover edition={edition} />
        )}

        {edition.isNew && (
          <span className="absolute left-4 top-4 rounded-full bg-accent-red px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-paper">
            Nouveau
          </span>
        )}

        <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-brand opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
            {edition.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{edition.description}</p>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft/80">{meta}</p>

        <span
          className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
            isPdf
              ? "bg-accent-red text-paper group-hover:bg-accent-red/90"
              : "bg-brand text-brand-foreground group-hover:bg-brand-dark"
          }`}
        >
          {isPdf ? <FileText className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
          {isPdf ? "Ouvrir le PDF" : "Feuilleter"}
        </span>
      </div>
    </motion.a>
  );
}

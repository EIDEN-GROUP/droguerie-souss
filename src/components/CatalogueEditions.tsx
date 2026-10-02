import { Link, type LinkProps } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { actionOf } from "@/components/catalogue/CatalogueCard";
import { visibleEditions, type CatalogueEdition } from "@/lib/catalogue";
import { Reveal } from "./motion/Reveal";
import { rise, wipe } from "./motion/reveals";
import { SectionHeader } from "./SectionHeader";

/** Les deux editions mises en avant a l'accueil ; les autres sont sur /catalogue. */
const HOME_EDITIONS = ["interactif", "daoud-building"];
const editions = HOME_EDITIONS.flatMap((slug) => visibleEditions.filter((e) => e.slug === slug));

const cardClass =
  "group grid items-center gap-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-red sm:grid-cols-[minmax(0,11fr)_minmax(0,12fr)] sm:gap-9";

/** Carte d'une edition : la couverture a gauche (pastille de l'annee, bandeau de l'action),
 *  le texte a droite. Toute la carte mene a l'edition - une page du site pour la liseuse
 *  interactive, un nouvel onglet pour les autres formats (comme `CatalogueCard`). */
function EditionCard({ edition, index }: { edition: CatalogueEdition; index: number }) {
  const { kind, action } = actionOf(edition);

  const content: ReactNode = (
    <>
      <motion.div
        variants={wipe("top", { delay: index * 0.12, duration: 1.1 })}
        className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-lg bg-brand-secondary sm:max-w-none"
      >
        {edition.cover && (
          <img
            src={edition.cover}
            alt={`Couverture du ${edition.title}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        <span className="absolute bottom-12 right-0 grid h-[4.25rem] w-[4.25rem] place-content-center rounded-l-md bg-accent-red text-center text-paper transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
          <span className="text-lg font-extrabold leading-none tabular-nums">{edition.year}</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">Édition</span>
        </span>

        <span className="absolute bottom-0 left-0 flex h-12 w-[78%] items-center gap-2 bg-paper/90 px-4 text-xs text-ink-soft backdrop-blur-sm">
          <BookOpen className="h-4 w-4 shrink-0 text-accent-red" />
          <span className="truncate">{action}</span>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-accent-red transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </motion.div>

      <motion.div variants={rise({ y: 24, delay: 0.2 + index * 0.12 })}>
        {edition.isNew && (
          <span className="inline-flex rounded-md bg-accent-red px-5 py-2 text-xs font-semibold text-paper">
            Nouveau
          </span>
        )}
        <h3 className="mt-5 font-display text-2xl leading-tight text-ink transition-colors duration-300 group-hover:text-accent-red xl:text-[1.75rem]">
          {edition.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{edition.description}</p>
        <p className="mt-5 text-xs">
          <span className="font-bold text-accent-red">Format</span>
          <span className="ml-2 font-medium uppercase tracking-wide text-ink">{kind}</span>
        </p>
      </motion.div>
    </>
  );

  return (
    <Reveal margin="-60px">
      {edition.format === "interactive" ? (
        // Chaque liseuse interactive a sa propre route, nommee d'apres son `slug`.
        <Link to={`/catalogue/${edition.slug}` as LinkProps["to"]} className={cardClass}>
          {content}
        </Link>
      ) : (
        <a
          href={edition.format === "pdf" ? edition.pdf.url : `/catalogue/${edition.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cardClass}
        >
          {content}
        </a>
      )}
    </Reveal>
  );
}

/** Les editions du catalogue, a la suite des questions frequentes de l'accueil. */
export function CatalogueEditions() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="container-x">
        <SectionHeader
          kicker="Catalogues"
          title="Toutes nos éditions, à feuilleter en ligne"
          animated
        />

        <div className="mt-12 grid gap-x-10 gap-y-14 md:mt-16 lg:grid-cols-2">
          {editions.map((edition, i) => (
            <EditionCard key={edition.slug} edition={edition} index={i} />
          ))}
        </div>

        <Reveal
          margin="-40px"
          variants={rise({ y: 16, duration: 0.6 })}
          className="mt-12 text-center md:mt-16"
        >
          <Link
            to="/catalogue"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
          >
            Tous les catalogues
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

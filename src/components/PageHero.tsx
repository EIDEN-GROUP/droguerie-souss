import { Link, type LinkProps } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { SplitReveal } from "./motion/SplitReveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Bandeau des pages interieures (toutes sauf l'accueil) : carte arrondie dans la page, photo
 * sous voile noir, fil d'Ariane, titre, filet rouge et texte a gauche.
 *
 * A l'ouverture, la carte grandit legerement pendant que la photo recule, puis le titre
 * arrive lettre a lettre. Au defilement, la photo descend moins vite que la page et le texte
 * s'efface. La page doit utiliser l'en-tete blanc (pas `overlayNav`) : la carte commence
 * sous la barre.
 *
 * Le titre et la photo peuvent changer sans quitter la page (rayon choisi dans la boutique) :
 * ils sont alors remontes et rejouent leur entree, SplitText ayant remplace le texte d'origine.
 */
export function PageHero({
  image,
  crumb,
  parent,
  title,
  children,
  actions,
}: {
  image: string;
  crumb: string;
  /** Niveau intermediaire du fil d'Ariane, entre l'accueil et la page. */
  parent?: { label: string; to: LinkProps["to"] };
  title: string;
  children: ReactNode;
  /** Boutons ou points forts poses sous le texte. */
  actions?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "25%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "35%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  /** Un mot de plus de 13 lettres (« confidentialite ») deborde de la carte en `text-4xl` sur
   *  telephone, et SplitText ne le coupe pas : sa taille suit alors la largeur de l'ecran. */
  const longWord = title.split(/\s+/).some((word) => word.length > 13);

  return (
    <section className="px-3 pt-4 sm:px-5 lg:px-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative isolate flex min-h-[22rem] items-center overflow-hidden rounded-[1.75rem] bg-ink text-paper sm:min-h-[24rem] lg:min-h-[26rem] lg:rounded-[3rem]"
      >
        <motion.div style={{ y: imageY }} className="absolute inset-x-0 -top-[10%] h-[120%]">
          <motion.img
            key={image}
            src={image}
            alt=""
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative w-full px-6 py-14 sm:px-12 lg:px-24"
        >
          <motion.nav
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70"
          >
            <Link to="/" className="transition hover:text-paper">
              Accueil
            </Link>
            <span>/</span>
            {parent && (
              <>
                <Link to={parent.to} className="transition hover:text-paper">
                  {parent.label}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-sky">{crumb}</span>
          </motion.nav>

          <SplitReveal
            key={title}
            as="h1"
            trigger="load"
            by="chars"
            delay={0.35}
            className={`mt-4 font-display font-bold uppercase leading-[0.95] sm:text-5xl lg:text-6xl ${
              longWord ? "text-[length:clamp(1.5rem,7.6vw,2.25rem)]" : "text-4xl"
            }`}
          >
            {title}
          </SplitReveal>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            className="mt-5 block h-1 w-16 origin-left rounded-full bg-accent-red"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
            className="mt-5 max-w-2xl text-sm text-paper/85 sm:text-base"
          >
            {children}
          </motion.p>
          {actions && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: EASE }}
              className="mt-7"
            >
              {actions}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo.png";
import { SplitReveal } from "./motion/SplitReveal";
import { useIntro } from "./IntroContext";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Duree minimale de l'intro, pour qu'elle soit vue. Au-dela de `INTRO_MAX_MS`, la page
 *  s'ouvre quoi qu'il arrive. */
const INTRO_MIN_MS = 1800;
const INTRO_MAX_MS = 4500;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const { active, done, finish } = useIntro();
  const [ready, setReady] = useState(false);

  // 0 quand le hero remplit l'ecran, 1 quand son bas atteint le haut de l'ecran.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Parallaxe : la video descend moins vite que la page et grossit, le texte remonte plus
  // lentement et s'efface - l'ecran suivant semble glisser par-dessus.
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, reduce ? 1 : 0]);

  // Intro : la video fait office d'ecran de chargement. Prete des qu'elle peut jouer (ou en
  // erreur, ou au bout d'INTRO_MAX_MS), mais jamais avant la duree minimale.
  useEffect(() => {
    if (!active || done) return;
    const video = videoRef.current;
    const start = performance.now();
    let timer: number | undefined;
    let settled = false;
    const markReady = () => {
      if (settled) return;
      settled = true;
      timer = window.setTimeout(
        () => setReady(true),
        Math.max(0, INTRO_MIN_MS - (performance.now() - start)),
      );
    };
    if (!video || video.readyState >= 3) markReady();
    else {
      video.addEventListener("canplay", markReady, { once: true });
      video.addEventListener("error", markReady, { once: true });
    }
    const failsafe = window.setTimeout(markReady, INTRO_MAX_MS);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(failsafe);
      video?.removeEventListener("canplay", markReady);
      video?.removeEventListener("error", markReady);
    };
  }, [active, done]);

  // La ligne de chargement finit de se remplir, puis la page s'ouvre.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(finish, 350);
    return () => window.clearTimeout(t);
  }, [ready, finish]);

  return (
    <section ref={ref} className="relative h-svh min-h-[600px] w-full overflow-hidden bg-ink">
      {/* Pendant l'intro, lent travelling avant ; a l'ouverture, la video se pose. */}
      <motion.div
        initial={active ? { opacity: 1, scale: 1.18 } : { opacity: 0, scale: 1.08 }}
        animate={done ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1.08 }}
        transition={done ? { duration: 1.4, ease: EASE } : { duration: 3, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <motion.div style={{ y: videoY, scale: videoScale }} className="absolute inset-0">
          <video
            ref={videoRef}
            src="/sous.mp4"
            poster="/hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: active ? 0 : 1 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"
        />
      </motion.div>

      <AnimatePresence>
        {active && !done && (
          <motion.div
            key="intro"
            aria-hidden="true"
            exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE } }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-7 bg-black/40"
          >
            <motion.img
              src={logo}
              alt=""
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.6, ease: EASE } }}
              transition={{ duration: 0.9, ease: EASE }}
              className="h-16 w-auto brightness-0 invert sm:h-20"
            />
            <div className="h-px w-40 overflow-hidden bg-paper/25">
              <motion.div
                className="h-full origin-left bg-paper"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: ready ? 1 : 0.85 }}
                transition={
                  ready ? { duration: 0.35, ease: "easeOut" } : { duration: INTRO_MIN_MS / 1000, ease: [0.3, 0, 0.2, 1] }
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x relative z-10 flex h-full items-center justify-center pt-20"
      >
        <div className="max-w-full text-paper">
          <div className="flex flex-col items-center">
            {/* Lettre a lettre (GSAP), des que l'intro s'ouvre. */}
            <SplitReveal
              as="h1"
              trigger="load"
              by="chars"
              delay={0.45}
              active={done}
              className="font-display text-center text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
            >
              Bâtissez avec les meilleurs matériaux
            </SplitReveal>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
              className="mt-5 text-center max-w-xl text-base text-paper/80 sm:text-lg"
            >
              Votre droguerie de référence dans le Souss depuis 1992 : ciment, carrelage, peinture, plomberie, électricité et quincaillerie, livrés sur votre chantier.
            </motion.p>
            <motion.div
              initial="hidden"
              animate={done ? "shown" : "hidden"}
              variants={{ shown: { transition: { staggerChildren: 0.12, delayChildren: 1.45 } } }}
              className="mt-8 flex flex-wrap items-center gap-3 justify-center"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, shown: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <Link to="/categories" className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90">
                  Explorer la boutique
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, shown: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper backdrop-blur transition hover:bg-paper hover:text-ink">
                  Demander un devis
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import storyImg from "@/assets/1.jpg";
import patternImg from "@/assets/cat-zellige.jpg";
import mark from "@/assets/icon-blue.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ABOUT, aboutStats } from "@/lib/about";
import { BUSINESS } from "@/lib/contact";
import { Counter } from "./motion/Counter";
import { Reveal } from "./motion/Reveal";
import { fromTo, rise, wipe } from "./motion/reveals";
import { SplitReveal } from "./motion/SplitReveal";

const EASE = [0.22, 1, 0.36, 1] as const;

const tabs = [
  {
    id: "histoire",
    label: ABOUT.story.kicker,
    text: ABOUT.story.paragraphs[0],
    stat: aboutStats[0],
  },
  { id: "zone", label: ABOUT.zone.kicker, text: ABOUT.zone.text, stat: aboutStats[1] },
];

export function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [tab, setTab] = useState(tabs[0].id);

  // La photo et la bande defilent un peu moins vite que la page.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-3%", "3%"]);
  const patternY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-9%", "9%"]);

  return (
    <section ref={ref} className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container-x grid grid-cols-1 [--overlap:3rem] lg:grid-cols-12 lg:[--overlap:2.5rem] xl:[--overlap:clamp(4rem,calc(4rem_+_(100vw_-_80rem)_*_0.45),9.5rem)]">
        <Reveal className="lg:col-start-7 lg:col-end-13 lg:row-start-1 lg:self-start lg:pb-[calc(var(--overlap)+2.5rem)] lg:pl-10 xl:col-end-12 xl:pb-[calc(var(--overlap)+3rem)] xl:pl-0">
          <div className="inline-flex items-center gap-2">
            <motion.span
              variants={fromTo({ scaleX: 0 }, { scaleX: 1 })}
              className="h-px w-8 origin-left bg-sky"
            />
            <motion.span
              variants={rise({ x: -8, y: 0, delay: 0.2, duration: 0.6 })}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky"
            >
              Qui sommes-nous ?
            </motion.span>
          </div>
          <SplitReveal
            as="h2"
            className="mt-4 max-w-xl text-balance font-display text-3xl font-bold uppercase leading-tight text-paper sm:text-4xl lg:text-3xl xl:text-4xl"
          >
            {ABOUT.story.title.join(" ")}
          </SplitReveal>
          <motion.p
            variants={rise({ y: 24, delay: 0.15, duration: 0.7 })}
            className="mt-5 max-w-xl text-sm leading-relaxed text-paper/70 sm:text-base"
          >
            {ABOUT.intro[0]}
          </motion.p>
          <motion.div variants={rise({ y: 24, delay: 0.27, duration: 0.7 })} className="mt-8">
            <Link
              to="/a-propos"
              className="group inline-flex items-center gap-4 rounded-full bg-accent-red py-1.5 pl-7 pr-1.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
            >
              À propos de nous
              <span className="grid h-10 w-10 place-items-center rounded-full bg-paper text-accent-red transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        </Reveal>

        {/* La photo se devoile de gauche a droite. La cale invisible lui donne sa hauteur
            minimale ; en `lg`, elle s'etire au-dela pour suivre le texte. */}
        <Reveal className="relative z-20 mr-8 mt-12 grid grid-cols-1 md:mr-24 lg:col-start-1 lg:col-end-7 lg:row-start-1 lg:mr-0 lg:mt-0 xl:col-end-6">
          <motion.div variants={wipe("left")} className="relative overflow-hidden rounded-2xl">
            <div aria-hidden="true" className="aspect-[4/3] lg:aspect-[5/4]" />
            {/* Cadrage serre sur la largeur : l'enseigne occupe presque toute la photo et
                doit rester entiere, d'ou une marge de parallaxe volontairement mince. */}
            <motion.img
              src={storyImg}
              alt={ABOUT.story.imageAlt}
              loading="lazy"
              style={{ y: photoY }}
              variants={fromTo({ scale: 1.15 }, { scale: 1 }, { duration: 1.6 })}
              className="absolute inset-x-0 -top-[4%] h-[108%] w-full object-cover object-[60%_50%]"
            />
          </motion.div>
        </Reveal>

        {/* Le panneau sort de sous la photo, de gauche a droite. */}
        <Reveal className="relative z-10 -mr-4 -mt-(--overlap) ml-4 grid grid-cols-1 sm:-mr-6 sm:ml-10 md:ml-24 lg:col-start-7 lg:col-end-13 lg:row-start-2 lg:-ml-10 lg:mr-0 xl:col-start-6 xl:mr-[calc(100%/7*0.6)]">
          <motion.div
            variants={wipe("left", { delay: 0.25, duration: 1.1 })}
            className="rounded-2xl border border-paper/10 bg-brand-secondary px-5 pb-10 pt-[calc(var(--overlap)+2rem)] text-paper sm:px-9 lg:pb-12 lg:pl-20 lg:pr-10 lg:pt-10 xl:pl-[calc((100%-2.5rem)/6.4+2.5rem)] xl:pt-12"
          >
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="no-scrollbar flex h-auto w-full justify-start gap-4 overflow-x-auto rounded-none border-b border-paper/15 bg-transparent p-0 sm:gap-8">
                {tabs.map((t) => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="relative rounded-none px-0 pb-4 pt-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-paper/55 ring-offset-brand-secondary hover:text-paper focus-visible:ring-paper/70 data-[state=active]:bg-transparent data-[state=active]:text-paper data-[state=active]:shadow-none sm:text-xs sm:tracking-[0.14em]"
                  >
                    {t.label}
                    {tab === t.id && (
                      <motion.span
                        layoutId="about-tab"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-paper"
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tous les contenus occupent la meme case : le panneau garde la hauteur du plus
                long et la page ne bouge pas quand on change d'onglet. */}
              <div className="mt-8 grid">
                {tabs.map((t) => {
                  const active = tab === t.id;
                  return (
                    <TabsContent
                      key={t.id}
                      value={t.id}
                      forceMount
                      className="col-start-1 row-start-1 mt-0 ring-offset-brand-secondary focus-visible:ring-paper/70 data-[state=inactive]:invisible"
                    >
                      <motion.div
                        initial={false}
                        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 14 }}
                        transition={{ duration: active ? 0.5 : 0.2, ease: EASE }}
                      >
                        <p className="max-w-2xl font-semibold leading-relaxed text-paper sm:text-[17px]">
                          {t.text}
                        </p>
                        <p className="mt-9 text-[11px] font-bold uppercase tracking-[0.2em] text-paper/60">
                          {t.stat.tag}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 sm:flex-nowrap">
                          <t.stat.icon
                            className="h-12 w-12 shrink-0 text-sky sm:h-14 sm:w-14"
                            strokeWidth={1.1}
                          />
                          <span className="font-display text-5xl leading-none tabular-nums sm:text-6xl">
                            {/* Remonte a chaque ouverture de l'onglet : le chiffre recompte. */}
                            <Counter
                              key={active ? "on" : "off"}
                              to={t.stat.value}
                              suffix={t.stat.suffix}
                            />
                          </span>
                          <span className="basis-full text-sm leading-snug text-paper/75 sm:max-w-[13rem] sm:min-w-0 sm:basis-auto">
                            {t.stat.text}
                          </span>
                        </div>
                      </motion.div>
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </motion.div>
        </Reveal>

        {/* La signature de la maison, sous la photo. */}
        <Reveal
          variants={rise({ y: 24, delay: 0.35, duration: 0.7 })}
          className="mt-9 flex items-center gap-5 lg:col-start-1 lg:col-end-6 lg:row-start-2 lg:mt-0 lg:self-start lg:pl-6 lg:pt-9 xl:col-end-5 xl:pl-12"
        >
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-cream sm:h-24 sm:w-24">
            <img src={mark} alt="" className="h-9 w-9 object-contain sm:h-11 sm:w-11" />
          </span>
          <div>
            <p className="font-display text-2xl italic leading-none text-paper sm:text-3xl">
              {BUSINESS.shortName}
            </p>
            <svg
              viewBox="0 0 100 12"
              fill="none"
              aria-hidden="true"
              className="mt-1.5 h-3 w-28 text-sky"
            >
              <motion.path
                d="M3 8 C 22 4, 42 10, 62 6 S 90 5, 97 7"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                variants={fromTo(
                  { pathLength: 0 },
                  { pathLength: 1 },
                  { delay: 0.7, duration: 0.9 },
                )}
              />
            </svg>
            <p className="mt-2 text-sm text-paper/60">
              Droguerie à Agadir depuis {BUSINESS.sinceYear}
            </p>
          </div>
        </Reveal>

        {/* Bande de zellige, decor de la colonne de droite : le panneau en recouvre le bord
            gauche. */}
        <Reveal
          aria-hidden="true"
          className="relative z-0 -mt-28 mb-24 hidden xl:col-start-12 xl:col-end-13 xl:row-start-1 xl:row-end-3 xl:grid"
        >
          <motion.div
            variants={wipe("top", { delay: 0.1, duration: 1.4 })}
            className="relative overflow-hidden rounded-b-2xl"
          >
            <motion.img
              src={patternImg}
              alt=""
              loading="lazy"
              style={{ y: patternY }}
              className="absolute inset-x-0 opacity-20 -top-[12%] h-[124%] w-full object-cover"
            />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

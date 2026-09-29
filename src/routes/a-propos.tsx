import { createFileRoute, Link } from "@tanstack/react-router";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock,
  HandCoins,
  Handshake,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Users,
  Warehouse,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { SectionHeader } from "@/components/SectionHeader";
import { SuppliersCarousel } from "@/components/SuppliersCarousel";
import { CtaBanner } from "@/components/CtaBanner";
import { CategoryCardsCarousel } from "@/components/CategoriesSection";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { PageHero } from "@/components/PageHero";
import { NumberedList } from "@/components/NumberedList";
import { categories } from "@/lib/products";
import { seo, jsonLd, canonical, descriptionFrom, ALTERNATE_NAME, SITE_URL } from "@/lib/seo";
import { AREA_SERVED } from "@/lib/contact";
import storyImg from "@/assets/1.jpg";
import zoneImg from "@/assets/22.jpg";
import heroImg from "@/assets/hero-1.jpg";

const DESCRIPTION = "Souss Droguerie (Droguerie Souss), droguerie de matériaux de construction à Agadir depuis 1992 : carrelage, marbre, zellige, peinture, ciment, plomberie, électricité et quincaillerie pour toute la région Souss-Massa.";
const structuredData = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: "Souss Droguerie SARL",
  alternateName: ALTERNATE_NAME,
  foundingDate: "1992",
  slogan: "Votre droguerie de matériaux de construction à Agadir depuis 1992",
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/logo.png`,
  hasMap: "https://maps.app.goo.gl/q54qmxeEv752bJMTA",
  sameAs: ["https://maps.app.goo.gl/q54qmxeEv752bJMTA"],
  geo: {
    "@type": "GeoCoordinates",
    latitude: 30.3830705,
    longitude: -9.5184337,
  },
  priceRange: "$$",
  currenciesAccepted: "MAD",
  paymentAccepted: "Cash, Virement bancaire",
  description: DESCRIPTION,
  telephone: "+212528838992",
  email: "contact@soussdroguerie.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bd Mohamed V, Q.I. Tassila III, N°29",
    addressLocality: "Dcheira",
    addressRegion: "Souss-Massa",
    postalCode: "80360",
    addressCountry: "MA",
  },
  areaServed: [...AREA_SERVED],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "12:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "14:30",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:30",
      closes: "12:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "14:30",
      closes: "17:00",
    },
  ],
};

export const Route = createFileRoute("/a-propos")({
  component: APropos,
  head: () =>
    seo({
      title: "À propos | Souss Droguerie, droguerie à Agadir depuis 1992",
      description: descriptionFrom(DESCRIPTION),
      path: "/a-propos",
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "À propos | Souss Droguerie",
          url: canonical("/a-propos"),
          inLanguage: "fr-FR",
          speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
        }),
      ],
    }),
});

const stats = [
  { value: 30, suffix: "+", label: "Années d'expérience", icon: Building2 },
  { value: 48, suffix: "h", label: "Pour recevoir votre devis", icon: Clock },
  { value: 8, suffix: "", label: "Familles de matériaux", icon: Package },
  { value: 12, suffix: "", label: "Marques partenaires", icon: Handshake },
];

const engagements = [
  {
    icon: Warehouse,
    title: "Du stock, pas des promesses",
    text: "Les références courantes du gros œuvre et du second œuvre sont tenues en stock pour que votre chantier ne s'arrête jamais faute d'un sac de ciment.",
  },
  {
    icon: ShieldCheck,
    title: "Des marques qui tiennent",
    text: "Nous ne référençons que des fabricants reconnus   Lafarge, Holcim, Knauf, Weber, Sika, Schneider, Legrand, Grohe   dont la régularité est éprouvée sur le terrain.",
  },
  {
    icon: HandCoins,
    title: "Le juste prix, expliqué",
    text: "Chaque devis détaille les quantités et les alternatives possibles. Vous savez ce que vous payez et pourquoi, avant de commander.",
  },
  {
    icon: BadgeCheck,
    title: "Une qualité contrôlée",
    text: "Chaque lot est vérifié à la réception : conformité des références, calibre et nuance des carrelages, état des sacs et des palettes. Ce qui quitte le dépôt est conforme à ce que vous avez commandé.",
  },
  {
    icon: Users,
    title: "Un conseil de métier",
    text: "Notre équipe connaît la différence entre un grès cérame de sol et un faïence murale. Décrivez l'usage, nous orientons le choix.",
  },
  {
    icon: Clock,
    title: "Une réponse sous 48h",
    text: "Toute demande de devis reçoit une réponse chiffrée sous 48h ouvrées, quelle que soit la taille du lot.",
  },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(to);

  useEffect(() => {
    if (!inView || reduce) return;
    setN(0);
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;
function RevealImage({ src, alt, from }: { src: string; alt: string; from: "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);
  const hidden = from === "left" ? "inset(0% 100% 0% 0% round 24px)" : "inset(0% 0% 0% 100% round 24px)";

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: EASE }}
      className="relative aspect-[4/3] overflow-hidden rounded-3xl"
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y }}
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.6, ease: EASE }}
        className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
    </motion.div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2">
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE }}
        className="h-px w-8 origin-left bg-accent-red"
      />
      <motion.span
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-red"
      >
        {children}
      </motion.span>
    </div>
  );
}

const stagger = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function APropos() {
  return (
    <Layout>
      <PageHero image={heroImg} crumb="À propos" title="Qui sommes-nous ?">
        Depuis plus de 30 ans, Souss Droguerie accompagne les professionnels du BTP et les
        particuliers avec une offre complète de matériaux de construction. De la structure aux
        finitions, nous mettons à votre disposition des produits certifiés, des marques
        reconnues et un accompagnement technique à chaque étape de votre projet.
      </PageHero>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Notre histoire */}
      <section className="container-x py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <RevealImage
            src={storyImg}
            alt="Dépôt de matériaux de construction Souss Droguerie à Agadir"
            from="left"
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Kicker>Notre histoire</Kicker>
            <SplitReveal
              as="h2"
              className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl"
            >
              Un partenaire de chantier,
              <br className="hidden sm:block" /> pas un simple dépôt
            </SplitReveal>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              <motion.p variants={rise}>
                Depuis 1992, Souss Droguerie développe son expertise dans la distribution de
                matériaux de construction destinés aux professionnels et aux particuliers. Notre
                objectif est resté le même : proposer des produits fiables, disponibles et adaptés
                aux exigences des chantiers modernes.
              </motion.p>
              <motion.p variants={rise}>
                Au fil des années, notre catalogue s'est enrichi pour couvrir l'ensemble des besoins
                du gros œuvre, du second œuvre et de la finition. Carrelage, sanitaire, métallurgie,
                isolation, peinture, électricité ou énergie solaire : une seule adresse pour
                l'ensemble de vos projets.
              </motion.p>
              <motion.p variants={rise}>
                Aujourd'hui, nous poursuivons cette évolution en intégrant progressivement des
                solutions innovantes afin d'améliorer notre accompagnement, optimiser le choix des
                matériaux et proposer un service toujours plus performant.
              </motion.p>
            </div>
            <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/categories"
                className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
              >
                Voir nos produits
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
              >
                Nous rencontrer
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

       {/* Chiffres clés : centres, pastille ronde sombre, chiffre en serif, libelle discret. */}
      <section className="bg-brand-foreground">
        <div className="container-x py-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
                className="group flex flex-col items-center text-center"
              >
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-brand-secondary text-paper transition duration-500 group-hover:-translate-y-1 sm:h-[4.5rem] sm:w-[4.5rem]"
                >
                  <s.icon className="h-6 w-6" strokeWidth={1.5} />
                </motion.span>
                <p className="mt-4 font-display text-3xl font-semibold tabular-nums text-ink sm:text-4xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Zone d'intervention : miroir de la section precedente (photo a droite en `lg`). */}
      <section className="container-x py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "-80px" }}
            className="order-2 lg:order-1"
          >
            <Kicker>Zone d'intervention</Kicker>
            <SplitReveal
              as="h2"
              className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl"
            >
              Au service des chantiers dans toute la région Souss-Massa
            </SplitReveal>
            <motion.p variants={rise} className="mt-5 text-sm leading-relaxed text-ink-soft sm:text-base">
              Implantée à Agadir, Souss Droguerie accompagne quotidiennement les entreprises du
              bâtiment, les artisans et les particuliers dans toute la région Souss-Massa. Nos
              équipes assurent un accompagnement commercial et technique afin de répondre rapidement
              aux besoins de chaque chantier.
            </motion.p>

            <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
              <a
                href="tel:+212528838992"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-brand-foreground transition hover:bg-brand-dark"
              >
                <Phone className="h-4 w-4" /> +212 528 838 992
              </a>
              <a
                href="https://maps.app.goo.gl/q54qmxeEv752bJMTA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
              >
                <MapPin className="h-4 w-4" /> Voir le dépôt
              </a>
            </motion.div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <RevealImage
              src={zoneImg}
              alt="Livraison de matériaux de construction dans la région du Souss"
              from="right"
            />
          </div>
        </div>
      </section>

      {/* Expertise : les memes cartes de rayons que l'accueil. */}
      <section className="bg-cream px-3 py-20">
        <SectionHeader kicker="Notre expertise" title="Huit métiers, un seul dépôt" animated />
        <CategoryCardsCarousel items={categories} />
      </section>

      {/* Engagements : liste editoriale numerotee, titre fixe a gauche en `lg`. Filets fins
          qui se tracent a l'entree ; au survol, un filet rouge parcourt le haut du bloc. */}
      <section className="container-x py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeader
              kicker="Nos engagements"
              title="Ce sur quoi vous pouvez compter"
              align="left"
              animated
            />
          </div>
          <NumberedList items={engagements} />
        </div>
      </section>

      <SuppliersCarousel />

      <CtaBanner />
    </Layout>
  );
}

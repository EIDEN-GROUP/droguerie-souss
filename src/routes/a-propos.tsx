import { createFileRoute, Link } from "@tanstack/react-router";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
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
import { categories } from "@/lib/products";
import { seo, descriptionFrom, ALTERNATE_NAME, SITE_URL } from "@/lib/seo";
import storyImg from "@/assets/1.jpg";
import zoneImg from "@/assets/22.jpg";

const DESCRIPTION =
  "Souss Droguerie (Droguerie Souss), droguerie de matériaux de construction à Agadir depuis 1992 : carrelage, marbre, zellige, peinture, ciment, plomberie, électricité et quincaillerie pour toute la région Souss-Massa.";

/** Fiche établissement pour les moteurs de recherche : c'est elle qui alimente le panneau
 *  local de Google (adresse, horaires, zone desservie). */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: "Souss Droguerie SARL",
  // Le panneau local et la recherche associent l'orthographe courante à
  // « Droguerie Souss » : les deux noms désignent le même dépôt.
  alternateName: ALTERNATE_NAME,
  foundingDate: "1992",
  slogan: "Votre droguerie de matériaux de construction à Agadir depuis 1992",
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/logo.png`,
  hasMap: "https://maps.app.goo.gl/q54qmxeEv752bJMTA",
  sameAs: ["https://maps.app.goo.gl/q54qmxeEv752bJMTA"],
  // Coordonnées GPS réelles du dépôt (extraites du lien Google Maps de la marque).
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
    streetAddress: "Zone Industrielle",
    addressLocality: "Agadir",
    postalCode: "80000",
    addressCountry: "MA",
  },
  areaServed: [
    "Agadir",
    "Inezgane",
    "Aït Melloul",
    "Dcheira El Jihadia",
    "Taroudant",
    "Tiznit",
    "Biougra",
    "Oulad Teima",
    "Chtouka-Aït Baha",
    "Souss-Massa",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:30",
      closes: "17:00",
    },
  ],
};

export const Route = createFileRoute("/a-propos")({
  component: APropos,
  head: () =>
    seo({
      title: "À propos | Souss Droguerie, droguerie à Agadir depuis 1992",
      // DESCRIPTION dépasse 155 caractères : on le tronque proprement (coupe sur mot).
      description: descriptionFrom(DESCRIPTION),
      path: "/a-propos",
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
    text: "Toute demande de devis reçoit une réponse chiffrée sous 24 heures ouvrées, quelle que soit la taille du lot.",
  },
];

/** Compteur qui s'anime à l'entrée dans le viewport, une seule fois.
 *
 *  L'état part de la valeur finale, pas de zéro : c'est elle qui est rendue côté serveur,
 *  donc celle que lisent les crawlers et les visiteurs sans JS. Le décompte ne repart de
 *  zéro qu'au moment où le bloc entre réellement dans le viewport, côté client. */
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

function APropos() {
  return (
    <Layout>
      <script
        type="application/ld+json"
        // Données de balisage : la chaîne est construite ici, aucune entrée utilisateur.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Bandeau de tête, calé sur celui des autres pages intérieures */}
      <section className="relative overflow-hidden bg-brand-secondary text-paper">
        <div className="container-x relative py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/50">
              <Link to="/" className="transition hover:text-paper">
                Accueil
              </Link>
              <span>/</span>
              <span className="text-sky">À propos</span>
            </nav>

            <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
              Qui sommes-nous ?
            </h1>
            <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
            <p className="mt-4 max-w-2xl text-sm text-paper/70 sm:text-base">
              Depuis plus de 30 ans, Souss Droguerie accompagne les professionnels du BTP et les particuliers avec une offre complète de matériaux de construction. De la structure aux finitions, nous mettons à votre disposition des produits certifiés, des marques reconnues et un accompagnement technique à chaque étape de votre projet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="container-x py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl"
          >
            <img
              src={storyImg}
              alt="Dépôt de matériaux de construction Souss Droguerie à Agadir"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-accent-red" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-red">
                Notre histoire
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">
              Un partenaire de chantier,
              <br className="hidden sm:block" /> pas un simple dépôt
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              <p>
                Depuis 1992, Souss Droguerie développe son expertise dans la distribution de matériaux de construction destinés aux professionnels et aux particuliers. Notre objectif est resté le même : proposer des produits fiables, disponibles et adaptés aux exigences des chantiers modernes.
              </p>
              <p>
                Au fil des années, notre catalogue s'est enrichi pour couvrir l'ensemble des besoins du gros œuvre, du second œuvre et de la finition. Carrelage, sanitaire, métallurgie, isolation, peinture, électricité ou énergie solaire : une seule adresse pour l'ensemble de vos projets.
              </p>
              <p>
                Aujourd'hui, nous poursuivons cette évolution en intégrant progressivement des solutions innovantes afin d'améliorer notre accompagnement, optimiser le choix des matériaux et proposer un service toujours plus performant.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="bg-brand-secondary py-16 text-paper md:py-20">
        <div className="container-x grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-paper/10 text-sky">
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-4xl font-bold tabular-nums sm:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-wider text-paper/60 sm:text-sm">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Engagements */}
      <section className="container-x py-16 md:py-24">
        <SectionHeader kicker="Nos engagements" title="Ce sur quoi vous pouvez compter" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {engagements.map((e, i) => (
            <motion.article
              key={e.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group rounded-2xl border bg-paper p-6 transition duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-[var(--shadow-card)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-brand transition group-hover:bg-brand group-hover:text-brand-foreground">
                <e.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold uppercase tracking-wide text-ink">
                {e.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{e.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Expertise : les familles de produits */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container-x">
          <SectionHeader kicker="Notre expertise" title="Huit métiers, un seul dépôt" />
          <div className="mx-auto mt-12 grid max-w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              >
                <Link
                  to="/categories"
                  search={{ cat: c.category }}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-[var(--shadow-elevated)]"
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Voile cantonné au bas : la photo reste lisible au repos et se couvre
                      un peu plus au survol, le temps de dégager le libellé. */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/45 to-transparent transition-all duration-300 group-hover:h-full group-hover:via-black/60" />

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-shadow-overlay font-display text-sm font-bold uppercase leading-tight tracking-wide text-white">
                      {c.name}
                    </h3>
                    {/* Le filet rouge de la marque : court au repos, il s'étire au survol. */}
                    <span className="mt-2 block h-1 w-8 rounded-full bg-accent-red transition-all duration-300 group-hover:w-16" />
                    {/* max-h plutôt qu'un simple opacity : le libellé pousse le titre vers
                        le haut en s'ouvrant, ce qui donne le glissement. */}
                    <span className="text-shadow-overlay mt-0 flex max-h-0 items-center gap-1 overflow-hidden text-[11px] font-semibold uppercase tracking-wider text-white/90 opacity-0 transition-all duration-300 group-hover:mt-2 group-hover:max-h-6 group-hover:opacity-100">
                      Voir les produits <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Zone d'intervention */}
      <section className="container-x py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-accent-red" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-red">
                Zone d'intervention
              </span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">
              Au service des chantiers dans toute la région Souss-Massa
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft sm:text-base">
              Implantée à Agadir, Souss Droguerie accompagne quotidiennement les entreprises du bâtiment, les artisans et les particuliers dans toute la région Souss-Massa. Nos équipes assurent un accompagnement commercial et technique afin de répondre rapidement aux besoins de chaque chantier.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-1 overflow-hidden rounded-3xl lg:order-2"
          >
            <img
              src={zoneImg}
              alt="Livraison de matériaux de construction dans la région du Souss"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </motion.div>
        </div>
      </section>

      <SuppliersCarousel />

      <CtaBanner />
    </Layout>
  );
}

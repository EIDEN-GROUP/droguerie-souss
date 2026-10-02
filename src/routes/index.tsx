import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { SpecialtiesSection } from "@/components/SpecialtiesSection";
import { AboutSection } from "@/components/AboutSection";
import { ServiceBar } from "@/components/ServiceBar";
import { SectionHeader } from "@/components/SectionHeader";
import { BestSellersShowcase } from "@/components/BestSellersShowcase";
import { CatalogueCarousel } from "@/components/CatalogueCarousel";
import { SuppliersCarousel } from "@/components/SuppliersCarousel";
import { PromoCards } from "@/components/PromoCards";
import { CategoriesSection } from "@/components/CategoriesSection";
import { StoresShowcase } from "@/components/StoresShowcase";
import { FaqSection } from "@/components/FaqSection";
import { CatalogueEditions } from "@/components/CatalogueEditions";
import { QuoteStrip } from "@/components/QuoteStrip";
import promoImg from "@/assets/promo-collection.jpg";
import { useProducts } from "@/lib/adminStore";
import { MotionConfig, motion } from "framer-motion";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { ReplayReveals } from "@/components/motion/Reveal";
import { ArrowRight } from "lucide-react";
import { seo, jsonLd, descriptionFrom, canonical, SITE_URL, ALTERNATE_NAME } from "@/lib/seo";
import { AREA_SERVED } from "@/lib/contact";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Souss Droguerie SARL",
  alternateName: ALTERNATE_NAME,
  foundingDate: "1993",
  slogan: "Votre droguerie de matériaux de construction à Agadir depuis 1993",
  description:
    "Souss Droguerie SARL (Droguerie Souss) : droguerie et fournisseur de matériaux de construction à Agadir. Carrelage, marbre, zellige, peinture, ciment, plomberie, électricité et quincaillerie.",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  telephone: "+212528838992",
  email: "contact@soussdroguerie.com",
  hasMap: "https://maps.app.goo.gl/q54qmxeEv752bJMTA",
  sameAs: ["https://maps.app.goo.gl/q54qmxeEv752bJMTA"],
  geo: {
    "@type": "GeoCoordinates",
    latitude: 30.3830705,
    longitude: -9.5184337,
  },
  priceRange: "$$",
  currenciesAccepted: "MAD",
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
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bd Mohamed V, Q.I. Tassila III, N°29",
    addressLocality: "Dcheira",
    addressRegion: "Souss-Massa",
    postalCode: "80360",
    addressCountry: "MA",
  },
  areaServed: [...AREA_SERVED],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Souss Droguerie",
  url: `${SITE_URL}/`,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/categories?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const Route = createFileRoute("/")({
  component: Home,
  head: () =>
    seo({
      title: "Souss Droguerie SARL | Droguerie Agadir - Matériaux de construction",
      description: descriptionFrom(
        "Votre droguerie à Agadir : Souss Droguerie (Droguerie Souss) vend carrelage, marbre, zellige, peinture, ciment, plomberie, électricité et quincaillerie depuis 1993. Devis gratuit sous 48h, livraison dans tout le Souss.",
      ),
      path: "/",
      scripts: [jsonLd(organizationSchema), jsonLd(webSiteSchema)],
      links: [{ rel: "preload", as: "image", href: canonical("/hero-poster.jpg") }],
    }),
});

function SeeAllLink({ className = "mb-4 mt-10 flex justify-end" }: { className?: string }) {
  return (
    <div className={className}>
      <Link
        to="/categories"
        hash="produits"
        hashScrollIntoView={{ behavior: "instant", block: "start" }}
        className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink transition hover:text-brand"
      >
        Voir tous
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function Home() {
  const { data: products, isLoading } = useProducts();
  const productList = products || [];
  const bestSellers = productList.filter((p: any) => p.bestseller);

  return (
    <MotionConfig reducedMotion="user">
      {/* Sur l'accueil, les apparitions se rejouent a chaque passage : entree a l'arrivee
          dans l'ecran, sortie en le quittant. */}
      <ReplayReveals value>
        <Layout overlayNav videoIntro>
        <SmoothScroll />
        <Hero />
        {/* <ServiceBar /> */}

        <IntroSection />
        <SpecialtiesSection />

        {/* Bande sombre : a propos puis rayons, sur le meme fond a motif. */}
        <div className="section-dark">
          <AboutSection />
          <CategoriesSection />
        </div>

        <BestSellersShowcase products={bestSellers.slice(0, 8)} loading={isLoading} />

        <SuppliersCarousel />

        <StoresShowcase />

        {/* <PromoCards /> */}

        <CatalogueCarousel
          header={
            <SectionHeader
              kicker="Notre catalogue"
              title="Découvrez nos produits"
              align="left"
              animated
            />
          }
          description="Matériaux, outillage et finitions sélectionnés pour tous vos projets de construction dans le Souss."
          seeAll={<SeeAllLink className="mt-8 flex" />}
          products={productList.slice(0, 8)}
          loading={isLoading}
        />

        {/* <section  className="container-x py-20">
          <div className="grid gap-8 lg:grid-cols-2 items-center bg-mint/50 rounded-3xl overflow-hidden">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              src={promoImg} alt="Collection saison" loading="lazy"
              className="h-full w-full object-cover aspect-[4/3] lg:aspect-auto"
            />
            <div className="p-10 lg:p-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-red">Collection de saison</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl uppercase text-brand-navy leading-tight">
                L'élégance marocaine, du sol au plafond
              </h2>
              <p className="mt-4 text-brand-ink/80">
                Zellige émaillé, marbre poli et carrelage grand format   sélectionnés pour vos projets résidentiels et hôteliers.
              </p>
              <Link to="/categories" className="group mt-10 inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90">
                Explorer la collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section> */}

        <FaqSection />
        <CatalogueEditions />
        <QuoteStrip />
        <ScrollProgress />
        </Layout>
      </ReplayReveals>
    </MotionConfig>
  );
}

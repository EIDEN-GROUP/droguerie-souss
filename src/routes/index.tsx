import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { ServiceBar } from "@/components/ServiceBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductCard } from "@/components/ProductCard";
import { SuppliersCarousel } from "@/components/SuppliersCarousel";
import { PromoCards } from "@/components/PromoCards";
import { CategoriesSection } from "@/components/CategoriesSection";
import { CtaBanner } from "@/components/CtaBanner";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import promoImg from "@/assets/promo-collection.jpg";
import { useProducts } from "@/lib/adminStore";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { seo, jsonLd, descriptionFrom, canonical, SITE_URL, ALTERNATE_NAME } from "@/lib/seo";

/** Fiche organisation : alimente le logo, le téléphone et l'adresse dans les
 *  résultats enrichis de la recherche (complémentaire du HardwareStore sur /a-propos). */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Souss Droguerie SARL",
  // Les deux orthographes désignent la même entreprise : Google les associe
  // pour couvrir « Souss Droguerie » ET « Droguerie Souss ».
  alternateName: ALTERNATE_NAME,
  foundingDate: "1992",
  slogan: "Votre droguerie de matériaux de construction à Agadir depuis 1992",
  description:
    "Souss Droguerie SARL (Droguerie Souss) : droguerie et fournisseur de matériaux de construction à Agadir. Carrelage, marbre, zellige, peinture, ciment, plomberie, électricité et quincaillerie.",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  telephone: "+212528838992",
  email: "contact@soussdroguerie.com",
  hasMap: "https://maps.app.goo.gl/q54qmxeEv752bJMTA",
  sameAs: ["https://maps.app.goo.gl/q54qmxeEv752bJMTA"],
  // Coordonnées GPS réelles du dépôt (mêmes valeurs que la fiche HardwareStore).
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
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:30",
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
  areaServed: ["Agadir", "Inezgane", "Aït Melloul", "Taroudant", "Tiznit", "Souss-Massa"],
};

/** Recherche sur site (la page boutique filtre par ?q=) : donne un lien
 *  d'action de recherche dans les résultats Google. */
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
      // Marque en tête (conserve le #1 « Souss Droguerie » / « Droguerie Souss ») et
      // la requête clé « droguerie agadir » juste après — les deux mots-clés cibles
      // sont dans les 60 premiers caractères affichés par Google.
      title: "Souss Droguerie SARL | Droguerie Agadir — Matériaux de construction",
      description: descriptionFrom(
        "Votre droguerie à Agadir : Souss Droguerie (Droguerie Souss) vend carrelage, marbre, zellige, peinture, ciment, plomberie, électricité et quincaillerie depuis 1992. Devis gratuit sous 48h, livraison dans tout le Souss.",
      ),
      path: "/",
      scripts: [jsonLd(organizationSchema), jsonLd(webSiteSchema)],
      // LCP : le poster du hero est l'image la plus grande au-dessus de la ligne de
      // flottaison — on la précharge sur la page d'accueil uniquement (là où le hero
      // est rendu), pas sur les autres routes.
      links: [{ rel: "preload", as: "image", href: canonical("/hero-poster.jpg") }],
    }),
});

function Home() {
  const { data: products, isLoading } = useProducts();
  const productList = products || [];
  const bestSellers = productList.filter((p: any) => p.bestseller);

  return (
    <Layout>
      <Hero />
      {/* <ServiceBar /> */}

      <CategoriesSection />

      <section className="container-x py-20">
        <SectionHeader kicker="Best-sellers" title="Nos produits populaires" />
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", loop: true }}
            className="mt-12 mx-10 md:mx-14"
          >
            <CarouselContent>
              {bestSellers.map((p: any, i: number) => (
                <CarouselItem key={p.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="mx-auto h-full max-w-xs md:max-w-none">
                    <ProductCard product={p} index={i} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-10 md:-left-14 h-10 w-10" />
            <CarouselNext className="-right-10 md:-right-14 h-10 w-10" />
          </Carousel>
        )}
      </section>

      <SuppliersCarousel />

      {/* <PromoCards /> */}

      <section className="container-x py-16">
        <SectionHeader kicker="Notre catalogue" title="Découvrez nos produits" />
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : (
          <div className="mt-12">
            <ProductGrid items={productList.slice(0, 8)} />
          </div>
        )}
      </section>

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


      <CtaBanner />
    </Layout>
  );
}

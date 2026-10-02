import { DAOUD, daoudImg, daoudIntro } from "@/data/daoud-catalogue";
import { DUNE, duneAbout, duneTopics } from "@/data/dune-catalogue";

/**
 * Les deux autres enseignes, présentées à l'accueil. Tout vient de leur catalogue : nom,
 * signature, texte de présentation, photo et logo. Chaque panneau mène à ce catalogue.
 */
export interface Store {
  name: string;
  baseline: string;
  tagline: string;
  place?: string;
  text: string;
  image: string;
  logo: string;
  to: "/catalogue/daoud-building" | "/catalogue/dune-distribution";
}

/** Photo d'une famille du catalogue Dune. */
const duneTopicPhoto = (slug: string, index: number) => {
  const photo = duneTopics.find((t) => t.slug === slug)?.photos[index];
  if (!photo) throw new Error(`Photo Dune introuvable : ${slug}[${index}]`);
  return photo.src;
};

export const stores: Store[] = [
  {
    name: DAOUD.name,
    baseline: DAOUD.baseline,
    tagline: DAOUD.tagline,
    text: daoudIntro[0],
    image: daoudImg("silos-photo"),
    logo: "/catalogue-daoud/horizantel-logo.png",
    to: "/catalogue/daoud-building",
  },
  {
    name: DUNE.name,
    baseline: DUNE.baseline,
    tagline: DUNE.taglineFr,
    place: DUNE.city,
    text: duneAbout[0],
    image: duneTopicPhoto("sanitaire", 1),
    /** Réduction de `logo.png` (880 Ko), pour ne pas peser sur l'accueil. */
    logo: "/catalogue-dune/logo-small.webp",
    to: "/catalogue/dune-distribution",
  },
];

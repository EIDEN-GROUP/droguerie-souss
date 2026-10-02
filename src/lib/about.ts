import {
  BrickWall,
  Building2,
  Clock,
  Handshake,
  Package,
  PaintRoller,
  Sun,
  Wrench,
} from "lucide-react";

export const ABOUT = {
  /** Mot du directeur et phrase d'ouverture du catalogue interactif, repris à l'accueil. */
  director: {
    kicker: "Mot du directeur",
    title: ["Construire avec", "expérience"],
    body: [
      "Chers clients et partenaires, depuis 1993 Souss Droguerie accompagne les professionnels et les particuliers dans leurs projets de construction à travers une offre complète de matériaux fiables et performants.",
      "Notre priorité a toujours été d'apporter qualité, disponibilité et conseil technique afin de garantir la réussite de vos réalisations, du gros œuvre à la finition.",
      "Nous remercions l'ensemble de nos clients, partenaires et collaborateurs pour leur confiance continue.",
    ],
    signature: "La Direction",
  },
  opening: "Chaque chantier commence par le choix d'une matière.",
  intro: [
    "Depuis plus de 30 ans, Souss Droguerie accompagne les professionnels du BTP et les particuliers avec une offre complète de matériaux de construction.",
    "De la structure aux finitions, nous mettons à votre disposition des produits certifiés, des marques reconnues et un accompagnement technique à chaque étape de votre projet.",
  ],
  story: {
    kicker: "Notre histoire",
    title: ["Un partenaire de chantier,", "pas un simple dépôt"],
    imageAlt: "Dépôt de matériaux de construction Souss Droguerie à Agadir",
    paragraphs: [
      "Depuis 1993, Souss Droguerie développe son expertise dans la distribution de matériaux de construction destinés aux professionnels et aux particuliers. Notre objectif est resté le même : proposer des produits fiables, disponibles et adaptés aux exigences des chantiers modernes.",
      "Au fil des années, notre catalogue s'est enrichi pour couvrir l'ensemble des besoins du gros œuvre, du second œuvre et de la finition. Carrelage, sanitaire, métallurgie, isolation, peinture, électricité ou énergie solaire : une seule adresse pour l'ensemble de vos projets.",
      "Aujourd'hui, nous poursuivons cette évolution en intégrant progressivement des solutions innovantes afin d'améliorer notre accompagnement, optimiser le choix des matériaux et proposer un service toujours plus performant.",
    ],
  },
  zone: {
    kicker: "Zone d'intervention",
    title: "Au service des chantiers dans toute la région Souss-Massa",
    text: "Implantée à Agadir, Souss Droguerie accompagne quotidiennement les entreprises du bâtiment, les artisans et les particuliers dans toute la région Souss-Massa. Nos équipes assurent un accompagnement commercial et technique afin de répondre rapidement aux besoins de chaque chantier.",
  },
} as const;

/** Les métiers couverts, des fondations aux finitions : chaque texte énumère les familles
 *  du catalogue qui en relèvent. */
export const specialties = [
  {
    icon: BrickWall,
    name: "Gros œuvre",
    text: "Béton armé, ciments, agrégats, fer à béton, treillis soudé, métallurgie et produits préfabriqués.",
  },
  {
    icon: Wrench,
    name: "Second œuvre",
    text: "Plâtres mono et bicouche, étanchéité, isolation, bitume, plomberie et électricité.",
  },
  {
    icon: PaintRoller,
    name: "Finitions",
    text: "Céramique, ciment colle, mortiers, peinture, décoration, sanitaire et robinetterie.",
  },
  {
    icon: Sun,
    name: "Énergie solaire",
    text: "Chauffe-eaux, kits solaires, onduleurs, batteries et accessoires, pour un habitat plus économe et plus durable.",
  },
];

export const aboutStats = [
  {
    value: 30,
    suffix: "+",
    tag: "Depuis 1993",
    text: "ans à fournir les chantiers du Souss-Massa",
    icon: Building2,
  },
  {
    value: 48,
    suffix: "h",
    tag: "Réactivité",
    text: "pour recevoir un devis chiffré, quelle que soit la taille du lot",
    icon: Clock,
  },
  {
    value: 8,
    suffix: "",
    tag: "Choix",
    text: "familles de matériaux, du gros œuvre aux finitions",
    icon: Package,
  },
  {
    value: 12,
    suffix: "",
    tag: "Confiance",
    text: "marques partenaires, retenues pour leur régularité sur le terrain",
    icon: Handshake,
  },
];

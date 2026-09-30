/**
 * Contenu du catalogue Daoud Building, repris du PDF
 * « catalogue-souss-droguerie-2026 » (29 pages, format paysage 16:9),
 * recomposé en pages portrait A4.
 *
 * Les visuels vivent dans `public/catalogue-daoud/` (extraits du PDF par
 * `scripts/extract_daoud_catalogue.py`). Valeurs des tableaux vérifiées par
 * extraction positionnelle du texte du PDF.
 */

const DIR = "/catalogue-daoud";

export const daoudImg = (name: string) => `${DIR}/${name}.webp`;

export const DAOUD = {
  name: "DAOUD BUILDING",
  baseline: "Availability Service Quality",
  tagline: "L'innovation qui bâtit votre confiance.",
  website: "www.daoudbuilding.com",
  email: "daoud.building@hotmail.com",
  usine: ["+212 528 81 50 00", "+212 623 56 55 55"],
  admin: ["+212 528 83 89 92", "+212 661 84 77 59"],
} as const;

export const daoudMotDirecteur: string[] = [
  "Chers clients et partenaires,",
  "C'est avec enthousiasme que je vous invite à découvrir le nouveau catalogue conçu pour répondre concrètement à vos besoins et accompagner efficacement la réussite de vos projets.",
  "Ce catalogue met en avant une sélection rigoureuse de produits alliant qualité, performance et compétitivité, issus de fournisseurs reconnus et conformes aux exigences du secteur du bâtiment.",
  "Notre objectif est clair : vous proposer des solutions fiables, disponibles et adaptées à vos contraintes techniques et budgétaires.",
  "Chez DAOUD BUILDING, nous plaçons la proximité client, la réactivité et le rapport qualité-prix au cœur de notre démarche commerciale. Chaque produit présenté est le fruit de notre engagement à vous offrir le meilleur, tout en vous garantissant un service professionnel et un accompagnement sur mesure.",
  "Dans une logique d'amélioration continue, nous sommes en cours d'intégrer des solutions basées sur l'intelligence afin de mieux analyser vos besoins et affiner la pertinence de nos recommandations.",
  "Nous vous remercions pour votre confiance et restons à votre entière disposition pour vous conseiller et bâtir ensemble des partenariats durables.",
  "Bonne lecture et au plaisir de collaborer avec vous.",
];

export const daoudIntro: string[] = [
  "DAOUD BUILDING, acteur majeur dans la production et la distribution de matériaux de construction, repousse les limites de l'innovation avec une unité industrielle de nouvelle génération dédiée au béton préfabriqué.",
  "Alliant technologie de pointe, qualité supérieure et engagement total envers ses partenaires, DAOUD BUILDING conçoit des solutions solides, durables et esthétiques, pensées pour bâtir l'avenir dès aujourd'hui.",
  "Notre gamme complète - Agglos, Planchers, Pavés, Bordures et produits sur mesure - répond à tous les besoins du marché avec la garantie d'une finition irréprochable et d'un service ponctuel.",
  "Parce qu'à chaque projet mérite l'excellence, DAOUD BUILDING s'impose comme votre partenaire de confiance pour construire durablement.",
];

export const daoudVisions = {
  lead: "Construire l'avenir avec solidité, innovation et durabilité.",
  body: "DAOUD BUILDING ambitionne de devenir une référence incontournable du béton préfabriqué, en proposant des solutions performantes et responsables, au service d'un secteur de construction moderne et durable.",
  missions: [
    "Des produits de haute qualité, conçus pour durer.",
    "Une production industrielle moderne, maîtrisée et réactive.",
    "Un engagement constant envers la satisfaction client.",
    "Et des solutions sur mesure adaptées à chaque projet.",
  ],
};

export const daoudValeurs: string[] = [
  "Qualité & Excellence.",
  "Performance & Efficacité.",
  "Fiabilité & Disponibilité.",
  "Responsabilité.",
  "Innovation.",
  "Durabilité.",
  "Partenariat & Collaboration.",
];

export const daoudAgglosIntro: string[] = [
  "Fabriqués conformément à la norme marocaine NM 10.1.009, garantissant une qualité contrôlée, une résistance mécanique élevée et une géométrie parfaitement régulière.",
  "Nos blocs assurent une pose rapide et une durabilité éprouvée dans le temps.",
];

export interface DaoudSpecTable {
  headers: string[];
  images: string[];
  rows: { label: string; values: string[] }[];
}

export const daoudAgglosA: DaoudSpecTable = {
  headers: ["Agglos 07x50x20", "Agglos 10x50x20", "Agglos 15x50x20"],
  images: [daoudImg("agglos-07x50x20"), daoudImg("agglos-10x50x20"), daoudImg("agglos-15x50x20")],
  rows: [
    { label: "Largeur", values: ["07", "10", "15"] },
    { label: "Longueur", values: ["50", "50", "50"] },
    { label: "Hauteur", values: ["20", "20", "20"] },
    { label: "Unité / Palette", values: ["188", "134", "94"] },
    { label: "Poids Unitaire", values: ["9,30 Kg", "10,50 Kg", "14,50 Kg"] },
    { label: "Epaisseur Paroi", values: ["17", "17", "17"] },
  ],
};

export const daoudAgglosB: DaoudSpecTable = {
  headers: ["Agglos 20x50x20", "Agglos 20x50x25"],
  images: [daoudImg("agglos-20x50x20"), daoudImg("agglos-20x50x25")],
  rows: [
    { label: "Largeur", values: ["20", "20"] },
    { label: "Longueur", values: ["50", "50"] },
    { label: "Hauteur", values: ["20", "25"] },
    { label: "Unité / Palette", values: ["66", "66"] },
    { label: "Poids Unitaire", values: ["18,50 Kg", "22,50 Kg"] },
    { label: "Epaisseur Paroi", values: ["17", "17"] },
  ],
};

export const daoudPlanchersIntro: string[] = [
  "Les planchers préfabriqués allient performance, robustesse et rapidité de mise en œuvre.",
  "Conçus pour répondre aux besoins du marché et aux exigences de la norme marocaine NM 10.1.010 et NM 10.1.430, nos produits garantissent une solidité optimale, une précision dimensionnelle et une qualité constante.",
];

export const daoudHourdis: DaoudSpecTable = {
  headers: ["Hourdis 12x53x20", "Hourdis 16x53x20", "Hourdis 20x53x20"],
  images: [
    daoudImg("hourdis-12x53x20"),
    daoudImg("hourdis-16x53x20"),
    daoudImg("hourdis-20x53x20"),
  ],
  rows: [
    { label: "Largeur", values: ["12", "15", "20"] },
    { label: "Longueur", values: ["53", "53", "53"] },
    { label: "Hauteur", values: ["20", "20", "20"] },
    { label: "Unité / Palette", values: ["108", "80", "66"] },
    { label: "Poids Unitaire", values: ["11,5 Kg", "13,5 Kg", "19,5 Kg"] },
    { label: "Epaisseur Paroi", values: ["18", "18", "18"] },
  ],
};

export const daoudPoutrelleEnrobee: DaoudSpecTable = {
  headers: ["Poutrelle Enrobée", ""],
  images: [daoudImg("poutrelle-photo"), ""],
  rows: [
    { label: "Fil Supérieur", values: ["7-8", "Autres dimensions sur demande"] },
    { label: "Fil Inférieur", values: ["08-10", "Autres dimensions sur demande"] },
    { label: "Hauteur", values: ["10-14-20-25", "Autres dimensions sur demande"] },
    { label: "Etrier", values: ["4-4,5", "Autres dimensions sur demande"] },
    { label: "Longueur", values: ["1m à 14m", "Autres dimensions sur demande"] },
  ],
};

export const daoudPoutrellePC: DaoudSpecTable = {
  headers: ["Poutrelle Précontrainte", ""],
  images: [daoudImg("poutrelle-pc-photo"), ""],
  rows: [
    { label: "PPR113", values: ["N-S", "Autres dimensions sur demande"] },
    { label: "PPR114", values: ["N-S", "Autres dimensions sur demande"] },
    { label: "PPR134", values: ["S", "Autres dimensions sur demande"] },
    { label: "PPR135", values: ["S", "Autres dimensions sur demande"] },
    { label: "PPR156", values: ["S", "Autres dimensions sur demande"] },
    { label: "PPR157", values: ["S", "Autres dimensions sur demande"] },
    { label: "PPR166", values: ["S", "Autres dimensions sur demande"] },
    { label: "PPR167", values: ["S", "Autres dimensions sur demande"] },
  ],
};

export const daoudPaveIntro = {
  lead: "Fabriqué conformément à la norme marocaine NM 10.6.214, garantissant :",
  bullets: [
    "Résistance mécanique élevée aux charges et aux intempéries",
    "Pose facile et rapide grâce à leur système d'emboîtement précis",
    "Stabilité et durabilité pour routes, trottoirs, parkings et espaces publics",
    "Qualité constante grâce à une sélection rigoureuse des matières premières",
  ],
  closing:
    "Notre gamme propose diverses formes, dimensions et couleurs, pour des aménagements esthétiques et modulables, adaptés à tous vos projets.",
};

export const daoudPaves: DaoudSpecTable = {
  headers: ["Pavé Béhaton", "Pavé Holanda", "Pavé Uni"],
  images: [daoudImg("pave-behaton"), daoudImg("pave-holanda"), daoudImg("pave-uni")],
  rows: [
    { label: "Unité / Palette", values: ["450", "750", "480"] },
    { label: "M² / Palette", values: ["12,5", "15", "12"] },
    { label: "Poids / Palette", values: ["1692 Kg", "1961 Kg", "1661 Kg"] },
  ],
};

export const daoudPavesCalepinage: { src: string; caption: string }[] = [
  { src: daoudImg("pave-calepinage-1"), caption: "Calepinage · Béhaton" },
  { src: daoudImg("pave-calepinage-2"), caption: "Calepinage · Holanda" },
  { src: daoudImg("pave-calepinage-3"), caption: "Calepinage · Uni" },
];

export const daoudBordureIntro = {
  lead: "Conçue pour délimiter, sécuriser et structurer vos espaces extérieurs tout en assurant robustesse et durabilité.",
  norm: "Conforme à la norme NM EN 1340, elle garantisse :",
  bullets: [
    "Résistance élevée aux chocs et aux intempéries",
    "Facilité de pose pour une installation rapide et précise",
    "Stabilité optimale pour routes, trottoirs, parkings et aménagements urbains",
    "Qualité constante grâce à un contrôle strict des matières premières et de la production",
  ],
  closing:
    "Notre gamme propose différentes dimensions et profils, adaptées à tous types de projets, urbains ou résidentiels.",
};

export const daoudBordures: DaoudSpecTable = {
  headers: ["Bordure T2", "Bordure T3"],
  images: [daoudImg("bordure-t2"), daoudImg("bordure-t3")],
  rows: [
    { label: "Unité / Palette", values: ["24", "16"] },
    { label: "Poids / Palette", values: ["81 Kg", "105 Kg"] },
  ],
};

export const daoudSol33: { name: string; image: string }[] = [
  { name: "Striée Beige", image: daoudImg("sol33-striee-beige") },
  { name: "Striée Rouge", image: daoudImg("sol33-striee-rouge") },
  { name: "Carré Noir", image: daoudImg("sol33-carre-noir") },
  { name: "LCB Noir", image: daoudImg("sol33-lcb-noir") },
  { name: "Beldi Beige", image: daoudImg("sol33-beldi-beige") },
  { name: "Beldi Noir", image: daoudImg("sol33-beldi-noir") },
  { name: "Beldi Rouge", image: daoudImg("sol33-beldi-rouge") },
];

export const daoudSol40: { name: string; image: string }[] = [
  { name: "LC Beige", image: daoudImg("sol40-lc-beige") },
  { name: "LCB Noir", image: daoudImg("sol40-lcb-noir") },
  { name: "LCB Rouge", image: daoudImg("sol40-lcb-rouge") },
];

export const daoudSpeciaux: string[] = [
  "Chez DAOUD BUILDING, l'excellence se crée sur mesure.",
  "Nous concevons des Produits sur Mesure, élaborés selon les exigences uniques de chaque projet.",
  "Alliant innovation, expertise et qualité supérieure, nos solutions personnalisées offrent des performances exceptionnelles et une finition irréprochable.",
];

export const daoudServices = {
  intro:
    "Pour garantir un service complet et réactif, DAOUD BUILDING est présente sur l'ensemble de la région de Souss Massa et du Sud du Royaume. Elle assure aussi la livraison directe de ses produits grâce à sa flotte de logistique.",
  lead: "Ce service nous permet de :",
  items: [
    "Respecter les délais de livraison convenus avec nos clients,",
    "Assurer la traçabilité et la sécurité des produits jusqu'à leur destination,",
    "Optimiser la logistique selon vos besoins et vos chantiers,",
    "Offrir un service sur mesure, rapide et fiable.",
  ],
};

export const daoudExpertise = {
  intro: [
    "DAOUD BUILDING, votre partenaire global pour le bâtiment, propose une offre complète allant du béton armé pour les fondations jusqu'aux produits de finition, en alliant qualité, innovation et fiabilité.",
    "En plus de sa production locale, DAOUD BUILDING se distingue par une activité d'importation ciblée, garantissant l'accès aux meilleures marques internationales du secteur.",
    "Nous travaillons avec des partenaires nationaux et internationaux de renom, en tant que distributeur agréé ou importateur exclusif, notamment :",
  ],
  nationaux: "LAFARGE HOLCIM, CIMENT DU MAROC, INTERSIG, SIKA MAROC,…",
  internationaux: "ILMAR, KUKA, KOBRA, OMS EMBALCER, PAMESA, MISIUM…",
  closing: "Grâce à notre expertise, nous assurons à nos clients :",
  items: [
    "Des produits certifiés, performants et compétitifs,",
    "Une disponibilité continue,",
    "Un accompagnement technique et commercial sur mesure.",
  ],
};

export const daoudMateriaux = {
  acier:
    "Fer à béton, treillis soudé et solutions acier de qualité pour vos projets de construction et de génie civil. Des produits résistants, conformes aux normes et adaptés aux besoins des professionnels du bâtiment.",
  beton:
    "Béton armé, ciments et agrégats de qualité pour des constructions solides et durables. Des matériaux fiables répondant aux exigences des professionnels du bâtiment et des travaux publics.",
};

export const daoudTechno = {
  intro: [
    "Chez DAOUD BUILDING, la technologie est au cœur de notre stratégie de développement.",
    "Notre unité industrielle de nouvelle génération intègre des équipements automatisés et des procédés de fabrication de pointe, garantissant :",
  ],
  garanties: [
    "Une précision dimensionnelle parfaite,",
    "Une qualité constante et conforme aux normes marocaines et internationales,",
    "Une productivité optimisée tout en respectant les exigences environnementales.",
  ],
  lead: "L'innovation guide chacune de nos actions : qu'il s'agisse du choix des matières premières, de la conception des produits ou de l'amélioration continue de nos process. Nous investissons régulièrement dans :",
  items: [
    "La recherche et le développement, pour anticiper les besoins du marché,",
    "Des solutions durables, respectueuses de l'environnement,",
    "Des technologies robotisées et intelligentes pour un contrôle qualité en temps réel.",
  ],
};

export const daoudEngagements = {
  intro: [
    "Chez DAOUD BUILDING, nous plaçons le développement durable, la qualité, la sécurité et le respect de l'environnement au cœur de notre stratégie de croissance.",
    "Notre objectif est clair : construire un avenir solide et responsable, en harmonie avec la vision de développement du Royaume du Maroc.",
  ],
  lead: "Nous nous engageons à :",
  items: [
    "Améliorer continuellement nos processus pour garantir des produits fiables, performants et conformes aux normes les plus exigeantes.",
    "Investir dans le capital humain, en recrutant des profils qualifiés, responsables et à l'écoute des besoins de nos clients.",
    "Préserver l'environnement, en optimisant nos ressources, en réduisant nos déchets et en promouvant des pratiques de production respectueuses.",
    "Renforcer la sécurité et le bien-être de nos collaborateurs sur tous nos sites.",
    "Participer activement au développement national, en accompagnant la dynamique industrielle et économique du Royaume.",
  ],
};

export const daoudAttestations: { label: string; docs: string[] }[] = [
  {
    label: "Agglos",
    docs: [
      daoudImg("att-agglos-1"),
      daoudImg("att-agglos-2"),
      daoudImg("att-agglos-3"),
      daoudImg("att-agglos-4"),
    ],
  },
  { label: "Pavés", docs: [daoudImg("att-paves-1")] },
  { label: "Béton", docs: [daoudImg("att-beton-1"), daoudImg("att-beton-2")] },
  {
    label: "Hourdis",
    docs: [daoudImg("att-hourdis-1"), daoudImg("att-hourdis-2"), daoudImg("att-hourdis-3")],
  },
  {
    label: "Poutrelles",
    docs: [daoudImg("att-poutrelles-1"), daoudImg("att-poutrelles-2")],
  },
];

/**
 * Contenu du catalogue Dune Distribution (Laâyoune), repris du PDF
 * « Catalogue Dune Distribution VF 270826 » (21 pages, format carré).
 *
 * Les visuels vivent dans `public/catalogue-dune/` (extraits du PDF par
 * `scripts/extract_dune_catalogue.py`).
 */

const DIR = "/catalogue-dune";

export const duneImg = (name: string) => `${DIR}/${name}.webp`;

/** Logo officiel (fond transparent) et couverture fournis par le client. */
export const duneLogo = `${DIR}/logo.png`;
export const duneCoverFront = `${DIR}/front-cover.png`;

export const DUNE = {
  name: "DUNE DISTRIBUTION",
  baseline: "Excellence & Performance",
  taglineFr: "Construisons le Futur",
  /** « Dunes du Futur » — tel que sur la couverture du PDF. */
  taglineAr: "كثبان المستقبل",
  city: "Laâyoune",
  phones: ["+212 623 56 02 02", "+212 623 56 04 04"],
  email: "DuneDistribution@outlook.com",
  address: "Km1, N05, Rte Smara, CR Dcheira-Laâyoune",
  website: "www.dunedistribution.com",
} as const;

export interface DuneModel {
  name: string;
  image: string;
}

export interface DunePlate {
  /** « CARREAUX 120X60 » tel qu'imprimé dans le PDF. */
  format: string;
  models: DuneModel[];
}

const m = (plate: string, ...names: string[]): DuneModel[] =>
  names.map((name) => ({
    name,
    image: duneImg(
      `${plate}-${name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()}`,
    ),
  }));

export interface DuneTopic {
  slug: string;
  title: string;
  intro: string[];
  banner: string;
  bannerCaption: string;
  photos: { src: string; caption: string }[];
}

export const duneCeramicPlates: DunePlate[] = [
  { format: "CARREAUX 120X60", models: m("120x60", "ESTATUARIO", "CALACATA", "GENOVA NEGRO") },
  {
    format: "CARREAUX 60X60",
    models: m("60x60", "ROOL GF", "ROOL GC", "MIRAGE", "CARRAPLUS", "VAIL CREMA", "VAIL GRIS"),
  },
  {
    format: "CARREAUX 30X90",
    models: m("30x90", "CAPRICE NOIR", "GROWN", "FLY MARBELLA", "BETTA"),
  },
  {
    format: "CARREAUX 30X60 · Genova & Java",
    models: m("30x60", "GENOVA", "GENOVA DAMA", "JAVA BEIGE", "JAVA DAMA"),
  },
  {
    format: "CARREAUX 30X60 · Java Loft & Saragossa",
    models: m("30x60", "JAVA LOFT", "SARAGOSSA", "SARAGOSSA DAMA"),
  },
  {
    format: "CARREAUX 25X50",
    models: m(
      "25x50",
      "LIGHT BEIGE",
      "LIGHT BEIGE DECO",
      "LIGHT PERLA",
      "LIGHT PERLA DECO",
      "LIGHT GRIS",
      "LIGHT VERDA",
    ),
  },
  { format: "PARQUET 20X60", models: m("parquet-20x60", "62032", "62035", "62037", "62055") },
];

export const duneFloorPlates: DunePlate[] = [
  {
    format: "CARREAUX 33X33",
    models: m(
      "revetement-33x33",
      "LCB NOIR",
      "CARRE NOIR",
      "STRIE ROUGE",
      "STRIE BEIGE",
      "BELDI BEIGE",
      "BELDI NOIR",
    ),
  },
  {
    format: "CARREAUX 40X60",
    models: m("revetement-40x60", "LC BEIGE", "LCB NOIR", "LCB ROUGE"),
  },
];

/** Libellés d'affichage (accents) des modèles, tels qu'imprimés. */
export const duneModelLabel: Record<string, string> = {
  "VAIL CREMA": "VAIL CRÉMA",
  CARRAPLUS: "CARRAPLUS",
  GENOVA: "GÉNOVA",
  "GENOVA DAMA": "GÉNOVA DAMA",
  "LIGHT BEIGE DECO": "LIGHT BEIGE DÉCO",
  "LIGHT PERLA DECO": "LIGHT PERLA DÉCO",
  "CARRE NOIR": "CARRÉ NOIR",
  "STRIE ROUGE": "STRIÉ ROUGE",
  "STRIE BEIGE": "STRIÉ BEIGE",
};

export const duneAbout: string[] = [
  "Implantée à Laâyoune, DUNE DISTRIBUTION, élément d'un groupe spécialisé dans le secteur de la construction et du bâtiment, est un acteur de référence dans la distribution de matériaux de construction, de produits d'aménagement et d'équipements destinés aux professionnels comme aux particuliers.",
  "Forte d'une offre diversifiée, DUNE DISTRIBUTION est spécialisée dans les carrelages et accessoires, les ciments-colles, les revêtements, les ciments CPJ, la sanitaire, la robinetterie, la plomberie, la peinture et les plâtres, ainsi que la métallurgie, les systèmes d'énergie solaire et électricité et une large gamme de matériaux et équipements industriels.",
  "Guidés par des valeurs de qualité, de fiabilité et d'innovation, nous sélectionnons des produits répondant aux exigences les plus élevées afin d'accompagner la réalisation de projets résidentiels, commerciaux, industriels et d'infrastructures.",
  "À travers ce catalogue, nous vous invitons à découvrir une sélection de solutions performantes, alliant esthétique, durabilité et excellence technique.",
];

export const duneCeramicIntro = {
  headline: "UNE LARGE SÉLECTION DE CARRELAGES ALLIANT QUALITÉ, DESIGN ET DURABILITÉ.",
  body: "Que ce soit pour des projets résidentiels, commerciaux ou professionnels, nous proposons des carreaux de différentes dimensions, choix, finitions…",
};

export const duneFactoryRanges = {
  brands: ["Super Cérame", "MultiCérame", "Dersa", "Pamesa", "Cerpa", "Alaplana", "AUE"],
  intro:
    "Gamme complète de carrelages issue des leaders de fabrication locaux (Super Cérame, MultiCérame, Dersa,…) et internationaux (Pamesa, Cerpa, Alaplana, AUE…), répondant aux exigences techniques du marché de la céramique.",
  dims: "20×20, 20×60, 25×50, 25×75, 30×60, 30×90, 35×35, 41×41, 45×45, 50×50… 60×60, 75×75, 80×80, 100×100, 120×60, 240×120… en série Rectifiée (coupe laser).",
  pastes:
    "Rouge (RG), Blanche (BL), Grise (GR) et Masse Teintée (MT), adaptées aussi bien aux sols qu'aux murs. Effets marbré, pierre, bois ou parquet avec émails mate, semi-mate, brillant, poli ou super poli. Textures Relieve et Antidérapante pour les espaces extérieurs. Séries alimentaire ou anti-acides sur commande.",
};

export const duneGlueBrands = ["ERTO", "SODACERAM", "PROLIDAL 522", "PROLIJOINTS"];

export const duneTopics: DuneTopic[] = [
  {
    slug: "ciment-colle",
    title: "CIMENT COLLE & MORTIER",
    intro: [
      "Nos solutions garantissent une excellente adhérence, une résistance durable et des performances optimales pour tous vos travaux de construction, de pose et de rénovation.",
    ],
    banner: duneImg("ciment-colle-banner"),
    bannerCaption: "Mortier-colle · pose grand format",
    photos: [
      { src: duneImg("ciment-colle-pose"), caption: "Double encollage · sols" },
      { src: duneImg("ciment-colle-truelle"), caption: "Peigne cranté · murs" },
    ],
  },
  {
    slug: "ciment-cpj",
    title: "CIMENT CPJ & FER À BÉTON",
    intro: [
      "Sélectionnée pour répondre aux exigences de solidité, de résistance et de fiabilité dans vos projets de construction.",
    ],
    banner: duneImg("cpj-chantier"),
    bannerCaption: "Coulage de dalle · gros œuvre",
    photos: [
      { src: duneImg("cpj-fer"), caption: "Fer à béton · armatures" },
      { src: duneImg("cpj-betonnage"), caption: "Béton prêt à l'emploi" },
    ],
  },
  {
    slug: "prefabrique",
    title: "PRÉFABRIQUÉ",
    intro: [
      "Retrouvez nos agglos, éléments de planchers et pavés, alliant robustesse, qualité et régularité pour garantir des réalisations durables et fiables.",
    ],
    banner: duneImg("prefab-agglos"),
    bannerCaption: "Agglos · maçonnerie",
    photos: [
      { src: duneImg("prefab-paves"), caption: "Pavés · voirie" },
      { src: duneImg("prefab-plancher"), caption: "Hourdis & poutrelles · planchers" },
    ],
  },
  {
    slug: "sanitaire",
    title: "SANITAIRE & ROBINETTERIE",
    intro: [
      "Nous proposons des solutions adaptées à tous les projets : lavabos, vasques, WC, receveurs de douche, baignoires, éviers, mitigeurs, mélangeurs, colonnes de douche, accessoires et équipements sanitaires.",
    ],
    banner: duneImg("sanitaire-sdb"),
    bannerCaption: "Salle de bain complète",
    photos: [
      { src: duneImg("sanitaire-vasque"), caption: "Vasques & plans" },
      { src: duneImg("sanitaire-robinet"), caption: "Mitigeurs design" },
    ],
  },
  {
    slug: "peinture",
    title: "PEINTURE & DÉCORATION",
    intro: [
      "Apportez esthétisme à vos projets grâce à notre gamme de peintures : Vinyliques, Laqués, Enduits, Décoratives, Aquatiques, Alimentaires,…",
    ],
    banner: duneImg("peinture-mur"),
    bannerCaption: "Enduits décoratifs · intérieur",
    photos: [
      { src: duneImg("peinture-seau"), caption: "Teintes vives" },
      { src: duneImg("peinture-pots"), caption: "Pots & nuanciers" },
    ],
  },
  {
    slug: "metallurgie",
    title: "MÉTALLURGIE",
    intro: [
      "Tôles, tubes, profilés, poutrelles, cornières, fers marchands, treillis soudés, ainsi que divers accessoires adaptés à vos constructions.",
    ],
    banner: duneImg("metallurgie-tole"),
    bannerCaption: "Tôles & profilés",
    photos: [
      { src: duneImg("metallurgie-fil"), caption: "Fil machine · couronnes" },
      { src: duneImg("metallurgie-soudure"), caption: "Charpente · soudure" },
    ],
  },
  {
    slug: "solaire",
    title: "ENÉRGIE SOLAIRE",
    intro: [
      "En choisissant nos solutions d'énergie solaire, vous investissez dans une technologie performante qui réduit les coûts énergétiques, valorise vos projets et contribue à la protection de l'environnement.",
    ],
    banner: duneImg("solaire-panneaux"),
    bannerCaption: "Parc photovoltaïque",
    photos: [
      { src: duneImg("solaire-onduleur"), caption: "Onduleurs" },
      { src: duneImg("solaire-cube"), caption: "Solaire & durable" },
    ],
  },
];

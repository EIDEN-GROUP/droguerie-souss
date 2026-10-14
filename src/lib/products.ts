import tiles from "@/assets/cat-carrelage.jpg";
import marble from "@/assets/cat-marble.jpg";
import paint from "@/assets/cat-paint.jpg";
import cement from "@/assets/cat-ciment.jpg";
import cables from "@/assets/cat-electrical.jpg";
import pipes from "@/assets/cat-pipes.jpg";
import hardware from "@/assets/cat-hardware.jpg";
import plaster from "@/assets/cat-plaster.jpg";
import zellige from "@/assets/cat-zellige.jpg";
import waterproofing from "@/assets/cat-etancheite.jpg";
import bath from "@/assets/collection-bath.jpg";
import generic from "@/assets/banner-cta.jpg";

export type Category = string;

/** Une variante de dimension vendue pour un produit. */
export interface ProductVariant {
  dimension: string;
}

export interface ProductGift {
  id: string;
  product_id: string;
  gift_product_id: string;
  min_qty: number;
  gift_qty: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  subcategory?: string;
  /** Format unique, colonne historique. Remplace par les variantes (migration 017). */
  dimension?: string;
  price_mode?: "fixed" | "quote";
  price: number;
  unit: string;
  image: string;
  images?: string[];
  description: string;
  bestseller?: boolean;
  seasonal?: boolean;
  promo?: number;
  variants?: ProductVariant[];
  gifts?: ProductGift[];
}

export interface CategoryInfo {
  slug: string;
  /** Valeur portee par `/categories?cat=` quand on clique la carte. */
  category: Category;
  name: string;
  image: string;
  description: string;
  /**
   * Paragraphe SEO affiché en bas de la page de catégorie (texte naturel, rédigé pour
   * les visiteurs : contexte, conseil et mot-clé « <rayon> à Agadir » sans bourrage).
   */
  seoText?: string;
  /**
   * Categories de l'admin regroupees derriere cette carte, quand la vitrine est plus
   * large que le decoupage du catalogue. Par defaut la carte ne couvre que `category`.
   */
  covers?: Category[];
}

export const categories: CategoryInfo[] = [
  {
    slug: "carrelage-ceramique",
    category: "Carrelage & Céramique",
    name: "Carrelage & Céramique",
    image: tiles,
    description: "Carrelage, faïence et revêtements pour sols et murs",
    covers: ["Carrelage & Céramique", "Carrelage", "Céramique", "Zellige", "Marbre"],
    seoText:
      "Carrelage et céramique à Agadir : carreaux, grès cérame, faïence et revêtements en pierre naturelle pour vos sols, murs et façades. Notre équipe vous aide à choisir le calibre, la finition et la nuance adaptés à chaque pièce, puis assure la livraison dans toute la région Souss-Massa.",
  },
  {
    slug: "ciment-beton-gros-oeuvre",
    category: "Ciment, Béton & Matériaux de Gros Œuvre",
    name: "Ciment, Béton & Matériaux de Gros Œuvre",
    image: cement,
    description: "Ciment, béton et matériaux de gros œuvre",
    covers: [
      "Ciment, Béton & Matériaux de Gros Œuvre",
      "Ciment & Granulats",
      "Ciment Colle & Mortiers",
      "Béton Armé, Ciments, Agrégats",
      "Produits Préfabriqués",
      "Fer à Béton, Treillis Soudé",
      "Métallurgie",
    ],
    seoText:
      "Ciment, béton et gros œuvre à Agadir : sacs de ciment, ciments-colles, mortiers, béton, agrégats, fer à béton, treillis soudés et produits préfabriqués livrés directement sur votre chantier. Nous tenons les références courantes en stock pour que le gros œuvre ne s'arrête jamais faute d'approvisionnement.",
  },
  {
    slug: "sanitaire-robinetterie-plomberie",
    category: "Sanitaire, Robinetterie & Plomberie",
    name: "Sanitaire, Robinetterie & Plomberie",
    image: bath,
    description: "Sanitaire, robinetterie et plomberie",
    covers: ["Sanitaire, Robinetterie & Plomberie", "Plomberie", "Sanitaire, Robinetterie, Plomberie"],
    seoText:
      "Sanitaire, robinetterie et plomberie à Agadir : vasques, WC, mitigeurs, tuyaux, raccords et évacuation des marques reconnues. Notre rayon couvre l'alimentation, l'évacuation et l'équipement de salle de bain, pour les chantiers neufs comme pour la rénovation.",
  },
  {
    slug: "peinture-platre-finitions",
    category: "Peinture, Plâtre & Finitions",
    name: "Peinture, Plâtre & Finitions",
    image: paint,
    description: "Peintures, plâtres et enduits de finition",
    covers: ["Peinture, Plâtre & Finitions", "Peinture", "Peinture & Décoration", "Plâtre", "Plâtres, Mono & Bicouche"],
    seoText:
      "Peinture, plâtre et finitions à Agadir : peintures intérieures et extérieures, plâtres, enduits monocouche et produits de finition des grandes marques. Nous vous conseillons le produit adapté à chaque support et la quantité nécessaire, pour un rendu durable en climat côtier.",
  },
  {
    slug: "etancheite-isolation-techniques",
    category: "Étanchéité, Isolation & Produits Techniques",
    name: "Étanchéité, Isolation & Produits Techniques",
    image: waterproofing,
    description: "Étanchéité, isolation et produits techniques",
    covers: [
      "Étanchéité, Isolation & Produits Techniques",
      "Étanchéité, Isolation, Bitume",
      "Électricité",
      "Énergie Solaire, Électricité",
      "Quincaillerie",
      "Sécurité au travail",
    ],
    seoText:
      "Étanchéité, isolation et produits techniques à Agadir : membranes et résines d'étanchéité, isolation, matériel électrique et solaire, outillage et quincaillerie. Des solutions fiables pour protéger vos ouvrages et équiper vos chantiers, avec livraison dans tout le Souss.",
  },
];

/**
 * Normalisation des anciennes valeurs `?cat=` (cartes, SEO, liens) vers les
 * cinq rayons. Toute valeur inconnue reste telle quelle (comportement
 * historique : aucun filtre correspondant).
 */
export const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  Carrelage: "Carrelage & Céramique",
  Marbre: "Carrelage & Céramique",
  Peinture: "Peinture, Plâtre & Finitions",
  "Ciment & Granulats": "Ciment, Béton & Matériaux de Gros Œuvre",
  Plâtre: "Peinture, Plâtre & Finitions",
  Électricité: "Étanchéité, Isolation & Produits Techniques",
  Plomberie: "Sanitaire, Robinetterie & Plomberie",
  Quincaillerie: "Étanchéité, Isolation & Produits Techniques",
};

/**
 * Les categories de l'admin qu'un `?cat=` recouvre. Une carte de vitrine peut en
 * regrouper plusieurs ; toute autre valeur (une categorie de l'admin choisie ailleurs)
 * ne se represente qu'elle-meme, pour que rien ne devienne injoignable.
 */
export function categoryGroup(cat: Category): Category[] {
  return categories.find((c) => c.category === cat)?.covers ?? [cat];
}

/** Terme exclu des libellés publics de catégories (recherche insensible à la casse/accents). */
const EXCLUDED_LABEL_PATTERN = (() => {
  const strip = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const needle = strip("Zellige");
  return (label: string) => strip(label).includes(needle);
})();

/** Carte vitrine dont le groupe contient la catégorie admin donnée. */
export function mainCategoryOf(dbCategory: Category): CategoryInfo | undefined {
  return categories.find((c) => (c.covers ?? [c.category]).includes(dbCategory));
}

/**
 * Libellé public d'une catégorie admin : le nom du rayon principal.
 * Repli sûr : si la valeur est inconnue et contient le terme exclu, on
 * affiche un libellé générique plutôt que la valeur brute. Les valeurs DB
 * restent intactes — seule la présentation change.
 */
export function displayCategory(dbCategory: Category): string {
  const main = mainCategoryOf(dbCategory);
  if (main) return main.name;
  if (EXCLUDED_LABEL_PATTERN(dbCategory)) return "Nos produits";
  return dbCategory;
}

/** Valeur `?cat=` correspondant à une catégorie admin (pour liens et canonicals). */
export function displayCategoryValue(dbCategory: Category): string {
  return mainCategoryOf(dbCategory)?.category ?? dbCategory;
}

/**
 * Libellés d'affichage explicites par nom de sous-catégorie DB.
 * Vide par défaut : les valeurs brutes s'affichent, sauf celles filtrées
 * ci-dessous. Renseigner ici (sans toucher la DB) si une valeur doit être
 * renommée ou omise côté vitrine.
 */
export const SUBCATEGORY_DISPLAY_OVERRIDES: Record<string, string | null> = {
  // null = chip omis des filtres publics (produits toujours visibles via « Toutes »).
};

/**
 * Libellé public d'une sous-catégorie, ou null si le chip doit être omis des
 * filtres publics. Les valeurs DB et les noms de produits sont préservés.
 */
export function displaySubcategory(name: string): string | null {
  if (Object.hasOwn(SUBCATEGORY_DISPLAY_OVERRIDES, name)) {
    return SUBCATEGORY_DISPLAY_OVERRIDES[name];
  }
  if (EXCLUDED_LABEL_PATTERN(name)) return null;
  return name;
}

/**
 * Normalise une valeur `?cat=` historique vers le rayon actuel :
 * valeur d'un des cinq rayons, alias legacy, ou famille admin connue
 * (membre d'un `covers[]`, ex. « Zellige » → « Carrelage & Céramique »).
 * Toute autre valeur retombe sur la boutique non filtrée : une valeur
 * inconnue ne peint aucun libellé et ne pollue aucune métadonnée.
 */
export function normalizeCategoryParam(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (categories.some((c) => c.category === value)) return value;
  const legacy = LEGACY_CATEGORY_ALIASES[value];
  if (legacy) return legacy;
  return mainCategoryOf(value)?.category;
}

export const featuredCategories = categories.slice(0, 6);

/** Bundled artwork per category slug, used when a category has no image_url set in the admin. */
const categoryImages: Record<string, string> = {
  carrelage: tiles,
  ceramique: tiles,
  marbre: marble,
  zellige: zellige,
  peinture: paint,
  "peinture-decoration": paint,
  ciment: cement,
  "ciment-colle-mortiers": cement,
  "beton-arme-ciments-agregats": cement,
  "produits-prefabriques": cement,
  platre: plaster,
  "platres-mono-bicouche": plaster,
  electrique: cables,
  "energie-solaire-electricite": cables,
  plomberie: pipes,
  "sanitaire-robinetterie-plomberie": pipes,
  quincaillerie: hardware,
  metallurgie: hardware,
  "fer-a-beton-treillis-soude": hardware,
};

/** Falls back to a neutral banner so a brand-new category never renders an empty card. */
export const categoryImage = (slug: string) => categoryImages[slug] ?? generic;

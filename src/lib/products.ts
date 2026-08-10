import tiles from "@/assets/cat-tiles.jpg";
import marble from "@/assets/cat-marble.jpg";
import paint from "@/assets/cat-paint.jpg";
import cement from "@/assets/cat-cement.jpg";
import cables from "@/assets/cat-electrical.jpg";
import pipes from "@/assets/cat-pipes.jpg";
import hardware from "@/assets/cat-hardware.jpg";
import plaster from "@/assets/cat-plaster.jpg";
import zellige from "@/assets/cat-zellige.jpg";
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
    slug: "carrelage",
    category: "Carrelage",
    name: "Carrelage & Zellige",
    image: tiles,
    description: "Carreaux céramiques, grès cérame et zellige",
    covers: ["Carrelage", "Céramique", "Zellige"],
    seoText:
      "Carrelage et zellige à Agadir : Souss Droguerie vous propose des carreaux céramiques, du grès cérame, de la faïence et du zellige marocain pour vos sols, murs et façades. Notre équipe vous aide à choisir le calibre, la finition et la nuance adaptés à chaque pièce, puis assure la livraison dans toute la région Souss-Massa.",
  },
  {
    slug: "marbre",
    category: "Marbre",
    name: "Marbre",
    image: marble,
    description: "Marbre et pierres naturelles",
    seoText:
      "Marbre et pierres naturelles à Agadir : dalles, plans de travail et revêtements en marbre poli ou adouci pour vos projets résidentiels et hôteliers. Nous sélectionnons des blocs réguliers, vérifions la nuance de chaque lot et vous conseillons sur la pose et l'entretien.",
  },
  {
    slug: "peinture",
    category: "Peinture",
    name: "Peinture",
    image: paint,
    description: "Peintures intérieures et extérieures",
    seoText:
      "Peintures intérieures et extérieures à Agadir : peinture vinylique, acrylique, glycéro, lasures et enduits décoratifs des grandes marques. Nous vous conseillons le produit adapté à chaque support, la quantité nécessaire et la teinte, pour un rendu durable en climat côtier.",
  },
  {
    slug: "ciment",
    category: "Ciment & Granulats",
    name: "Ciment, Sable & Gravier",
    image: cement,
    description: "Matériaux de gros œuvre",
    seoText:
      "Ciment, sable et granulats à Agadir : sacs de ciment CPJ et CPJ-CEM, agrégats, fer à béton et matériaux de gros œuvre livrés directement sur votre chantier. Nous tenons les références courantes en stock pour que le gros œuvre ne s'arrête jamais faute d'approvisionnement.",
  },
  {
    slug: "platre",
    category: "Plâtre",
    name: "Plâtre",
    image: plaster,
    description: "Plâtre et enduits",
    seoText:
      "Plâtre et enduits à Agadir : plâtre fin, plâtre projeté, enduits monocouche et produits de finition des marques Knauf, Weber et Sika. Du rebouchage au dressage des murs, nous vous aidons à choisir le bon produit et la bonne quantité pour chaque surface.",
  },
  {
    slug: "electrique",
    category: "Électricité",
    name: "Câbles & Électricité",
    image: cables,
    description: "Câbles, fils et accessoires",
    seoText:
      "Câbles, fils et électricité à Agadir : câbles, fils, interrupteurs, prises, tableaux et matériel électrique Schneider et Legrand, conforme aux normes marocaines et disponible en stock. Un rayon complet pour les travaux neufs comme pour la rénovation.",
  },
  {
    slug: "plomberie",
    category: "Plomberie",
    name: "Tuyaux & Gouttières",
    image: pipes,
    description: "Plomberie et évacuation",
    seoText:
      "Plomberie et évacuation à Agadir : tuyaux, gouttières, raccords, robinetterie et sanitaire des marques Grohe, Astral et autres fabricants reconnus. Notre rayon couvre l'alimentation, l'évacuation et la robinetterie, pour les chantiers neufs comme pour la rénovation.",
  },
  {
    slug: "quincaillerie",
    category: "Quincaillerie",
    name: "Quincaillerie",
    image: hardware,
    description: "Outils et fournitures",
    seoText:
      "Quincaillerie et outillage à Agadir : outils, fixations, visserie, serrures et fournitures de chantier. Le rayon qui complète vos achats de matériaux au même endroit, avec le conseil d'une équipe qui connaît les exigences des chantiers du Souss.",
  },
];

/**
 * Les categories de l'admin qu'un `?cat=` recouvre. Une carte de vitrine peut en
 * regrouper plusieurs ; toute autre valeur (une categorie de l'admin choisie ailleurs)
 * ne se represente qu'elle-meme, pour que rien ne devienne injoignable.
 */
export function categoryGroup(cat: Category): Category[] {
  return categories.find((c) => c.category === cat)?.covers ?? [cat];
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

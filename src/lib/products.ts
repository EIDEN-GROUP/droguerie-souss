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
  /** Format unique, colonne historique. Remplace par `dimensions` (migration 017). */
  dimension?: string;
  /** Formats proposes pour une meme reference : le client choisit le sien. */
  dimensions?: string[];
  price_mode?: "fixed" | "quote";
  price: number;
  unit: string;
  image: string;
  images?: string[];
  description: string;
  bestseller?: boolean;
  seasonal?: boolean;
  promo?: number;
  stock: number;
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
   * Categories de l'admin regroupees derriere cette carte, quand la vitrine est plus
   * large que le decoupage du catalogue. Par defaut la carte ne couvre que `category`.
   */
  covers?: Category[];
}

export const categories: CategoryInfo[] = [
  { slug: "carrelage", category: "Carrelage", name: "Carrelage & Zellige", image: tiles, description: "Carreaux céramiques, grès cérame et zellige", covers: ["Carrelage", "Céramique", "Zellige"] },
  { slug: "marbre", category: "Marbre", name: "Marbre", image: marble, description: "Marbre et pierres naturelles" },
  { slug: "peinture", category: "Peinture", name: "Peinture", image: paint, description: "Peintures intérieures et extérieures" },
  { slug: "ciment", category: "Ciment & Granulats", name: "Ciment, Sable & Gravier", image: cement, description: "Matériaux de gros œuvre" },
  { slug: "platre", category: "Plâtre", name: "Plâtre", image: plaster, description: "Plâtre et enduits" },
  { slug: "electrique", category: "Électricité", name: "Câbles & Électricité", image: cables, description: "Câbles, fils et accessoires" },
  { slug: "plomberie", category: "Plomberie", name: "Tuyaux & Gouttières", image: pipes, description: "Plomberie et évacuation" },
  { slug: "quincaillerie", category: "Quincaillerie", name: "Quincaillerie", image: hardware, description: "Outils et fournitures" },
];

/**
 * Les categories de l'admin qu'un `?cat=` recouvre. Une carte de vitrine peut en
 * regrouper plusieurs ; toute autre valeur (une categorie de l'admin choisie ailleurs)
 * ne se represente qu'elle-meme, pour que rien ne devienne injoignable.
 */
export function categoryGroup(cat: Category): Category[] {
  return categories.find((c) => c.category === cat)?.covers ?? [cat];
}

/**
 * Formats proposes par une reference. Tant que la migration 017 n'est pas passee, seule
 * la colonne `dimension` existe : elle est traitee comme une liste d'un element, ce qui
 * fait fonctionner le selecteur avant comme apres.
 */
export function productDimensions(product: {
  dimension?: string | null;
  dimensions?: string[] | null;
}): string[] {
  const list = (product.dimensions ?? []).filter(Boolean);
  if (list.length > 0) return list;
  return product.dimension ? [product.dimension] : [];
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

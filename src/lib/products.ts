import tiles from "@/assets/cat-tiles.jpg";
import marble from "@/assets/cat-marble.jpg";
import paint from "@/assets/cat-paint.jpg";
import cement from "@/assets/cat-cement.jpg";
import cables from "@/assets/cat-electrical.jpg";
import pipes from "@/assets/cat-pipes.jpg";
import hardware from "@/assets/cat-hardware.jpg";
import plaster from "@/assets/cat-plaster.jpg";
import zellige from "@/assets/cat-zellige.jpg";

import tilesAlt from "@/assets/prod-tiles.jpg";
import marbleAlt from "@/assets/prod-marble.jpg";
import paintAlt from "@/assets/prod-paint.jpg";
import cementAlt from "@/assets/prod-cement.jpg";
import cablesAlt from "@/assets/prod-cables.jpg";
import pipesAlt from "@/assets/prod-pipes.jpg";
import hardwareAlt from "@/assets/prod-hardware.jpg";
import plasterAlt from "@/assets/prod-plaster.jpg";
import zelligeAlt from "@/assets/prod-zellige.jpg";
import bathroomLifestyle from "@/assets/collection-bath.jpg";
import livingLifestyle from "@/assets/collection-living.jpg";

export type Category =
  | "Carrelage"
  | "Marbre"
  | "Peinture"
  | "Ciment & Granulats"
  | "Zellige"
  | "Plâtre"
  | "Électricité"
  | "Plomberie"
  | "Quincaillerie";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: string;
  image: string;
  images?: string[];
  description: string;
  bestseller?: boolean;
  seasonal?: boolean;
  promo?: number; // percent off
}

export interface CategoryInfo {
  slug: string;
  category: Category;
  name: string;
  image: string;
  description: string;
}

export const categories: CategoryInfo[] = [
  { slug: "carrelage", category: "Carrelage", name: "Carrelage", image: tiles, description: "Carreaux céramiques et grès cérame" },
  { slug: "marbre", category: "Marbre", name: "Marbre", image: marble, description: "Marbre et pierres naturelles" },
  { slug: "peinture", category: "Peinture", name: "Peinture", image: paint, description: "Peintures intérieures et extérieures" },
  { slug: "ciment", category: "Ciment & Granulats", name: "Ciment, Sable & Gravier", image: cement, description: "Matériaux de gros œuvre" },
  { slug: "zellige", category: "Zellige", name: "Zellige", image: zellige, description: "Zellige marocain traditionnel" },
  { slug: "platre", category: "Plâtre", name: "Plâtre", image: plaster, description: "Plâtre et enduits" },
  { slug: "electrique", category: "Électricité", name: "Câbles & Électricité", image: cables, description: "Câbles, fils et accessoires" },
  { slug: "plomberie", category: "Plomberie", name: "Tuyaux & Gouttières", image: pipes, description: "Plomberie et évacuation" },
  { slug: "quincaillerie", category: "Quincaillerie", name: "Quincaillerie", image: hardware, description: "Outils et fournitures" },
];

export const products: Product[] = [
  { id: "p1", name: "Carrelage Grès Cérame 60x60", category: "Carrelage", price: 89, unit: "m²", image: tiles, images: [tiles, tilesAlt], description: "Carrelage grès cérame émaillé, finition mate, adapté sols intérieurs et extérieurs. Résistant au gel et aux taches.", bestseller: true },
  { id: "p2", name: "Marbre Blanc Carrara Poli", category: "Marbre", price: 480, unit: "m²", image: marble, images: [marble, marbleAlt, bathroomLifestyle], description: "Dalle de marbre blanc Carrara importé d'Italie, veinage gris naturel, poli miroir. Idéal plans de travail et revêtements.", bestseller: true, seasonal: true },
  { id: "p3", name: "Peinture Acrylique Intérieure 15L", category: "Peinture", price: 320, unit: "seau", image: paint, images: [paint, paintAlt], description: "Peinture acrylique mate haute couvrance, sans odeur, séchage rapide. Disponible en 40 teintes.", promo: 15 },
  { id: "p4", name: "Ciment CPJ 45 - Sac 50kg", category: "Ciment & Granulats", price: 68, unit: "sac", image: cement, images: [cement, cementAlt], description: "Ciment Portland composé, classe 45, conforme à la norme marocaine NM 10.1.004. Livraison en palettes.", bestseller: true },
  { id: "p5", name: "Zellige Traditionnel Fès 10x10", category: "Zellige", price: 650, unit: "m²", image: zellige, images: [zellige, zelligeAlt, livingLifestyle], description: "Zellige émaillé fait main à Fès, motifs géométriques traditionnels, cuisson artisanale au four à bois.", bestseller: true, seasonal: true },
  { id: "p6", name: "Plâtre de Construction 25kg", category: "Plâtre", price: 45, unit: "sac", image: plaster, images: [plaster, plasterAlt], description: "Plâtre standard pour enduit intérieur, prise rapide, finition lisse. Application manuelle ou mécanique." },
  { id: "p7", name: "Câble Électrique H07V-U 2.5mm² 100m", category: "Électricité", price: 380, unit: "rouleau", image: cables, images: [cables, cablesAlt], description: "Câble rigide cuivre isolation PVC, conforme NF C 32-201, pour installations domestiques et tertiaires.", promo: 10 },
  { id: "p8", name: "Tuyau PVC Ø110 Évacuation 3m", category: "Plomberie", price: 95, unit: "barre", image: pipes, images: [pipes, pipesAlt], description: "Tube PVC pression série évacuation eaux usées, norme NF, joint intégré. Résistant chimique." },
  { id: "p9", name: "Kit Visserie & Chevilles 500 pièces", category: "Quincaillerie", price: 149, unit: "boîte", image: hardware, images: [hardware, hardwareAlt], description: "Assortiment complet de vis, chevilles nylon et écrous en acier zingué. Coffret organisé par tailles.", bestseller: true },
  { id: "p10", name: "Sable de Rivière 0/4 - Big Bag 1m³", category: "Ciment & Granulats", price: 240, unit: "m³", image: cement, images: [cement, cementAlt], description: "Sable lavé calibré pour mortier et béton, granulométrie 0-4mm, livraison en big bag." },
  { id: "p11", name: "Peinture Façade Anti-Fissures 20L", category: "Peinture", price: 890, unit: "seau", image: paint, images: [paint, paintAlt], description: "Peinture élastomère haute résistance intempéries, imperméabilité totale, garantie 10 ans.", seasonal: true, promo: 20 },
  { id: "p12", name: "Marbre Noir Marquina Adouci", category: "Marbre", price: 620, unit: "m²", image: marble, images: [marble, marbleAlt, bathroomLifestyle], description: "Marbre noir intense avec veines blanches contrastées, finition adoucie non glissante." },
];

export const featuredCategories = categories.slice(0, 6);
export const bestSellers = products.filter(p => p.bestseller);
export const seasonalProducts = products.filter(p => p.seasonal);
export const promoProducts = products.filter(p => p.promo);

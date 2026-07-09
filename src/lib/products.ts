import tiles from "@/assets/cat-tiles.jpg";
import marble from "@/assets/cat-marble.jpg";
import paint from "@/assets/cat-paint.jpg";
import cement from "@/assets/cat-cement.jpg";
import cables from "@/assets/cat-electrical.jpg";
import pipes from "@/assets/cat-pipes.jpg";
import hardware from "@/assets/cat-hardware.jpg";
import plaster from "@/assets/cat-plaster.jpg";
import zellige from "@/assets/cat-zellige.jpg";

export type Category = string;

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
  promo?: number;
  stock: number;
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

export const featuredCategories = categories.slice(0, 6);

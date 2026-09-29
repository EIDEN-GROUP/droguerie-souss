import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

/** Colonnes selon la place de la grille, pas celle de l'ecran : a cote de la colonne des
 *  rayons (boutique) elle est plus etroite, et chaque carte doit garder au moins 15rem
 *  pour sa mise en page large (trois colonnes des 48rem, quatre des 64rem). */
export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-4 md:gap-5 @3xl:grid-cols-3 @5xl:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}

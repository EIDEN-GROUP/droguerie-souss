import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

/**
 * `showcase` : vitrines de l'accueil (lots de 4 et 8 produits).
 * - Mobile : carrousel a faire glisser, en defilement natif aimante. Il deborde jusqu'aux
 *   bords de l'ecran (marges negatives = gouttiere de `container-x`) pour que la carte
 *   suivante depasse, et garde un peu de padding vertical pour ne pas rogner les ombres.
 * - Des `md` : grille de 2 puis 4 colonnes, jamais 3, pour ne pas laisser de carte
 *   orpheline sur la derniere ligne.
 */
export function ProductGrid({ items, showcase = false }: { items: Product[]; showcase?: boolean }) {
  if (showcase) {
    return (
      <div className="no-scrollbar -mx-4 -my-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 py-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:m-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:p-0 lg:grid-cols-4">
        {items.map((p, i) => (
          <div
            key={p.id}
            className="w-[75%] max-w-[300px] shrink-0 snap-start sm:w-[45%] md:w-auto md:max-w-none"
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useApp } from "@/lib/store";

/**
 * Carte produit : photo encadree, nom et pastille de prix, description, etiquettes et
 * bouton d'ajout. Au survol, le texte s'efface et la photo s'etend a toute la carte ; le
 * bouton reste par-dessus.
 *
 * La carte est un conteneur (`@container`) : sous 15rem de large (deux colonnes sur
 * mobile, quatre en `lg`), marges et textes se resserrent et la pastille passe sous le nom.
 */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleFavorite, favorites } = useApp();
  const isFav = favorites.includes(product.id);
  const pct = product.promo ?? 0;

  const tags = [
    pct > 0 ? { label: `-${pct}%`, promo: true } : null,
    product.bestseller ? { label: "Best-seller" } : null,
    product.seasonal ? { label: "De saison" } : null,
    { label: product.category },
  ]
    .filter((t): t is { label: string; promo?: boolean } => t !== null)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="@container h-full"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-paper p-2.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] transition-shadow duration-300 hover:shadow-[0_14px_32px_-8px_rgba(0,0,0,0.28)] @[15rem]:rounded-[28px] @[15rem]:p-3.5">
        {/* Toute la carte mene a la fiche : un vrai lien etire sous les boutons, plutot
            qu'un clic JavaScript sur la carte (ouverture dans un onglet, exploration). */}
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          aria-label={product.name}
          className="absolute inset-0 z-[3]"
        />

        {/* Reserve la place de la photo dans le flux ; la photo elle-meme est posee en
            absolu par-dessus pour pouvoir s'etendre a toute la carte au survol. */}
        <div className="aspect-square w-full" />
        {/* Hauteur au repos = largeur utile de la carte (100cqw moins les deux marges),
            soit exactement le carre reserve au-dessus. */}
        <div className="absolute left-2.5 right-2.5 top-2.5 z-[1] h-[calc(100cqw-1.25rem)] overflow-hidden rounded-2xl bg-cream transition-[top,left,right,height,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:left-0 group-hover:right-0 group-hover:top-0 group-hover:h-full group-hover:rounded-none @[15rem]:left-3.5 @[15rem]:right-3.5 @[15rem]:top-3.5 @[15rem]:h-[calc(100cqw-1.75rem)] @[15rem]:rounded-[20px]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`absolute right-4 top-4 z-[4] grid h-8 w-8 place-items-center rounded-full bg-paper/90 shadow transition hover:bg-paper lg:opacity-0 lg:group-hover:opacity-100 @[15rem]:right-6 @[15rem]:top-6 @[15rem]:h-9 @[15rem]:w-9 ${
            isFav ? "text-accent-red" : "text-ink"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
        </button>

        <div className="mt-3 flex flex-1 flex-col transition-opacity duration-300 group-hover:opacity-0 @[15rem]:mt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <h3 className="line-clamp-2 basis-full text-sm font-bold leading-tight text-ink @[15rem]:min-w-0 @[15rem]:flex-1 @[15rem]:basis-0 @[15rem]:text-lg">
              {product.name}
            </h3>
            <span className="shrink-0 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-paper @[15rem]:px-3 @[15rem]:py-1 @[15rem]:text-sm">
              Sur devis
            </span>
          </div>

          {product.description && (
            <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-ink-soft @[15rem]:mt-3 @[15rem]:line-clamp-3 @[15rem]:text-[13px]">
              {product.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5 @[15rem]:mt-4 @[15rem]:gap-2">
            {tags.map((t) => (
              <span
                key={t.label}
                className={`max-w-full truncate rounded-full px-2.5 py-0.5 text-[9px] font-medium @[15rem]:px-3 @[15rem]:py-1 @[15rem]:text-[10px] ${
                  t.promo ? "bg-accent-red/10 text-accent-red" : "bg-brand/10 text-ink"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product)}
          className="relative z-[4] mt-3 w-full rounded-full bg-brand py-2 text-xs font-bold text-paper transition hover:bg-brand-dark @[15rem]:mt-4 @[15rem]:py-3 @[15rem]:text-base"
        >
          Ajouter au panier
        </button>
      </div>
    </motion.div>
  );
}

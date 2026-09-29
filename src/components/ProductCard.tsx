import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useApp } from "@/lib/store";
import { QuantityInput } from "./QuantityInput";

/**
 * Carte produit : pastille (promo, best-seller, saison) et favori sur la photo detouree,
 * nom, rayon, prix sur devis, puis quantite et ajout au panier.
 *
 * Toute la carte mene a la fiche : un vrai lien etire sous les boutons, plutot qu'un clic
 * JavaScript sur la carte (ouverture dans un onglet, exploration). La carte est un conteneur
 * (`@container`) : sous 15rem de large (deux colonnes sur mobile), la quantite passe
 * au-dessus du bouton au lieu d'etre a cote.
 */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleFavorite, favorites } = useApp();
  const [qty, setQty] = useState(1);
  const isFav = favorites.includes(product.id);
  const pct = product.promo ?? 0;

  const badge =
    pct > 0
      ? { label: `Promo -${pct}%`, className: "bg-accent-red/10 text-accent-red" }
      : product.bestseller
        ? { label: "Best-seller", className: "bg-brand/10 text-brand" }
        : product.seasonal
          ? { label: "De saison", className: "bg-mint text-brand-secondary" }
          : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="@container h-full"
    >
      <div className="group relative flex h-full flex-col rounded-xl border border-border bg-paper p-3 transition duration-300 hover:border-transparent hover:shadow-[var(--shadow-elevated)] @[15rem]:p-4">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          aria-label={product.name}
          className="absolute inset-0 z-[1] rounded-xl"
        />

        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
          />
        </div>

        {badge && (
          <span
            className={`pointer-events-none absolute left-3 top-3 z-[2] rounded-full px-2 py-1 text-[10px] font-semibold @[15rem]:left-4 @[15rem]:top-4 @[15rem]:px-2.5 @[15rem]:text-xs ${badge.className}`}
          >
            {badge.label}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFav}
          className={`absolute right-2 top-2 z-[2] grid h-9 w-9 place-items-center rounded-full transition hover:bg-cream @[15rem]:right-3 @[15rem]:top-3 ${
            isFav ? "text-accent-red" : "text-ink-soft hover:text-accent-red"
          }`}
        >
          <Heart
            className={`h-[18px] w-[18px] ${isFav ? "fill-current" : ""}`}
            strokeWidth={1.75}
          />
        </button>

        <h3 className="mt-3 line-clamp-2 min-h-[2.5em] font-sans text-[13px] font-semibold leading-tight tracking-normal text-ink @[15rem]:text-sm">
          {product.name}
        </h3>
        <p className="mt-1.5 truncate text-[11px] text-ink-soft @[15rem]:text-xs">
          {product.subcategory || product.category}
        </p>

        <div className="mt-auto pt-3 @[15rem]:pt-4">
          <p className="text-base font-bold text-ink @[15rem]:text-lg">Sur devis</p>

          <div className="mt-3 flex flex-col gap-2 @[15rem]:flex-row @[15rem]:items-center">
            <QuantityInput
              value={qty}
              onChange={setQty}
              className="relative z-[2] justify-between border-border @[15rem]:w-[7rem] @[15rem]:shrink-0"
            />

            <button
              type="button"
              onClick={() => {
                addToCart(product, qty);
                setQty(1);
              }}
              className="relative z-[2] h-9 w-full rounded-full bg-dark-red px-3 text-xs font-bold text-paper transition hover:bg-accent-red @[15rem]:w-auto @[15rem]:flex-1 @[15rem]:text-sm"
            >
              Au panier
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

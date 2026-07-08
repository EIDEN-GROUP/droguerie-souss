import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useApp } from "@/lib/store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleFavorite, favorites } = useApp();
  const isFav = favorites.includes(product.id);
  const promoPrice = product.promo
    ? product.price * (1 - product.promo / 100)
    : null;

  return (
    <Link to="/product/$id" params={{ id: product.id }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-paper transition hover:shadow-[var(--shadow-elevated)]"
      >
        <div className="relative aspect-square overflow-hidden bg-cream">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.promo && (
              <span className="rounded bg-accent-red px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-paper">
                -{product.promo}%
              </span>
            )}
            {product.bestseller && (
              <span className="rounded bg-brand px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-paper">
                Best-seller
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3 flex flex-col gap-2 transition lg:opacity-0 lg:group-hover:opacity-100">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`grid h-9 w-9 place-items-center rounded-full bg-paper shadow transition hover:bg-mint ${
                isFav ? "text-accent-red" : "text-ink"
              }`}
              aria-label="Favori"
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
            </button>
            <Link
              to="/product/$id"
              params={{ id: product.id }}
              className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink shadow transition hover:bg-mint"
              aria-label="Voir"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-paper transition-all duration-300 hover:bg-brand lg:translate-y-16 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            {product.category}
          </span>
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="mt-1 line-clamp-2 text-sm font-semibold text-ink transition hover:text-brand"
          >
            {product.name}
          </Link>
          <div className="mt-2 flex items-baseline gap-2">
            {promoPrice ? (
              <>
                <span className="font-display text-lg font-bold text-accent-red">
                  {promoPrice.toFixed(0)} MAD
                </span>
                <span className="text-xs text-ink-soft line-through">
                  {product.price} MAD
                </span>
              </>
            ) : (
              <span className="font-display text-lg font-bold text-ink">
                {product.price} MAD
              </span>
            )}
            <span className="text-xs text-ink-soft">/ {product.unit}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

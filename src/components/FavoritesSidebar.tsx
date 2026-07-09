import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { useProducts } from "@/lib/adminStore";

export function FavoritesSidebar() {
  const { favorites, favOpen, setFavOpen, toggleFavorite, addToCart } = useApp();
  const { data: products } = useProducts();
  const favProducts = (products || []).filter((p) => favorites.includes(p.id));

  return (
    <AnimatePresence>
      {favOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFavOpen(false)}
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
          >
            <header className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent-red" />
                <h3 className="font-display text-xl font-bold uppercase">Favoris</h3>
                <span className="rounded-full bg-mint px-2 py-0.5 text-xs font-bold">
                  {favProducts.length}
                </span>
              </div>
              <button
                onClick={() => setFavOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-mint"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {favProducts.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-mint">
                    <Heart className="h-9 w-9 text-accent-red" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold">Aucun favori</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      Cliquez sur le cœur pour sauvegarder un produit.
                    </p>
                  </div>
                  <Link
                    to="/produits"
                    onClick={() => setFavOpen(false)}
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
                  >
                    Explorer les produits
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {favProducts.map((p) => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 rounded-lg border p-3"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-20 w-20 shrink-0 rounded-md object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-ink-soft">
                          {p.price} MAD / {p.unit}
                        </p>
                        <div className="mt-auto flex items-center gap-2 pt-2">
                          <button
                            onClick={() => addToCart(p as any)}
                            className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:bg-brand-dark"
                          >
                            <ShoppingBag className="h-3 w-3" /> Ajouter
                          </button>
                          <button
                            onClick={() => toggleFavorite(p.id)}
                            className="text-xs text-ink-soft hover:text-accent-red"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

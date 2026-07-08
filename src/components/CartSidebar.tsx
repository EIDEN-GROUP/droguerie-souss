import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useApp, cartTotal } from "@/lib/store";

export function CartSidebar() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQty } = useApp();
  const total = cartTotal(cart);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
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
                <ShoppingBag className="h-5 w-5 text-brand" />
                <h3 className="font-display text-xl font-bold uppercase">
                  Mon panier
                </h3>
                <span className="rounded-full bg-mint px-2 py-0.5 text-xs font-bold text-ink">
                  {cart.length}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-mint"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-mint">
                    <ShoppingBag className="h-9 w-9 text-brand" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold">Votre panier est vide</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      Ajoutez des produits pour préparer votre devis.
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    onClick={() => setCartOpen(false)}
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-dark"
                  >
                    Voir la boutique
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.map((item) => {
                    const price = item.product.promo
                      ? item.product.price * (1 - item.product.promo / 100)
                      : item.product.price;
                    return (
                      <motion.li
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 rounded-lg border p-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-20 w-20 shrink-0 rounded-md object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="line-clamp-2 text-sm font-semibold">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {price.toFixed(2)} MAD / {item.product.unit}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 rounded-full border">
                              <button
                                onClick={() => updateQty(item.product.id, item.qty - 1)}
                                className="grid h-7 w-7 place-items-center hover:bg-mint rounded-l-full"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.product.id, item.qty + 1)}
                                className="grid h-7 w-7 place-items-center hover:bg-mint rounded-r-full"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-ink-soft hover:text-accent-red"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <footer className="border-t bg-cream px-5 py-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-sm text-ink-soft">Total estimé</span>
                  <span className="font-display text-2xl font-bold text-brand">
                    {total.toFixed(2)} MAD
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-ink-soft">
                  Prix indicatifs. Le devis final vous sera confirmé par notre équipe.
                </p>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block w-full rounded-full bg-accent-red px-5 py-3 text-center text-sm font-bold uppercase tracking-wider text-paper hover:bg-accent-red/90"
                >
                  Demander un devis
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Gift, Heart, Minus, Plus, ShoppingBag, Truck, ShieldCheck, RotateCcw, PackageSearch, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { useProducts } from "@/lib/adminStore";
import { useProduct } from "@/lib/adminStore";
import { productDimensions, type Product } from "@/lib/products";
import { useApp } from "@/lib/store";
import { ProductPromoPrice } from "@/components/ProductPrice";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

/**
 * Découpe la description en points de liste. Le champ est du texte libre côté admin :
 * une ligne par point si elle en contient plusieurs (les puces déjà tapées sont
 * retirées), sinon un point par phrase. Le point final est enlevé, une liste à puces
 * n'en met pas.
 */
function descriptionPoints(description: string): string[] {
  const lines = description
    /* Une partie du catalogue importe des "\n" litteraux (deux caracteres) au lieu de
       vrais retours a la ligne : les deux comptent comme une coupure. */
    .split(/(?:\r?\n|\\n)+/)
    /* Puces courantes : tiret, asterisque, demi-cadratin (2013), cadratin (2014),
       puce ronde (2022). Echappees pour ne pas dependre de l'encodage du fichier. */
    .map((line) => line.replace(/^\s*[-*\u2013\u2014\u2022]\s*/, "").trim())
    .filter(Boolean);

  const points = lines.length > 1 ? lines : (lines[0] ?? "").split(/(?<=\.)\s+/);

  return points.map((point) => point.trim().replace(/\.$/, "")).filter(Boolean);
}

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: allProducts } = useProducts();

  if (isLoading) {
    return (
      <Layout>
        <div className="container-x flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="container-x py-24 text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-ink-soft" />
          <p className="mt-4 font-display text-xl font-bold uppercase">Erreur de chargement</p>
          <p className="mt-1 text-sm text-ink-soft">Impossible de charger le produit. Veuillez réessayer.</p>
          <Link
            to="/categories"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark"
          >
            Retour à la boutique
          </Link>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-x py-24 text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-ink-soft" />
          <p className="mt-4 font-display text-xl font-bold uppercase">Produit introuvable</p>
          <p className="mt-1 text-sm text-ink-soft">Ce produit n'existe pas ou a été retiré du catalogue.</p>
          <Link
            to="/categories"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark"
          >
            Voir la boutique
          </Link>
        </div>
      </Layout>
    );
  }

  return <ProductDetailContent product={product as unknown as Product} products={(allProducts || []) as unknown as Product[]} />;
}

function ProductDetailContent({ product, products }: { product: Product; products: Product[] }) {
  const [qty, setQty] = useState(1);
  const { addToCart, toggleFavorite, favorites } = useApp();
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeImage, setActiveImage] = useState(0);
  const isFav = favorites.includes(product.id);
  const sameCategory = products.filter((p) => p.category === product.category && p.id !== product.id);
  const otherProducts = products.filter((p) => p.category !== product.category && p.id !== product.id);
  const related = [...sameCategory, ...otherProducts].slice(0, 4);
  const pct = product.promo ?? 0;
  const price = pct > 0 ? product.price * (1 - pct / 100) : product.price;
  const points = descriptionPoints(product.description);
  const dimensions = productDimensions(product);
  const [dimension, setDimension] = useState(dimensions[0]);

  useEffect(() => {
    setActiveImage(0);
    setQty(1);
    setDimension(productDimensions(product)[0]);
  }, [product]);

  return (
    <Layout>
      <div className="border-b bg-cream">
        <div className="container-x flex items-center gap-2 py-4 text-xs text-ink-soft">
          <Link to="/" className="hover:text-brand">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/categories" className="hover:text-brand">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">{product.name}</span>
        </div>
      </div>

      <div className="container-x py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-cream">
              <img
                key={gallery[activeImage]}
                src={gallery[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Voir l'image ${i + 1}`}
                    className={`aspect-square overflow-hidden rounded-xl bg-cream ring-2 transition ${
                      i === activeImage ? "ring-brand" : "ring-transparent hover:ring-brand/40"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-red">
              {product.category}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold uppercase leading-tight sm:text-4xl md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5">
              <ProductPromoPrice
                priceMode={product.price_mode}
                price={product.price}
                promoPrice={pct > 0 ? price : null}
                unit={product.unit}
                size="xl"
              />
              {pct > 0 && (
                <span className="ml-3 rounded bg-accent-red px-2 py-0.5 text-xs font-bold text-paper">
                  -{pct}%
                </span>
              )}
            </div>

            {points.length > 0 && (
              <ul className="mt-6 space-y-2">
                {points.map((point, i) => (
                  <li key={i} className="flex gap-2.5 leading-relaxed text-ink-soft">
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {dimensions.length > 0 && (
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  {dimensions.length > 1 ? "Format" : "Format unique"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dimensions.map((d) => {
                    const selected = d === dimension;
                    /** Une seule taille : l'information reste affichee, mais rien a choisir. */
                    const single = dimensions.length === 1;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDimension(d)}
                        disabled={single}
                        aria-pressed={selected}
                        className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition disabled:cursor-default ${
                          selected
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border text-ink hover:border-brand hover:text-brand"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center hover:bg-mint rounded-l-full">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="grid h-11 w-11 place-items-center hover:bg-mint rounded-r-full">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`order-2 grid h-12 w-12 shrink-0 place-items-center rounded-full border transition sm:order-none ${
                  isFav ? "border-accent-red text-accent-red bg-accent-red/10" : "hover:bg-mint"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => addToCart(product, qty)}
                className="order-3 flex w-full items-center justify-center gap-2 rounded-full bg-accent-red px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90 sm:order-none sm:w-auto sm:flex-1"
              >
                <ShoppingBag className="h-4 w-4" /> Ajouter au panier
              </button>
            </div>

            {product.gifts && product.gifts.length > 0 && (
              <div className="mt-6 rounded-lg border border-mint bg-mint/30 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-brand">
                  <Gift className="h-4 w-4" /> Cadeau offert
                </div>
                <ul className="mt-2 space-y-1">
                  {product.gifts.map((g) => {
                    const giftProduct = related.find((p: Product) => p.id === g.gift_product_id) || products?.find((p: Product) => p.id === g.gift_product_id);
                    return (
                      <li key={g.id} className="text-xs text-ink-soft">
                        Dès {g.min_qty} acheté{g.min_qty > 1 ? "s" : ""} → <span className="font-semibold text-ink">{g.gift_qty} × {giftProduct?.name ?? "Cadeau"}</span> offert{g.gift_qty > 1 ? "s" : ""}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-3 border-t pt-6">
              {[
                { icon: Truck, label: "Livraison 48h" },
                { icon: ShieldCheck, label: "Qualité certifiée" },
                { icon: RotateCcw, label: "Devis gratuit" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-1 text-center">
                  <f.icon className="h-5 w-5 text-brand" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <SectionHeader kicker="À découvrir" title="Produits similaires" />
            <div className="mt-10">
              <ProductGrid items={related} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Loader2,
  Package, ShoppingBag, UserRound, FileText, Send,
} from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts, useCategories } from "@/lib/adminStore";
import { createOrder } from "@/lib/api/orders";
import { useCustomerAuth } from "@/lib/customerAuth";

export const Route = createFileRoute("/commande-rapide")({
  component: CommandeRapide,
  head: () => ({ meta: [{ title: "Commande rapide   Souss Droguerie" }] }),
});

const steps = [
  { id: 1, label: "Description", icon: FileText },
  { id: 2, label: "Produits", icon: Package },
  { id: 3, label: "Coordonnées", icon: UserRound },
  { id: 4, label: "Confirmation", icon: CheckCircle2 },
];

interface CartItem {
  productId: string;
  name: string;
  image: string;
  qty: number;
}

function CommandeRapide() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { user, setAuthOpen } = useCustomerAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const catProducts = selectedCat
    ? (products || []).filter((p: any) => p.category === selectedCat)
    : [];

  const addProduct = (p: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === p.id);
      if (existing) {
        return prev.map((c) => (c.productId === p.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { productId: p.id, name: p.name, image: p.image || "", qty: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
    } else {
      setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, qty } : c)));
    }
  };

  const canNext = () => {
    if (step === 1) return description.trim().length > 0;
    if (step === 2) return cart.length > 0;
    if (step === 3) return form.name && form.phone && form.city && form.address;
    return true;
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const items = cart.map((c) => ({
        product_id: c.productId,
        product_name: c.name,
        product_image: c.image || undefined,
        price: 0,
        qty: c.qty,
      }));

      await createOrder({
        data: {
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || undefined,
          customer_city: form.city,
          customer_address: form.address,
          payment_method: "rep",
          type: "quote",
          items,
        },
      });

      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="border-b bg-cream">
        <div className="container-x flex items-center gap-2 py-4 text-xs text-ink-soft">
          <Link to="/" className="hover:text-brand">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">Commande rapide</span>
        </div>
      </div>

      <div className="container-x py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-orange">
            En 3 étapes
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
            Commande rapide
          </h1>
          <p className="mt-2 text-ink-soft">
            Décrivez votre besoin, sélectionnez les produits et recevez votre devis sous 24h.
          </p>
        </motion.div>

        <div className="mt-10 flex gap-2">
          {steps.map((s) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold transition ${
                    active
                      ? "bg-brand text-paper"
                      : done
                      ? "bg-green-500 text-paper"
                      : "bg-mint text-ink-soft"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  active ? "text-brand" : done ? "text-green-600" : "text-ink-soft"
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="mx-auto max-w-2xl space-y-6"
              >
                <div className="rounded-2xl border bg-paper p-6">
                  <h3 className="font-display text-lg font-bold uppercase">Que cherchez-vous ?</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    Décrivez brièvement votre besoin en matériaux.
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Ex : Je cherche du carrelage pour une salle de bain de 20m², couleur claire..."
                    className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
                  />
                </div>

                <div className="rounded-2xl border bg-paper p-6">
                  <h3 className="font-display text-lg font-bold uppercase">Catégorie (optionnelle)</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    Choisissez une catégorie pour nous aider à préciser votre demande.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(categories || []).map((c: any) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedCat(selectedCat === c.name ? "" : c.name)}
                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                          selectedCat === c.name
                            ? "bg-brand text-paper"
                            : "border border-border bg-white text-ink hover:border-brand"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCat && catProducts.length > 0 && (
                  <div className="rounded-2xl border bg-brand/5 p-6">
                    <p className="text-sm font-semibold text-brand">
                      {catProducts.length} produit{catProducts.length > 1 ? "s" : ""} disponible{catProducts.length > 1 ? "s" : ""} dans cette catégorie
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="mx-auto max-w-3xl space-y-4"
              >
                {productsLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-ink-soft">
                      Sélectionnez les produits souhaités et indiquez les quantités.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(selectedCat ? catProducts : products || []).map((p: any) => {
                        const inCart = cart.find((c) => c.productId === p.id);
                        return (
                          <div
                            key={p.id}
                            className={`flex gap-3 rounded-xl border bg-paper p-3 transition ${
                              inCart ? "border-brand bg-brand/5" : "hover:border-brand/50"
                            }`}
                          >
                            {p.image ? (
                              <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-mint">
                                <Package className="h-6 w-6 text-ink-soft" />
                              </div>
                            )}
                            <div className="flex min-w-0 flex-1 flex-col">
                              <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                              <p className="mt-0.5 text-xs text-ink-soft">
                                {p.price} MAD / {p.unit}
                              </p>
                              <div className="mt-auto flex items-center gap-2 pt-2">
                                {inCart ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => updateQty(p.id, inCart.qty - 1)}
                                      className="grid h-7 w-7 place-items-center rounded-full border text-xs font-bold hover:bg-mint"
                                    >
                                      -
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold">{inCart.qty}</span>
                                    <button
                                      onClick={() => updateQty(p.id, inCart.qty + 1)}
                                      className="grid h-7 w-7 place-items-center rounded-full border text-xs font-bold hover:bg-mint"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addProduct(p)}
                                    className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-paper hover:bg-brand-dark"
                                  >
                                    <ShoppingBag className="h-3 w-3" /> Ajouter
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {cart.length > 0 && (
                  <div className="rounded-2xl border bg-paper p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                      Sélection ({cart.reduce((s, c) => s + c.qty, 0)} articles)
                    </p>
                    <ul className="mt-2 divide-y text-sm">
                      {cart.map((c) => (
                        <li key={c.productId} className="flex items-center justify-between py-2">
                          <span className="line-clamp-1">{c.name}</span>
                          <span className="font-semibold">×{c.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="mx-auto max-w-xl space-y-6"
              >
                <div className="rounded-2xl border bg-paper p-6">
                  <h3 className="font-display text-lg font-bold uppercase">Vos coordonnées</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    Nous vous contacterons pour finaliser votre devis.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Nom complet" required>
                      <input value={form.name} onChange={updateForm("name")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand" />
                    </Field>
                    <Field label="Téléphone" required>
                      <input type="tel" value={form.phone} onChange={updateForm("phone")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand" />
                    </Field>
                    <Field label="Email (optionnel)">
                      <input type="email" value={form.email} onChange={updateForm("email")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand" />
                    </Field>
                    <Field label="Ville" required>
                      <input value={form.city} onChange={updateForm("city")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand" />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Adresse de livraison" required>
                      <textarea rows={3} value={form.address} onChange={updateForm("address")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand" />
                    </Field>
                  </div>

                  {!user && (
                    <p className="mt-4 text-xs text-ink-soft">
                      <button
                        type="button"
                        onClick={() => setAuthOpen(true)}
                        className="font-semibold text-brand underline-offset-2 hover:underline"
                      >
                        Connectez-vous
                      </button>{" "}
                      (optionnel) pour suivre votre commande.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-lg text-center"
              >
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold uppercase">
                  Demande envoyée !
                </h2>
                <p className="mt-3 text-ink-soft">
                  Notre équipe étudie votre demande et vous contactera sous 24h pour
                  confirmer les disponibilités et le prix final.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/rubriques"
                    className="rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-brand-dark"
                  >
                    Continuer vos achats
                  </Link>
                  <Link
                    to="/"
                    className="rounded-full border border-border px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink hover:bg-mint"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold uppercase tracking-wider transition ${
                step === 1
                  ? "cursor-not-allowed border-border text-ink-soft/50"
                  : "border-border text-ink hover:bg-mint"
              }`}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-brand-dark disabled:opacity-50"
              >
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            ) : step === 3 ? (
              <button
                onClick={onSubmit}
                disabled={!canNext() || submitting}
                className="flex items-center gap-2 rounded-full bg-accent-red px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90 disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</>
                ) : (
                  <><Send className="h-4 w-4" /> Envoyer la demande</>
                )}
              </button>
            ) : null}

            {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}
          </div>
        )}
      </div>
    </Layout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
        {label} {required && <span className="text-accent-orange">*</span>}
      </span>
      {children}
    </label>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { createOrder } from "@/lib/api/orders";
import type { PaymentMethod } from "@/lib/orders";
import { cartTotal, useApp } from "@/lib/store";
import { useCustomerAuth } from "@/lib/customerAuth";
import { saveLocalOrder } from "@/lib/localOrders";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Devis   Droguerie Souss" }] }),
});

function Checkout() {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", address: "" });
  const total = cartTotal(cart);
  const { user } = useCustomerAuth();

  // Prefill from the customer account, without overwriting what's already typed
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.fullName,
      email: f.email || user.email,
    }));
  }, [user]);

  const updateField =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const items = cart.map((i) => {
        const price = i.product.promo
          ? i.product.price * (1 - i.product.promo / 100)
          : i.product.price;
        return {
          product_id: i.product.id,
          product_name: i.product.name,
          product_image: i.product.image,
          price,
          qty: i.qty,
        };
      });
      const order = await createOrder({
        data: {
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || undefined,
          customer_city: form.city,
          customer_address: form.address,
          payment_method: payment,
          items,
        },
      });
      if (user) {
        saveLocalOrder(user.email, {
          id: order.id,
          created_at: new Date().toISOString(),
          total: order.total,
          status: "pending",
          items: items.map((i) => ({
            product_name: i.product_name,
            product_image: i.product_image || null,
            price: i.price,
            qty: i.qty,
          })),
        });
      }
      clearCart();
      navigate({ to: "/confirmation" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="border-b bg-cream">
        <div className="container-x flex items-center gap-2 py-4 text-xs text-ink-soft">
          <Link to="/" className="hover:text-brand">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/produits" className="hover:text-brand">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">Demande de devis</span>
        </div>
      </div>

      <div className="container-x py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-orange">
            Étape finale
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase sm:text-5xl">
            Demande de devis
          </h1>
          <p className="mt-2 text-ink-soft">
            Aucun paiement en ligne. Notre équipe vous contactera pour confirmer.
          </p>
          {user ? (
            <p className="mt-2 text-xs font-semibold text-brand">
              Connecté en tant que {user.email} — cette commande sera liée à votre compte.
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-soft">
              <button
                type="button"
                onClick={() => useCustomerAuth.getState().setAuthOpen(true)}
                className="font-semibold text-brand underline-offset-2 hover:underline"
              >
                Connectez-vous
              </button>{" "}
              (optionnel) pour retrouver cette commande dans votre espace client.
            </p>
          )}
        </motion.div>

        {cart.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed py-20 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-ink-soft" />
            <p className="mt-4 font-display text-lg font-bold uppercase">Votre panier est vide</p>
            <p className="mt-1 text-sm text-ink-soft">
              Ajoutez des produits avant de demander un devis.
            </p>
            <Link
              to="/produits"
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-brand-dark"
            >
              Voir la boutique
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card title="Informations client">
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <Field label="Nom complet" required>
                    <input
                      required
                      value={form.name}
                      onChange={updateField("name")}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    />
                  </Field>
                  <Field label="Téléphone" required>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={updateField("phone")}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    />
                  </Field>
                  <Field label="Email (optionnel)">
                    <input
                      type="email"
                      value={form.email}
                      onChange={updateField("email")}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    />
                  </Field>
                  <Field label="Ville" required>
                    <input
                      required
                      value={form.city}
                      onChange={updateField("city")}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    />
                  </Field>
                </div>
                <Field label="Adresse de livraison" required>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={updateField("address")}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                  />
                </Field>
              </Card>

              <Card title="Mode de règlement">
                <div className="grid gap-3">
                  {(
                    [
                      {
                        id: "cod",
                        label: "Paiement à la livraison",
                        desc: "Réglez en espèces à la réception.",
                      },
                      {
                        id: "bank",
                        label: "Virement bancaire",
                        desc: "Nos coordonnées vous seront transmises.",
                      },
                      {
                        id: "rep",
                        label: "À arranger avec le commercial",
                        desc: "Modalités définies avec notre représentant.",
                      },
                    ] as { id: PaymentMethod; label: string; desc: string }[]
                  ).map((p) => (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        payment === p.id ? "border-brand bg-brand/5" : "hover:border-brand/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === p.id}
                        onChange={() => setPayment(p.id)}
                        className="mt-1 h-4 w-4 accent-[#2f378d]"
                      />
                      <div>
                        <p className="text-sm font-bold">{p.label}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">{p.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:sticky lg:top-28 self-start">
              <Card title="Récapitulatif">
                <ul className="divide-y">
                  {cart.map((i) => {
                    const price = i.product.promo
                      ? i.product.price * (1 - i.product.promo / 100)
                      : i.product.price;
                    return (
                      <li key={i.product.id} className="flex gap-3 py-3">
                        <img
                          src={i.product.image}
                          alt=""
                          className="h-14 w-14 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold">{i.product.name}</p>
                          <p className="text-[11px] text-ink-soft">
                            {i.qty} × {price.toFixed(0)} MAD
                          </p>
                        </div>
                        <p className="text-xs font-bold">{(price * i.qty).toFixed(0)} MAD</p>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t pt-4">
                  <span className="text-sm text-ink-soft">Total estimé</span>
                  <span className="font-display text-2xl font-bold text-brand">
                    {total.toFixed(0)} MAD
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-ink-soft">
                  Prix indicatifs. Le devis final sera confirmé par notre équipe.
                </p>
                {error && <p className="mt-2 text-xs font-semibold text-accent-red">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent-red px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Envoi...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Confirmer la demande
                    </>
                  )}
                </button>
              </Card>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-paper p-5 sm:p-6">
      <h3 className="mb-5 font-display text-lg font-bold uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block first:mt-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
        {label} {required && <span className="text-accent-orange">*</span>}
      </span>
      {children}
    </label>
  );
}

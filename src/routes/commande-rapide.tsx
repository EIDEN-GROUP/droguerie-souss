import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, FileText,
  Headphones, Info, Loader2, Package, PackageSearch, Phone, Search, Send,
  ShieldCheck, ShoppingBag, Trash2, Truck, UserRound, Wallet, XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductPrice } from "@/components/ProductPrice";
import { SectionHeader } from "@/components/SectionHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProducts, useCategories } from "@/lib/adminStore";
import { createOrder } from "@/lib/api/orders";
import { useCustomerAuth } from "@/lib/customerAuth";
import { searchProducts } from "@/lib/search";
import { cartLineKey } from "@/lib/store";

export const Route = createFileRoute("/commande-rapide")({
  component: CommandeRapide,
  head: () => ({
    meta: [
      { title: "Commande rapide   Souss Droguerie" },
      {
        name: "description",
        content:
          "Décrivez votre chantier, sélectionnez vos matériaux et recevez un devis chiffré sous 24h. Gratuit et sans engagement.",
      },
    ],
  }),
});

const steps = [
  { id: 1, label: "Description", icon: FileText },
  { id: 2, label: "Produits", icon: Package },
  { id: 3, label: "Coordonnées", icon: UserRound },
  { id: 4, label: "Confirmation", icon: CheckCircle2 },
];

const heroPoints = [
  { icon: Clock, label: "Réponse sous 24h" },
  { icon: Truck, label: "Livraison dans tout le Souss" },
  { icon: ShieldCheck, label: "Gratuit et sans engagement" },
];

const benefits = [
  {
    icon: Clock,
    title: "Devis sous 24h",
    text: "Notre équipe chiffre votre demande sous 24 heures ouvrées, chantier par chantier.",
  },
  {
    icon: PackageSearch,
    title: "Tout le catalogue",
    text: "Ciment, carrelage, plomberie, électricité : une seule demande pour tous vos lots.",
  },
  {
    icon: Wallet,
    title: "Tarifs négociés",
    text: "Des prix adaptés au volume de votre chantier, au-delà de la grille publique.",
  },
  {
    icon: Headphones,
    title: "Un interlocuteur unique",
    text: "Un conseiller suit votre dossier, du devis jusqu'à la livraison sur site.",
  },
];

const howItWorks = [
  {
    icon: FileText,
    title: "Décrivez votre besoin",
    text: "Quelques lignes sur votre chantier : surface, quantités, délais, contraintes.",
  },
  {
    icon: Package,
    title: "Sélectionnez vos produits",
    text: "Choisissez dans le catalogue et indiquez les quantités souhaitées.",
  },
  {
    icon: UserRound,
    title: "Laissez vos coordonnées",
    text: "Nom, téléphone et adresse de livraison. Aucun paiement en ligne.",
  },
  {
    icon: Send,
    title: "Recevez votre devis",
    text: "Un conseiller vous rappelle sous 24h avec les prix et les disponibilités.",
  },
];

const faqs = [
  {
    q: "La commande rapide est-elle payante ?",
    a: "Non. La demande et le devis sont entièrement gratuits et sans engagement. Vous ne payez qu'après validation de votre commande avec votre conseiller.",
  },
  {
    q: "Sous quel délai vais-je recevoir mon devis ?",
    a: "Sous 24 heures ouvrées. Les demandes déposées le samedi après-midi ou le dimanche sont traitées le lundi matin.",
  },
  {
    q: "Puis-je demander un produit absent du catalogue ?",
    a: "Oui. Précisez-le dans la description à la première étape : nous consultons nos fournisseurs et revenons vers vous avec une proposition.",
  },
  {
    q: "Livrez-vous sur chantier ?",
    a: "Nous livrons dans tout le Souss. Indiquez l'adresse du chantier à l'étape 3 ; les frais et délais de livraison figurent sur le devis.",
  },
  {
    q: "Dois-je créer un compte ?",
    a: "Ce n'est pas obligatoire. Un compte vous permet simplement de retrouver l'historique de vos demandes dans votre espace client.",
  },
  {
    q: "Comment sont fixés les prix ?",
    a: "Les prix affichés sont indicatifs. Le devis final tient compte des quantités, du transport et des remises négociées pour votre chantier.",
  },
];

interface CartItem {
  productId: string;
  name: string;
  image: string;
  qty: number;
  dimension?: string;
}

function CommandeRapide() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const { user, setAuthOpen } = useCustomerAuth();

  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dimensions, setDimensions] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prefill from the customer account, without overwriting what's already typed
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.fullName,
      email: f.email || user.email,
    }));
  }, [user]);

  const updateForm = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  /** Step 2 filters the catalogue with what was typed in step 1 (via the prefill in
   *  goToStep) plus anything extra typed in the step-2 search box. The category is
   *  optional and only narrows the list when no search is active. */
  const visibleProducts = useMemo(() => {
    const list = (products || []) as any[];
    const q = search.trim();
    if (!q) {
      if (!selectedCat) return [];
      return list.filter((p: any) => p.category === selectedCat);
    }
    return searchProducts(list, q).map((r) => r.product);
  }, [products, selectedCat, search]);

  const catCount = selectedCat
    ? (products || []).filter((p: any) => p.category === selectedCat).length
    : 0;

  const totalQty = cart.reduce((s, c) => s + c.qty, 0);

  const defaultVariant = (p: any) => {
    const variants = p.variants || [];
    return variants.find((v: any) => v.stock > 0) ?? variants[0];
  };

  const pendingDimension = (p: any) => dimensions[p.id] ?? defaultVariant(p)?.dimension ?? undefined;

  const addProduct = (p: any) => {
    const dimension = pendingDimension(p);
    setCart((prev) => {
      const key = cartLineKey(p.id, dimension);
      const existing = prev.find((c) => cartLineKey(c.productId, c.dimension) === key);
      if (existing) {
        return prev.map((c) => (cartLineKey(c.productId, c.dimension) === key ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { productId: p.id, name: p.name, image: p.image || "", qty: 1, dimension }];
    });
  };

  const updateQty = (key: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => cartLineKey(c.productId, c.dimension) !== key));
    } else {
      setCart((prev) => prev.map((c) => (cartLineKey(c.productId, c.dimension) === key ? { ...c, qty } : c)));
    }
  };

  const canNext = () => {
    if (step === 1) return description.trim().length > 0;
    if (step === 2) return cart.length > 0;
    if (step === 3) return form.name && form.phone && form.city && form.address;
    return true;
  };

  const goToStep = (next: number) => {
    if (next === 2 && step === 1) setSearch(description.trim());
    setStep(next);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const items = cart.map((c) => ({
        product_id: c.productId,
        product_name: c.name,
        product_image: c.image || undefined,
        product_dimension: c.dimension || undefined,
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
          note: description.trim() || undefined,
          items,
        },
      });

      goToStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-brand-secondary text-paper">
        <div className="container-x relative py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/50">
                <Link to="/" className="transition hover:text-paper">
                  Accueil
                </Link>
                <span>/</span>
                <span className="text-sky">Commande rapide</span>
              </nav>

              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
                Commande rapide
              </h1>
              <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
              <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
                Décrivez votre chantier, sélectionnez vos matériaux et recevez un devis
                chiffré par notre équipe sous 24h ouvrées. Gratuit et sans engagement.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
                {heroPoints.map((p) => (
                  <li key={p.label} className="inline-flex items-center gap-2 text-sm font-semibold text-paper/90">
                    <p.icon className="h-4 w-4 shrink-0 text-sky" />
                    {p.label}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#formulaire"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
                >
                  Commencer ma demande
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
                <a
                  href="tel:+212528000000"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-paper/40 px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-paper hover:text-ink"
                >
                  <Phone className="h-4 w-4" /> Nous appeler
                </a>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 md:pb-2">
              <span className="h-px w-8 bg-accent-red" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky">
                Devis en 24h
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pourquoi choisir ── */}
      <section className="border-y bg-cream">
        <div className="container-x py-20">
          <SectionHeader kicker="Vos avantages" title="Pourquoi choisir la commande rapide ?" />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group h-full rounded-2xl border bg-paper p-6 transition hover:border-brand hover:shadow-[var(--shadow-card)]"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-brand transition group-hover:bg-brand group-hover:text-brand-foreground">
                  <b.icon className="h-6 w-6" />
                </div>
                <p className="mt-5 font-display text-base font-bold uppercase tracking-wide">
                  {b.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="bg-paper">
        <div className="container-x py-20">
          <SectionHeader kicker="Le déroulé" title="Comment ça marche ?" />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative h-full rounded-2xl border bg-paper p-6"
              >
                {i < howItWorks.length - 1 && (
                  <span className="absolute -right-3 top-12 hidden h-px w-6 bg-border lg:block" />
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-brand">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-2xl font-medium leading-none text-mint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-5 font-display text-base font-bold uppercase tracking-wide">
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="#formulaire"
              className="group inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
            >
              Démarrer ma demande
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Le formulaire ── */}
      <section id="formulaire" className="scroll-mt-24 border-y bg-cream">
        <div className="container-x py-20">
          <SectionHeader kicker="Votre demande" title="Remplissez le formulaire" />

          <div
            ref={formRef}
            className="mx-auto mt-12 max-w-3xl scroll-mt-24 rounded-3xl border bg-paper p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10"
          >
            {/* Stepper */}
            <div className="flex gap-2">
              {steps.map((s) => {
                const active = s.id === step;
                const done = s.id < step;
                return (
                  <div key={s.id} className="flex flex-1 flex-col items-center gap-2.5 text-center">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-full transition ${
                        done || active ? "bg-brand text-paper" : "bg-mint text-ink-soft"
                      } ${active ? "shadow-[0_0_0_5px_rgba(47,55,141,0.12)]" : ""}`}
                    >
                      {done ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        done || active ? "text-brand" : "text-ink-soft"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-mint">
              <motion.div
                className="h-full rounded-full bg-brand"
                initial={false}
                animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <div className="mt-10">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                        Que cherchez-vous ? <span className="text-ink-soft">(optionnelle)</span>
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Décrivez brièvement votre besoin en matériaux : surface, quantités, délais.
                      </p>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        placeholder="Ex : Je cherche du carrelage pour une salle de bain de 20m², couleur claire..."
                        className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand"
                      />
                    </div>

                    <div className="border-t pt-8">
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                        Catégorie
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Sélectionnez la catégorie correspondant à votre recherche.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(categories || []).map((c: any) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedCat(selectedCat === c.name ? "" : c.name)}
                            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                              selectedCat === c.name
                                ? "bg-brand text-paper"
                                : "border border-border bg-paper text-ink hover:border-brand hover:text-brand"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedCat && catCount > 0 && (
                      <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <p className="text-sm font-semibold text-brand">
                          {catCount} produit{catCount > 1 ? "s" : ""} disponible
                          {catCount > 1 ? "s" : ""} dans cette catégorie.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                        Vos produits
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Sélectionnez les références souhaitées et indiquez les quantités.
                      </p>
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un produit..."
                        className="w-full rounded-full border border-border bg-paper py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand"
                      />
                    </div>

                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCat("")}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                          !selectedCat
                            ? "bg-brand text-paper"
                            : "border border-border bg-paper text-ink hover:border-brand hover:text-brand"
                        }`}
                      >
                        Tous
                      </button>
                      {(categories || []).map((c: any) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedCat(c.name)}
                          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                            selectedCat === c.name
                              ? "bg-brand text-paper"
                              : "border border-border bg-paper text-ink hover:border-brand hover:text-brand"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>

                    {productsLoading ? (
                      <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                      </div>
                    ) : visibleProducts.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed py-16 text-center text-sm text-ink-soft">
                        {search.trim()
                          ? "Aucun produit ne correspond à votre recherche."
                          : selectedCat
                            ? "Aucun produit dans cette catégorie."
                            : "Tapez le nom d'un produit pour le retrouver."}
                      </div>
                    ) : (
                      <div className="styled-scrollbar max-h-[26rem] overflow-y-auto pr-1">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {visibleProducts.map((p: any) => {
                            const variants = p.variants || [];
                            const dimension = pendingDimension(p);
                            const inCart = cart.find((c) => cartLineKey(c.productId, c.dimension) === cartLineKey(p.id, dimension));
                            return (
                              <div
                                key={p.id}
                                className={`flex gap-3 rounded-xl border bg-paper p-3 transition ${
                                  inCart
                                    ? "border-brand bg-brand/5"
                                    : "hover:border-brand/50 hover:shadow-[var(--shadow-card)]"
                                }`}
                              >
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt=""
                                    loading="lazy"
                                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-mint">
                                    <Package className="h-6 w-6 text-ink-soft" />
                                  </div>
                                )}
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <p className="line-clamp-2 text-sm font-semibold">{p.name}</p>
                                  {variants.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                      {variants.map((v: any) => (
                                        <button
                                          key={v.dimension}
                                          type="button"
                                          onClick={() => setDimensions((d) => ({ ...d, [p.id]: v.dimension }))}
                                          disabled={v.stock === 0}
                                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                            dimension === v.dimension
                                              ? "border-brand bg-mint text-brand"
                                              : "border-border text-ink-soft hover:border-brand"
                                          }`}
                                        >
                                          {v.dimension}
                                          <span className={v.stock > 0 ? "text-ink-soft" : "text-accent-red"}>
                                            {v.stock > 0 ? `(${v.stock})` : "Épuisé"}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <ProductPrice size="sm" className="mt-1 self-start" />
                                  <div className="mt-auto flex items-center gap-2 pt-2">
                                    {inCart ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => updateQty(cartLineKey(p.id, dimension), inCart.qty - 1)}
                                          className="grid h-7 w-7 place-items-center rounded-full border text-xs font-bold transition hover:bg-mint"
                                          aria-label="Diminuer la quantité"
                                        >
                                          −
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold">
                                          {inCart.qty}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => updateQty(cartLineKey(p.id, dimension), inCart.qty + 1)}
                                          className="grid h-7 w-7 place-items-center rounded-full border text-xs font-bold transition hover:bg-mint"
                                          aria-label="Augmenter la quantité"
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => addProduct(p)}
                                        className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-paper transition hover:bg-brand-dark"
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
                      </div>
                    )}

                    {cart.length > 0 && (
                      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand">
                          Sélection · {totalQty} article{totalQty > 1 ? "s" : ""}
                        </p>
                        <ul className="mt-3 divide-y divide-brand/10 text-sm">
                          {cart.map((c) => (
                            <li
                              key={cartLineKey(c.productId, c.dimension)}
                              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                            >
                              <span className="line-clamp-1">
                                {c.name}
                                {c.dimension && <span className="text-ink-soft"> · {c.dimension}</span>}
                              </span>
                              <span className="flex shrink-0 items-center gap-3">
                                <span className="font-semibold">×{c.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(cartLineKey(c.productId, c.dimension), 0)}
                                  className="grid h-7 w-7 place-items-center rounded-full text-ink-soft transition hover:bg-accent-red/10 hover:text-accent-red"
                                  aria-label={`Retirer ${c.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </span>
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
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                        Vos coordonnées
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Nous vous contacterons pour finaliser votre devis. Aucun paiement en ligne.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nom complet" required>
                        <input
                          value={form.name}
                          onChange={updateForm("name")}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                        />
                      </Field>
                      <Field label="Téléphone" required>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={updateForm("phone")}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                        />
                      </Field>
                      <Field label="Email (optionnel)">
                        <input
                          type="email"
                          value={form.email}
                          onChange={updateForm("email")}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                        />
                      </Field>
                      <Field label="Ville" required>
                        <input
                          value={form.city}
                          onChange={updateForm("city")}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                        />
                      </Field>
                    </div>

                    <Field label="Adresse de livraison" required>
                      <textarea
                        rows={3}
                        value={form.address}
                        onChange={updateForm("address")}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                      />
                    </Field>

                    <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand">
                        Récapitulatif
                      </p>
                      <p className="mt-2 text-sm text-ink-soft">
                        {cart.length} référence{cart.length > 1 ? "s" : ""} · {totalQty} article
                        {totalQty > 1 ? "s" : ""}   devis chiffré sous 24h ouvrées.
                      </p>
                    </div>

                    {!user && (
                      <p className="text-xs text-ink-soft">
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
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mx-auto max-w-lg py-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                      className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100"
                    >
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </motion.div>
                    <h3 className="mt-6 font-display text-2xl font-bold uppercase">
                      Demande envoyée !
                    </h3>
                    <p className="mt-3 leading-relaxed text-ink-soft">
                      Notre équipe étudie votre demande et vous contactera sous 24h pour
                      confirmer les disponibilités et le prix final.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Link
                        to="/rubriques"
                        className="rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-brand-dark"
                      >
                        Continuer vos achats
                      </Link>
                      <Link
                        to="/"
                        className="rounded-full border border-border px-6 py-3 text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-mint"
                      >
                        Retour à l'accueil
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {step < 4 && (
              <div className="mt-10 border-t pt-6">
                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent-red/20 bg-accent-red/5 p-3">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-red" />
                    <p className="text-sm font-semibold text-accent-red">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => goToStep(Math.max(1, step - 1))}
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
                      type="button"
                      onClick={() => goToStep(step + 1)}
                      disabled={!canNext()}
                      className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-brand-dark disabled:opacity-50"
                    >
                      Suivant <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
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
                  )}
                </div>

                <p className="mt-4 text-center text-xs text-ink-soft">
                  Devis gratuit et sans engagement · Réponse sous 24h ouvrées
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-paper">
        <div className="container-x py-20">
          <SectionHeader kicker="Questions fréquentes" title="Bon à savoir" />

          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion type="single" collapsible className="block rounded-2xl border bg-paper px-5 sm:px-7">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q} className="last:border-b-0">
                  <AccordionTrigger className="py-5 text-left font-display text-sm font-bold uppercase tracking-wide text-ink hover:no-underline sm:text-base">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-ink-soft">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <p className="mt-8 text-center text-sm text-ink-soft">
              Une autre question ?{" "}
              <Link to="/contact" className="font-semibold text-brand underline-offset-2 hover:underline">
                Contactez notre équipe
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
        {label} {required && <span className="text-accent-red">*</span>}
      </span>
      {children}
    </label>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { NumberedList } from "@/components/NumberedList";
import { SectionHeader } from "@/components/SectionHeader";
import { SplitReveal } from "@/components/motion/SplitReveal";
import heroImg from "@/assets/hero-2.jpg";
import { submitContact } from "@/lib/api/contact";
import { BUSINESS } from "@/lib/contact";
import { seo, jsonLd, canonical } from "@/lib/seo";

/** Questions affichées telles quelles plus bas : le balisage FAQPage ci-dessous
 *  reprend exactement ces textes (exigence Google pour les résultats enrichis). */
const FAQS = [
  {
    q: "Livrez-vous en dehors d'Agadir ?",
    a: "Oui, nous livrons dans tout le Souss-Massa : Agadir, Inezgane, Aït Melloul, Dcheira, Taroudant, Tiznit, Biougra, Oulad Teima, Chtouka-Aït Baha et environs.",
  },
  {
    q: "En combien de temps recevrai-je une réponse ?",
    a: "Notre équipe vous répond sous 48h ouvrées, pour un devis comme pour une simple question.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Espèces et virement bancaire. Chaque devis détaille les quantités avant tout paiement.",
  },
  {
    q: "Travaillez-vous avec les professionnels du BTP ?",
    a: "Oui : entreprises, artisans et particuliers. Devis détaillés, prix dégressifs sur volumes et conseils de métier.",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;
/** Champs blancs sur la carte claire du formulaire. */
const INPUT =
  "w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-brand";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () =>
    seo({
      title: "Contact | Souss Droguerie, droguerie à Agadir",
      description:
        "Contactez Souss Droguerie, votre droguerie à Agadir : devis de matériaux de construction, +212 528 838 992, Zone Industrielle, Dcheira, Agadir 80360. Réponse sous 48h ouvrées.",
      path: "/contact",
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: canonical("/") },
            { "@type": "ListItem", position: 2, name: "Contact", item: canonical("/contact") },
          ],
        }),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Contact | Souss Droguerie",
          url: canonical("/contact"),
          inLanguage: "fr-FR",
          speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
        }),
      ],
    }),
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitContact({
        data: { name, phone, email: email || undefined, city: city || undefined, message },
      });
      setSent(true);
      formRef.current?.reset();
      setName("");
      setPhone("");
      setEmail("");
      setCity("");
      setMessage("");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHero image={heroImg} crumb="Contact" title="Contact">
        Notre équipe vous répond sous 48h ouvrées pour tous vos projets de construction dans le
        Souss.
      </PageHero>

      {/* Coordonnees : meme gabarit que les chiffres cles d'A propos (pastille ronde sombre,
          valeur en serif, libelle discret). */}
      <section className="container-x py-16 md:py-24">
        <div className="grid gap-12 sm:grid-cols-3 sm:gap-6">
          {[
            {
              icon: MapPin,
              title: "Adresse",
              text: BUSINESS.address,
              href: BUSINESS.mapsUrl,
            },
            {
              icon: Phone,
              title: "Téléphone",
              text: BUSINESS.phoneDisplay,
              href: BUSINESS.phoneHref,
            },
            {
              icon: Mail,
              title: "Email",
              text: BUSINESS.email,
              href: `mailto:${BUSINESS.email}`,
            },
          ].map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
              className="group flex flex-col items-center text-center"
            >
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: EASE }}
                className="grid h-16 w-16 place-items-center rounded-full bg-brand-secondary text-paper transition duration-500 group-hover:-translate-y-1 group-hover:bg-accent-red sm:h-[4.5rem] sm:w-[4.5rem]"
              >
                <c.icon className="h-6 w-6" strokeWidth={1.5} />
              </motion.span>
              <span className="mt-4 max-w-xs font-display text-lg font-semibold leading-snug text-ink [overflow-wrap:anywhere] transition-colors group-hover:text-brand sm:text-xl">
                {c.text}
              </span>
              <span className="mt-1.5 text-sm text-ink-soft">{c.title}</span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Formulaire : titre et horaires a gauche (fixes en `lg`), formulaire a droite sur
          une carte claire. */}
      <section className="container-x pb-16 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SplitReveal as="h2" className="font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">
              Écrivez-nous
            </SplitReveal>
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="mt-4 block h-1 w-12 origin-left rounded-full bg-accent-red"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base"
            >
              Décrivez votre projet, nous revenons vers vous rapidement.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="mt-10"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-secondary text-paper">
                  <Clock className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <p className="font-display text-sm font-bold uppercase tracking-wider">Horaires</p>
              </div>
              <ul className="mt-4 divide-y divide-border text-sm">
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="font-semibold text-ink">Lun - Ven</span>
                  <span className="text-right leading-snug text-ink-soft">
                    8h30 - 12h30
                    <br />
                    14h30 - 18h30
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="font-semibold text-ink">Samedi</span>
                  <span className="text-right leading-snug text-ink-soft">
                    8h30 - 12h30
                    <br />
                    14h30 - 17h00
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4 py-3">
                  <span className="font-semibold text-ink">Dimanche</span>
                  <span className="font-semibold text-accent-red">Fermé</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.form
            ref={formRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE }}
            onSubmit={handleSubmit}
            className="rounded-3xl bg-cream p-6 sm:p-10"
          >
            {sent && (
              <div className="mb-6 rounded-xl bg-brand/10 p-4 text-sm text-brand">
                Message envoyé ! Notre équipe vous contactera sous 48h.
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-xl bg-accent-red/10 p-4 text-sm text-accent-red">
                {error}
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 mb-5">
              <Field label="Nom complet" required htmlFor="name">
                <input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Téléphone" required htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Ville" htmlFor="city">
                <input
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>
            <Field label="Message" required htmlFor="message">
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={INPUT}
              />
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper transition hover:-translate-y-0.5 hover:bg-accent-red/90 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              )}
              {submitting ? "Envoi en cours…" : "Envoyer le message"}
            </button>
          </motion.form>
        </div>
      </section>

      {/* Questions fréquentes : texte repris tel quel dans le balisage FAQPage. Meme liste
          numerotee que les engagements d'A propos. */}
      <section className="container-x pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeader title="Questions fréquentes" align="left" animated />
          </div>
          <NumberedList items={FAQS.map((f) => ({ title: f.q, text: f.a }))} />
        </div>
      </section>
    </Layout>
  );
}

function Field({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink"
      >
        {label} {required && <span className="text-accent-red">*</span>}
      </label>
      {children}
    </div>
  );
}

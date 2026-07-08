import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact   Droguerie Souss" },
      { name: "description", content: "Contactez Droguerie Souss S.A.R.L pour vos devis en matériaux de construction." },
    ],
  }),
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <Layout>
      <div className="bg-gradient-to-br from-brand to-brand-dark py-16 text-paper">
        <div className="container-x">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky">
              Nous joindre
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase sm:text-5xl md:text-6xl">
              Contact
            </h1>
            <p className="mt-3 max-w-xl text-paper/80">
              Notre équipe vous répond sous 24h ouvrées pour tous vos projets.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              { icon: MapPin, title: "Adresse", text: "Zone Industrielle, Agadir 80000, Maroc", href: "https://maps.app.goo.gl/GWrfFsgksz9dH4Pf7" },
              { icon: Phone, title: "Téléphone", text: "+212 528 000 000", href: "tel:+212528000000" },
              { icon: Mail, title: "Email", text: "contact@drogueriesouss.ma", href: "mailto:contact@drogueriesouss.ma" },
            ].map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="flex gap-4 rounded-2xl border bg-paper p-5 transition hover:border-brand hover:shadow-[var(--shadow-card)]"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint text-brand">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-wider">{c.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{c.text}</p>
                </div>
              </a>
            ))}
            <div className="rounded-2xl bg-mint p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-brand">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="font-display text-sm font-bold uppercase tracking-wider">Horaires</p>
              </div>
              <ul className="mt-4 divide-y divide-brand/10 text-sm">
                <li className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                  <span className="font-semibold text-ink">Lun - Ven</span>
                  <span className="text-right leading-snug text-ink-soft">
                    8h30 - 12h30<br />14h30 - 18h30
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4 py-2.5">
                  <span className="font-semibold text-ink">Samedi</span>
                  <span className="text-right leading-snug text-ink-soft">
                    8h30 - 12h30<br />14h30 - 17h00
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4 py-2.5 last:pb-0">
                  <span className="font-semibold text-ink">Dimanche</span>
                  <span className="font-semibold text-accent-red">Fermé</span>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-2xl border bg-paper p-6 sm:p-8 lg:col-span-2"
          >
            <h2 className="font-display text-2xl font-bold uppercase">Écrivez-nous</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Décrivez votre projet, nous revenons vers vous rapidement.
            </p>
            {sent && (
              <div className="mt-4 rounded-lg bg-brand/10 p-4 text-sm text-brand">
                Message envoyé ! Notre équipe vous contactera sous 24h.
              </div>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" required><input required className="input" /></Field>
              <Field label="Téléphone" required><input required type="tel" className="input" /></Field>
              <Field label="Email"><input type="email" className="input" /></Field>
              <Field label="Ville"><input className="input" /></Field>
            </div>
            <Field label="Message" required>
              <textarea required rows={5} className="input" />
            </Field>
            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-red px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-paper hover:bg-accent-red/90">
              <Send className="h-4 w-4" /> Envoyer le message
            </button>
            <style>{`.input{width:100%;border:1px solid var(--color-border);border-radius:0.5rem;padding:0.75rem 1rem;font-size:0.875rem;outline:none;transition:border-color .2s;background:white}.input:focus{border-color:var(--color-brand)}`}</style>
          </motion.form>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
        {label} {required && <span className="text-accent-red">*</span>}
      </span>
      {children}
    </label>
  );
}

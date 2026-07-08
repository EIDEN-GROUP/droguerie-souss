import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/confirmation")({
  component: Confirmation,
  head: () => ({ meta: [{ title: "Confirmation   Droguerie Souss" }] }),
});

function Confirmation() {
  return (
    <Layout>
      <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand/10"
          >
            <CheckCircle2 className="h-12 w-12 text-brand" strokeWidth={2.5} />
          </motion.div>
          <h1 className="mt-8 font-display text-4xl font-bold uppercase sm:text-5xl">
            Votre demande est enregistrée
          </h1>
          <p className="mt-4 text-ink-soft">
            Merci ! Notre équipe vous contactera dans les prochaines heures pour
            confirmer les délais de livraison et les modalités de règlement.
          </p>
          <div className="mt-8 rounded-2xl border bg-cream p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-red">
              Prochaine étape
            </p>
            <p className="mt-2 text-sm text-ink">
              Un conseiller vous appellera au numéro fourni pour valider votre
              commande. Un devis détaillé vous sera envoyé par email si vous
              l'avez renseigné.
            </p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-brand-dark"
            >
              <Home className="h-4 w-4" /> Retour à l'accueil
            </Link>
            <a
              href="tel:+212528000000"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-ink hover:text-paper"
            >
              <Phone className="h-4 w-4" /> Nous appeler
            </a>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

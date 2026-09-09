import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bug, Mail, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { seo, jsonLd, canonical, descriptionFrom } from "@/lib/seo";

const DESCRIPTION =
  "Politique de sécurité de Souss Droguerie (Agadir) : comment signaler une faille (contact@soussdroguerie.com), périmètre autorisé, règles de bonne conduite et remerciements.";

export const Route = createFileRoute("/security")({
  component: Security,
  head: () =>
    seo({
      title: "Sécurité — Signaler une faille | Souss Droguerie",
      description: descriptionFrom(DESCRIPTION),
      path: "/security",
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: canonical("/") },
            { "@type": "ListItem", position: 2, name: "Sécurité", item: canonical("/security") },
          ],
        }),
      ],
    }),
});

const RULES_OK = [
  "Une description claire de la vulnérabilité et de son impact potentiel.",
  "L'URL, le point d'accès ou le composant concerné.",
  "Les étapes pour reproduire le problème.",
  "Une preuve de concept lorsque c'est possible.",
];

const RULES_NOK = [
  "Accéder aux données clients, les modifier, les supprimer ou les divulguer.",
  "Tester la résistance au déni de service ou épuiser nos ressources.",
  "Mener des attaques d'ingénierie sociale ou d'hameçonnage.",
  "Tenter des attaques physiques contre nos équipes ou nos locaux.",
  "Publier une faille avant qu'elle ait été corrigée.",
];

function Security() {
  return (
    <Layout>
      <section className="relative overflow-hidden bg-brand-secondary text-paper">
        <div className="container-x relative py-10 md:py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/50">
              <Link to="/" className="transition hover:text-paper">
                Accueil
              </Link>
              <span>/</span>
              <span className="text-sky">Sécurité</span>
            </nav>
            <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-5xl">
              Sécurité
            </h1>
            <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
            <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
              Vous avez trouvé une faille ? Merci de nous aider à protéger nos clients — nous la
              corrigerons et vous en remercierons.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-x py-14 md:py-20">
        <div className="max-w-3xl">
          <div className="flex items-start gap-4 rounded-2xl bg-mint p-5 sm:p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper text-brand">
              <Bug className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-ink sm:text-base">
              Écrivez à{" "}
              <a
                href="mailto:contact@soussdroguerie.com?subject=%5BS%C3%A9curit%C3%A9%5D%20Signalement%20de%20vuln%C3%A9rabilit%C3%A9"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                contact@soussdroguerie.com
              </a>{" "}
              (objet : [Sécurité]). Nous accusons réception sous 5 jours ouvrés et vous tenons
              informé de la correction. Merci de chiffrer les pièces sensibles si vous le pouvez et
              de nous laisser le temps de corriger avant toute divulgation.
            </p>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink sm:text-2xl">
              Périmètre
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
              Sont concernés : le site www.soussdroguerie.com (vitrine, boutique, espace client,
              administration) et nos API publiques documentées. Sont exclus : les services tiers
              (Google, Microsoft, Supabase, prestataires d'hébergement) — signalez-leur directement
              toute faille de leur côté.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink sm:text-2xl">
              Votre signalement doit inclure
            </h2>
            <ul className="mt-4 space-y-2">
              {RULES_OK.map((r) => (
                <li
                  key={r}
                  className="flex gap-2.5 text-sm leading-relaxed text-ink-soft sm:text-base"
                >
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink sm:text-2xl">
              Merci de ne pas
            </h2>
            <ul className="mt-4 space-y-2">
              {RULES_NOK.map((r) => (
                <li
                  key={r}
                  className="flex gap-2.5 text-sm leading-relaxed text-ink-soft sm:text-base"
                >
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-red"
                  />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section id="acknowledgments" className="mt-10 scroll-mt-24">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink sm:text-2xl">
              Remerciements
            </h2>
            <p className="mt-3 flex items-start gap-3 text-sm leading-relaxed text-ink-soft sm:text-base">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              Aucun chercheur à remercier pour le moment — les signalements responsables validés
              seront cités ici (avec l'accord de leur auteur).
            </p>
          </section>

          <p className="mt-10 text-xs text-ink-soft">
            Fichier machine :{" "}
            <a
              href="/.well-known/security.txt"
              className="font-semibold text-brand hover:underline"
            >
              /.well-known/security.txt
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}

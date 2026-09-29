import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { seo, jsonLd, canonical, descriptionFrom } from "@/lib/seo";
import heroImg from "@/assets/22.jpg";

const DESCRIPTION =
  "Politique de confidentialité de Souss Droguerie (Agadir) : quelles données nous collectons (contact, commandes, mesure d'audience), pourquoi, combien de temps, et vos droits (Loi 09-08).";

export const Route = createFileRoute("/politique-confidentialite")({
  component: Privacy,
  head: () =>
    seo({
      title: "Politique de confidentialité | Souss Droguerie, Agadir",
      description: descriptionFrom(DESCRIPTION),
      path: "/politique-confidentialite",
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: canonical("/") },
            {
              "@type": "ListItem",
              position: 2,
              name: "Politique de confidentialité",
              item: canonical("/politique-confidentialite"),
            },
          ],
        }),
      ],
    }),
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Qui sommes-nous ?",
    body: [
      "Le présent site est édité par Souss Droguerie SARL, Bd Mohamed V, Q.I. Tassila III, N°29, Dcheira, Agadir 80360, Maroc (+212 528 838 992 - contact@soussdroguerie.com), responsable du traitement de vos données personnelles au sens de la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.",
    ],
  },
  {
    title: "Quelles données collectons-nous ?",
    body: [
      "Formulaire de contact : nom, téléphone, e-mail et ville (facultatifs selon les champs), et le contenu de votre message - uniquement pour vous répondre, sous 48h ouvrées.",
      "Commandes et devis : nom, téléphone, e-mail, ville, adresse de livraison et détail des articles - uniquement pour préparer, confirmer et livrer votre demande.",
      "Compte client (optionnel) : nom, e-mail et mot de passe chiffré - uniquement pour suivre vos commandes.",
      "Mesure d'audience (avec votre accord) : pages visitées et interactions anonymisées via Google Analytics 4 et les outils Microsoft (Bing). Aucune donnée publicitaire n'est revendue.",
      "Données techniques : journaux de connexion et préférences (langue, consentement cookies) nécessaires à la sécurité et au fonctionnement du site.",
    ],
  },
  {
    title: "Cookies et consentement",
    body: [
      "Nous respectons votre vie privée : les cookies de mesure d'audience (Google Analytics, Microsoft) ne sont déposés qu'après votre acceptation via le bandeau affiché à votre première visite. Vous pouvez changer d'avis à tout moment en effaçant les données du site dans votre navigateur, ce qui réaffichera le bandeau.",
      "Les cookies strictement nécessaires (session, sécurité, mémorisation de votre choix) ne requièrent pas de consentement et ne servent jamais à vous suivre.",
    ],
  },
  {
    title: "Avec qui partageons-nous vos données ?",
    body: [
      "Hébergement et base de données (Supabase, Union européenne), envoi d'e-mails transactionnels (confirmation de commande, réponse du support) et mesure d'audience (Google, Microsoft) - uniquement ce qui est nécessaire au service demandé. Nous ne vendons ni ne louons vos données, et ne les transférons à aucun tiers à des fins publicitaires.",
    ],
  },
  {
    title: "Combien de temps les conservons-nous ?",
    body: [
      "Messages de contact : 3 ans. Commandes et devis : 5 ans (obligations comptables et garantie). Comptes clients : jusqu'à votre demande de suppression. Mesures d'audience : 14 mois maximum. Passés ces délais, les données sont supprimées ou anonymisées.",
    ],
  },
  {
    title: "Vos droits (Loi 09-08)",
    body: [
      "Vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données. Écrivez à contact@soussdroguerie.com (objet : « Données personnelles ») ou appelez le +212 528 838 992 - réponse sous 30 jours. En cas de désaccord persistant, vous pouvez saisir la CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel).",
    ],
  },
  {
    title: "Sécurité",
    body: [
      "Connexions chiffrées (HTTPS), mots de passe chiffrés et jamais stockés en clair, accès à l'administration réservé au personnel habilité, et faille de sécurité : écrivez à contact@soussdroguerie.com - voir aussi notre page /security. En cas de violation susceptible d'engendrer un risque élevé pour vos droits, nous vous en informerons ainsi que la CNDP.",
    ],
  },
];

function Privacy() {
  return (
    <Layout>
      <PageHero image={heroImg} crumb="Confidentialité" title="Politique de confidentialité">
        Nous respectons votre vie privée. Dernière mise à jour : septembre 2026.
      </PageHero>

      <div className="container-x py-14 md:py-20 flex justify-center">
        <div className="max-w-3xl">
          <div className="flex items-start gap-4 rounded-2xl bg-mint p-5 sm:p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper text-brand">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-ink sm:text-base">
              En résumé : nous ne collectons que ce qui sert à vous répondre, vous livrer et
              améliorer le site - avec votre accord pour la mesure d'audience - et jamais rien n'est
              vendu.
            </p>
          </div>

          {SECTIONS.map((s) => (
            <section key={s.title} className="mt-10">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-ink sm:text-2xl">
                {s.title}
              </h2>
              <div className="mt-3 space-y-3">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-ink-soft sm:text-base">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <p className="mt-12 text-sm text-ink-soft">
            Une question sur vos données ?{" "}
            <Link
              to="/contact"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              Contactez-nous
            </Link>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
}

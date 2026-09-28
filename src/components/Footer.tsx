import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/icon-blue.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-paper text-ink">
      <div className="container-x grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:gap-12">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14">
              <img
                src={logo}
                alt="Souss Droguerie, droguerie à Agadir"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
            Votre partenaire de confiance en matériaux de construction dans la région du Souss
            depuis 1992.
          </p>
        </div>

        <div className="min-w-0">
          <h4 className="font-display text-base font-bold uppercase tracking-wider text-ink">
            Boutique
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li>
              <Link to="/categories" className="transition hover:text-brand">
                Tous les produits
              </Link>
            </li>
            <li>
              <Link to="/catalogue" className="transition hover:text-brand">
                Catalogue
              </Link>
            </li>
            <li>
              <Link to="/categories" className="transition hover:text-brand">
                Carrelage & Marbre
              </Link>
            </li>
            <li>
              <Link to="/categories" className="transition hover:text-brand">
                Peinture
              </Link>
            </li>
            <li>
              <Link to="/categories" className="transition hover:text-brand">
                Électricité & Plomberie
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="font-display text-base font-bold uppercase tracking-wider text-ink">
            Entreprise
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-ink-soft">
            <li>
              <Link to="/" className="transition hover:text-brand">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/a-propos" className="transition hover:text-brand">
                À propos
              </Link>
            </li>
            <li>
              <Link to="/commande-rapide" className="transition hover:text-brand">
                Commande rapide
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-brand">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="transition hover:text-brand">
                Devis
              </Link>
            </li>
            <li>
              <Link to="/politique-confidentialite" className="transition hover:text-brand">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link to="/security" className="transition hover:text-brand">
                Sécurité
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="font-display text-base font-bold uppercase tracking-wider text-ink">
            Contact
          </h4>
          <ul className="mt-5 space-y-3.5 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{" "}
              <a
                href="https://maps.app.goo.gl/q54qmxeEv752bJMTA"
                className="min-w-0 break-words transition hover:text-brand"
              >
                Bd Mohamed V, Q.I. Tassila III, N°29, Dcheira, Agadir 80360, Maroc
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{" "}
              <a href="tel:+212528838992" className="min-w-0 break-words transition hover:text-brand">
                +212 528 838 992
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{" "}
              <a
                href="mailto:contact@soussdroguerie.com"
                className="min-w-0 break-words transition hover:text-brand"
              >
                contact@soussdroguerie.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-ink">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-4 text-xs text-paper/80 sm:flex-row">
          <span>© {new Date().getFullYear()} Souss Droguerie SARL. Tous droits réservés.</span>
          <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link to="/politique-confidentialite" className="transition hover:text-paper">
              Confidentialité
            </Link>
            <Link to="/security" className="transition hover:text-paper">
              Sécurité
            </Link>
            <span>
              Créé par{" "}
              <a href="https://eiden-group.com" className="transition hover:text-paper">
                • EIDEN GROUP
              </a>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

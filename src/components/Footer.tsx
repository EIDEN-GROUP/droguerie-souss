import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/icon-white.png";
import { BUSINESS } from "@/lib/contact";
import { categories } from "@/lib/products";

const heading = "font-sans text-sm font-bold tracking-normal text-paper";
const link = "transition hover:text-paper";

/** Ligne de la colonne « Besoin d'aide ? » : pictogramme cale sur la premiere ligne. */
function HelpItem({ icon: Icon, children }: { icon: typeof Phone; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-paper" strokeWidth={1.75} />
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

/**
 * Pied de page sombre : marque, rayons, liens d'information et coordonnees, puis une barre
 * de mentions. Coordonnees et horaires viennent des memes sources que la page Contact
 * (`BUSINESS`, horaires avec coupure meridienne) : Google sanctionne les divergences.
 */
export function Footer() {
  return (
    <footer className="bg-brand-night text-paper">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 md:py-16 lg:grid-cols-[1.3fr_1fr_1fr_1.25fr] lg:gap-12">
        <div className="min-w-0">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src={logo}
              alt="Souss Droguerie, droguerie à Agadir"
              className="h-20 w-20 object-contain"
            />
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-paper/70">
            Votre partenaire de confiance pour tous vos projets de construction et
            d'aménagement dans la région du Souss.
          </p>
        </div>

        <div className="min-w-0">
          <h4 className={heading}>Nos catégories</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-paper/70">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/categories" search={{ cat: c.category }} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className={heading}>Informations</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-paper/70">
            <li>
              <Link to="/a-propos" className={link}>
                À propos de nous
              </Link>
            </li>
            <li>
              <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer" className={link}>
                Notre magasin
              </a>
            </li>
            <li>
              <Link to="/catalogue" className={link}>
                Catalogue produits
              </Link>
            </li>
            <li>
              <Link to="/commande-rapide" className={link}>
                Commande rapide
              </Link>
            </li>
            <li>
              <Link to="/contact" hash="faq" className={link}>
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className={link}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/politique-confidentialite" className={link}>
                Politique de confidentialité
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className={heading}>Besoin d'aide ?</h4>
          <ul className="mt-5 space-y-3.5 text-sm text-paper/70">
            <HelpItem icon={Phone}>
              <a href={BUSINESS.phoneHref} className={link}>
                {BUSINESS.phoneDisplay}
              </a>
            </HelpItem>
            <HelpItem icon={Mail}>
              <a href={`mailto:${BUSINESS.email}`} className={link}>
                {BUSINESS.email}
              </a>
            </HelpItem>
            <HelpItem icon={MapPin}>
              <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener noreferrer" className={link}>
                {BUSINESS.address}
              </a>
            </HelpItem>
            <HelpItem icon={Clock}>
              Lun - Ven : 8h30 - 12h30, 14h30 - 18h30
              <br />
              Sam : 8h30 - 12h30, 14h30 - 17h00
            </HelpItem>
          </ul>
        </div>
      </div>

      <div className="container-x">
        <div className="flex flex-col items-center gap-3 border-t border-paper/10 py-6 text-center text-xs text-paper/60 md:flex-row md:justify-between md:text-left">
          <span>
            © {new Date().getFullYear()} {BUSINESS.shortName}. Tous droits réservés.
          </span>
          <span className="flex items-center gap-3">
            <Link to="/politique-confidentialite" className={link}>
              Confidentialité
            </Link>
            <span aria-hidden="true">|</span>
            <Link to="/security" className={link}>
              Sécurité
            </Link>
          </span>
          <span>
            Créé par{" "}
            <a href="https://eiden-group.com" className={link}>
              EIDEN GROUP
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-secondary text-paper">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16">
              <img src="/src/assets/logo.png" alt="Droguerie Souss Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">DROGUERIE SOUSS</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-paper/60">
                S.A.R.L
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-paper/70">
            Votre partenaire de confiance en matériaux de construction dans la région
            du Souss depuis plus de 20 ans.
          </p>
          <div className="mt-4 flex gap-2">
            <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-paper/10 hover:bg-brand"><Facebook className="h-4 w-4" /></a>
            <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-paper/10 hover:bg-brand"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-sky">Boutique</h4>
          <ul className="mt-4 space-y-2 text-sm text-paper/70">
            <li><Link to="/shop" className="hover:text-sky">Tous les produits</Link></li>
            <li><Link to="/shop" className="hover:text-sky">Carrelage & Marbre</Link></li>
            <li><Link to="/shop" className="hover:text-sky">Peinture</Link></li>
            <li><Link to="/shop" className="hover:text-sky">Électricité & Plomberie</Link></li>
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-sky">Entreprise</h4>
          <ul className="mt-4 space-y-2 text-sm text-paper/70">
            <li><Link to="/" className="hover:text-sky">Accueil</Link></li>
            <li><Link to="/contact" className="hover:text-sky">Contact</Link></li>
            <li><Link to="/checkout" className="hover:text-sky">Devis</Link></li>
          </ul>
        </div>

        <div className="min-w-0">
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-sky">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-paper/70">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> <span className="min-w-0 break-words">Zone industrielle, Agadir, Maroc</span></li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> <span className="min-w-0 break-words">+212 528 000 000</span></li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> <span className="min-w-0 break-words">contact@drogueriesouss.ma</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-paper/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Droguerie Souss S.A.R.L. Tous droits réservés.</span>
          <span>Matériaux de construction • Devis gratuit</span>
        </div>
      </div>
    </footer>
  );
}

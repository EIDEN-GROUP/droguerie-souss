import { useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, type LucideIcon } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Les pages qui feuillettent un catalogue : la fleche « page suivante » y longe le bord
 *  droit de l'ecran, la ou se tiennent les onglets sur mobile. */
const FLIPBOOK = /^\/catalogue\/.+/;

/**
 * Favoris et panier, en onglets colles au bord droit de l'ecran, toujours a portee quel que
 * soit le defilement. Au repos, seul le pictogramme (et son compteur) depasse ; au survol ou
 * au clavier, l'onglet se deplie vers la gauche et montre son nom. Un clic ouvre le volet
 * correspondant, comme le faisaient les icones de l'en-tete.
 */
export function SideActions() {
  const { cart, favorites, setCartOpen, setFavOpen } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div
      className={cn(
        // Sous l'en-tete (z-40) : son panneau de recherche passe par-dessus les onglets.
        "pointer-events-none fixed right-0 top-[42%] z-30 flex -translate-y-1/2 flex-col items-end gap-2",
        FLIPBOOK.test(pathname) && "max-sm:hidden",
      )}
    >
      <Tab
        icon={Heart}
        label="Favoris"
        count={favorites.length}
        onClick={() => setFavOpen(true)}
        className="bg-paper text-ink ring-1 ring-ink/10 hover:text-accent-red focus-visible:text-accent-red"
        badge="bg-accent-red text-paper ring-paper"
      />
      <Tab
        icon={ShoppingBag}
        label="Mon panier"
        count={cartCount}
        delay={0.08}
        onClick={() => setCartOpen(true)}
        className="bg-accent-red text-paper hover:bg-brand-night focus-visible:bg-brand-night"
        badge="bg-paper text-accent-red ring-accent-red group-hover:ring-brand-night"
      />
    </div>
  );
}

function Tab({
  icon: Icon,
  label,
  count,
  delay = 0,
  onClick,
  className,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  delay?: number;
  onClick: () => void;
  className: string;
  /** Couleurs du compteur, selon le fond de l'onglet. */
  badge: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `${label} (${count})` : label}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 + delay, ease: EASE }}
      className={cn(
        "group pointer-events-auto flex h-11 cursor-pointer items-center rounded-l-full pl-3.5 pr-3 shadow-[var(--shadow-elevated)] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:h-12 sm:pl-4 sm:pr-3.5",
        className,
      )}
    >
      {/* Le nom precede le pictogramme : l'onglet etant cale a droite, il grandit vers la
          gauche. Sans survol possible (ecran tactile), il reste replie. */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold uppercase tracking-wider opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-visible:mr-3 group-focus-visible:max-w-[9rem] group-focus-visible:opacity-100 can-hover:group-hover:mr-3 can-hover:group-hover:max-w-[9rem] can-hover:group-hover:opacity-100 motion-reduce:transition-none">
        {label}
      </span>
      <span className="relative grid h-6 w-6 place-items-center">
        <Icon className="h-5 w-5" />
        {count > 0 && (
          // Remonte a chaque changement : le compteur rebondit quand on ajoute un produit.
          <motion.span
            key={count}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className={cn(
              "absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums ring-2 transition-shadow duration-300",
              badge,
            )}
          >
            {count}
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}

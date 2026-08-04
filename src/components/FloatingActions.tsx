import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "212528000000";
const PREFILLED_MESSAGE =
  "Bonjour, je souhaite avoir plus d'informations sur vos produits.";

const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`;

/** Une fois écartée, la bulle ne revient plus de la session : elle attire l'attention,
 *  elle ne harcèle pas. */
const TEASER_KEY = "ds-devis-teaser";
const TEASER_DELAY = 3500;
const TYPING_DURATION = 1200;
const LEAVE_DURATION = 220;

/** Official WhatsApp glyph. lucide-react dropped brand icons, so it is inlined. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.9 11.9 0 0 0 5.71 1.454h.005c6.585 0 11.946-5.36 11.949-11.945a11.9 11.9 0 0 0-3.45-8.406" />
    </svg>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Écrit un message">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-soft"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/** Bulle de chat qui pousse vers la commande rapide, ancrée au-dessus des deux boutons.
 *  La sortie est pilotée par `leaving` plutôt que par AnimatePresence : sous
 *  `prefers-reduced-motion`, celui-ci joue le fondu sans jamais démonter le nœud, qui
 *  continue alors d'occuper la place et d'intercepter les clics. */
function Teaser({ leaving, onClose }: { leaving: boolean; onClose: () => void }) {
  const [typing, setTyping] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setTyping(false);
      return;
    }
    const t = setTimeout(() => setTyping(false), TYPING_DURATION);
    return () => clearTimeout(t);
  }, [reduce]);

  const shown = reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 };

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
      animate={leaving ? hidden : shown}
      transition={
        leaving
          ? { duration: LEAVE_DURATION / 1000, ease: "easeOut" }
          : { type: "spring", damping: 22, stiffness: 300 }
      }
      // L'origine en bas à droite fait éclore la bulle depuis le bouton qui la porte.
      style={{ transformOrigin: "bottom right" }}
      className={`relative w-[16rem] max-w-[calc(100vw-2.5rem)] rounded-2xl rounded-br-sm bg-paper p-4 shadow-[var(--shadow-elevated)] ring-1 ring-ink/5 sm:w-[18rem] ${
        leaving ? "pointer-events-none" : "pointer-events-auto"
      }`}
      role="status"
      aria-live="polite"
    >
      <button
        onClick={onClose}
        aria-label="Fermer le message"
        className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-paper shadow-md transition hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
          <ShoppingBag className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-bold uppercase tracking-wider text-ink">
            Souss Droguerie
          </p>
          {typing ? (
            <TypingDots />
          ) : (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mt-1 text-sm leading-snug text-ink-soft">
                Un chantier en vue ? Décrivez-le en 2 minutes, on vous chiffre tout
                sous 24h.
              </p>
              <Link
                to="/commande-rapide"
                onClick={onClose}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-red px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90"
              >
                <Zap className="h-3 w-3" /> Commande rapide
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingActions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [teaser, setTeaser] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const onQuickOrder = pathname === "/commande-rapide";

  useEffect(() => {
    /* Inutile de vanter la commande rapide à quelqu'un qui y est déjà. */
    if (onQuickOrder) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(TEASER_KEY)) return;
    const t = setTimeout(() => setTeaser(true), TEASER_DELAY);
    return () => clearTimeout(t);
  }, [onQuickOrder]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setTeaser(false);
      setLeaving(false);
    }, LEAVE_DURATION);
    return () => clearTimeout(t);
  }, [leaving]);

  const closeTeaser = () => {
    setLeaving(true);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      /* navigation privée : la bulle réapparaîtra, sans plus de conséquence */
    }
  };

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      {teaser && !onQuickOrder && <Teaser leaving={leaving} onClose={closeTeaser} />}

      {!onQuickOrder && (
        <Link
          to="/commande-rapide"
          onClick={closeTeaser}
          aria-label="Demander un devis   commande rapide"
          // Pas de gap ici : il s'appliquerait aussi label replié et décentrerait la pastille.
          className="group pointer-events-auto relative flex items-center rounded-full bg-brand p-4 text-brand-foreground shadow-lg shadow-brand/30 outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-4 focus-visible:ring-brand/50 active:scale-95"
        >
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-brand opacity-20 [animation-duration:2.5s] motion-reduce:hidden" />
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-accent-red ring-2 ring-paper" />
          <ShoppingBag className="relative h-6 w-6 shrink-0" />
          <span className="relative hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold uppercase tracking-wider opacity-0 transition-all duration-300 group-hover:ml-3 group-hover:max-w-[12rem] group-hover:opacity-100 md:inline">
            Commande rapide
          </span>
        </Link>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous contacter sur WhatsApp"
        className="group pointer-events-auto relative flex items-center rounded-full bg-[#25D366] p-4 text-white shadow-lg shadow-[#25D366]/30 outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#25D366]/50 active:scale-95"
      >
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.5s] motion-reduce:hidden" />
        <WhatsAppIcon className="relative h-6 w-6 shrink-0" />
        <span className="relative hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold uppercase tracking-wider opacity-0 transition-all duration-300 group-hover:ml-3 group-hover:max-w-[12rem] group-hover:opacity-100 md:inline">
          Discuter sur WhatsApp
        </span>
      </a>
    </div>
  );
}

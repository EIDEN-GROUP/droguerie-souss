import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { GA_MEASUREMENT_ID, getConsent, setConsent } from "@/lib/analytics";

/**
 * Bandeau « Nous respectons votre vie privée » : mesure d'audience
 * (Google Analytics, Microsoft) uniquement sur acceptation explicite.
 * Sans ID GA configuré, rien n'est mesuré : le bandeau reste masqué.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (getConsent() === null) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!GA_MEASUREMENT_ID || !visible) return null;

  const choose = (choice: "granted" | "denied") => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentement à la mesure d'audience"
      className="fixed inset-x-3 bottom-3 z-[100] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md"
    >
      <div className="rounded-2xl border border-border bg-paper p-5 shadow-[var(--shadow-elevated)]">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-brand">
            <Cookie className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-ink">
              Nous respectons votre vie privée
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft sm:text-sm">
              Nous mesurons la fréquentation du site (Google Analytics, Microsoft) uniquement si
              vous acceptez. Sans acceptation, aucune donnée d'audience n'est collectée.{" "}
              <Link
                to="/politique-confidentialite"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                En savoir plus
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => choose("granted")}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-foreground transition hover:bg-brand-dark"
          >
            Accepter
          </button>
          <button
            onClick={() => choose("denied")}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-border bg-paper px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-cream"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}

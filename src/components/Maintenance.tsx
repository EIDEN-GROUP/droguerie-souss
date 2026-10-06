import { useEffect, useState, type ReactNode } from "react";
import { Mail, Phone, Wrench } from "lucide-react";
import iconBlue from "@/assets/icon-blue.png";
import { BUSINESS } from "@/lib/contact";
import { getMaintenanceStatus } from "../lib/api/maintenance";

/**
 * MODE MAINTENANCE - page « Site en maintenance » plein écran (français),
 * affichée sur TOUTES les pages quand l'interrupteur ENV est actif.
 *
 * INTERRUPTEUR ENV : actif si `VITE_MAINTENANCE_MODE=true` (ou
 * `MAINTENANCE_MODE=true` côté serveur). Sans cette variable (ou à `false`),
 * ce composant rend directement `children` - le site est ouvert.
 *
 * Le statut serveur fait foi : relecture au montage pour suivre un toggle
 * sans rebuild. Tant que la maintenance est active, aucun autre contenu
 * n'est rendu (ni côté serveur via le beforeLoad racine, ni côté client).
 *
 * ── POUR RETIRER DÉFINITIVEMENT LE MODE ─────────────────────────────
 * 1. src/routes/__root.tsx : retirer l'import de Maintenance, l'import de
 *    getMaintenanceStatus, le bloc beforeLoad « MAINTENANCE » et les balises
 *    <Maintenance> (tout est balisé par des commentaires MAINTENANCE).
 * 2. Supprimer ce fichier ainsi que src/lib/api/maintenance.ts.
 * ──────────────────────────────────────────────────────────────────────
 */

/** Lecture sûre de l'interrupteur côté client (défaut : désactivé = ouvert). */
function isMaintenanceEnabledOnClient(): boolean {
  try {
    const env = (import.meta as unknown as { env?: Record<string, unknown> }).env;
    const raw = env?.VITE_MAINTENANCE_MODE;
    return (
      String(raw ?? "")
        .trim()
        .toLowerCase() === "true"
    );
  } catch {
    return false;
  }
}

function MaintenancePage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-5 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-paper p-8 text-center shadow-[var(--shadow-elevated)] sm:p-12">
        <img
          src={iconBlue}
          alt="Souss Droguerie"
          className="mx-auto h-14 w-14 object-contain"
        />
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-red/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-accent-red">
          <Wrench className="h-3.5 w-3.5" />
          Maintenance en cours
        </p>
        <h1 className="mt-5 font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">
          Notre site fait
          <br />
          peau neuve
        </h1>
        <span className="mx-auto mt-5 block h-[3px] w-12 rounded-full bg-accent-red" />
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
          Nous effectuons actuellement des travaux d'amélioration pour mieux vous servir. Merci de
          votre patience — nous serons de retour très vite.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-red px-6 py-3 text-sm font-bold text-paper transition hover:bg-accent-red/90"
          >
            <Phone className="h-4 w-4" />
            {BUSINESS.phoneDisplay}
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink px-6 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-paper"
          >
            <Mail className="h-4 w-4" />
            Nous écrire
          </a>
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          {BUSINESS.shortName} · Agadir, Maroc
        </p>
      </div>
    </div>
  );
}

export function Maintenance({
  initiallyActive,
  children,
}: {
  initiallyActive: boolean;
  children: ReactNode;
}) {
  const [active, setActive] = useState(initiallyActive);
  const flagOn = isMaintenanceEnabledOnClient();

  useEffect(() => {
    let cancelled = false;
    // Le statut serveur fait foi (toggle runtime sans rebuild).
    void getMaintenanceStatus()
      .then((s) => {
        if (!cancelled) setActive(s.active);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!flagOn && !active) {
    return <>{children}</>;
  }
  return <MaintenancePage />;
}

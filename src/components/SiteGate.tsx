import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { verifyGateCredentials } from "../lib/api/site-gate";

/**
 * SITE-GATE - écran blanc + boîtes de dialogue natives demandant un nom
 * d'utilisateur et un mot de passe tant que le serveur n'a pas validé les
 * identifiants. Tant que le site est verrouillé, aucun contenu n'est rendu
 * (ni côté serveur, ni côté client).
 *
 * INTERRUPTEUR ENV : le verrou n'est actif que si `VITE_SITE_GATE_ENABLED=true`.
 * Sans cette variable (ou à `false`), ce composant rend directement `children`
 * sans aucun prompt - le site est public et crawlable. Mettez `=true` pour
 * reverrouiller (chantier / pré-lancement).
 *
 * Les identifiants sont vérifiés SUR LE SERVEUR contre Supabase (table
 * `site_gate_users`, migration 018_site_gate.sql) et la session est un cookie
 * httpOnly signé - voir src/lib/api/site-gate.ts.
 *
 * ── POUR RETIRER DÉFINITIVEMENT LE VERROU ─────────────────────────────
 * 1. src/routes/__root.tsx : retirer l'import de SiteGate, l'import de
 *    getGateStatus, le bloc beforeLoad « SITE-GATE » et les balises
 *    <SiteGate> (tout est balisé par des commentaires SITE-GATE).
 * 2. Supprimer ce fichier ainsi que src/lib/api/site-gate.ts.
 * 3. (Optionnel) DROP TABLE site_gate_users; dans Supabase.
 * ──────────────────────────────────────────────────────────────────────
 */

/** Lecture sûre de l'interrupteur côté client (défaut : désactivé = ouvert). */
function isGateEnabledOnClient(): boolean {
  try {
    const env = (import.meta as unknown as { env?: Record<string, unknown> }).env;
    const raw = env?.VITE_SITE_GATE_ENABLED;
    return (
      String(raw ?? "")
        .trim()
        .toLowerCase() === "true"
    );
  } catch {
    return false;
  }
}
export function SiteGate({
  initiallyUnlocked,
  children,
}: {
  initiallyUnlocked: boolean;
  children: ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);
  const router = useRouter();
  // Verrou désactivé par ENV → aucun prompt, contenu rendu immédiatement.
  const gateEnabled = isGateEnabledOnClient();

  useEffect(() => {
    if (unlocked || !gateEnabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const askCredentials = async () => {
      if (cancelled) return;

      const username = window.prompt("Nom d'utilisateur :");
      if (username === null) {
        // Boîte fermée sans valider : on redemande après un court délai
        // (le délai évite aussi le blocage des dialogues par le navigateur).
        timer = setTimeout(askCredentials, 600);
        return;
      }

      const password = window.prompt("Mot de passe :");
      if (password === null) {
        timer = setTimeout(askCredentials, 600);
        return;
      }

      try {
        // Vérification SERVEUR : bcrypt contre la table site_gate_users.
        await verifyGateCredentials({ data: { username, password } });
        if (!cancelled) {
          setUnlocked(true);
          // Refait passer le beforeLoad racine : tout le contenu se charge.
          void router.invalidate();
        }
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Identifiants incorrects.");
        timer = setTimeout(askCredentials, 600);
      }
    };

    timer = setTimeout(askCredentials, 50);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [unlocked, gateEnabled, router]);

  if (!gateEnabled || unlocked) {
    return <>{children}</>;
  }

  // Écran blanc : rien d'autre n'est rendu ni exécuté.
  return <div className="fixed inset-0 z-[2147483647] bg-white" aria-hidden="true" />;
}

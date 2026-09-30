import { toast } from "sonner";

/** Repli quand le presse-papiers async est bloqué (contexte non sécurisé…). */
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Partage du lien de la liseuse : feuille native quand elle répond, sinon
 * copie presse-papiers avec confirmation visible. La feuille native peut
 * rester pendante (pas de rejet) dans certains contextes : on la borne avec
 * un délai pour toujours retomber sur la copie.
 */
export async function shareLink(title: string): Promise<void> {
  const url = window.location.href;
  if (navigator.share) {
    try {
      const shared = await Promise.race([
        navigator.share({ title, url }).then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 4000)),
      ]);
      if (shared) return;
    } catch {
      /* repli presse-papiers ci-dessous */
    }
  }
  let ok = false;
  try {
    await navigator.clipboard.writeText(url);
    ok = true;
  } catch {
    ok = legacyCopy(url);
  }
  if (ok) toast.success("Lien copié dans le presse-papiers");
  else toast.error("Copie impossible");
}

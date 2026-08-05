// @lovable.dev/vite-tanstack-config already includes the following   do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/**
 * En dev, @tanstack/devtools-vite tatoue chaque élément JSX d'un attribut
 * `data-tsd-source="fichier:ligne:colonne"` (le bouton « ouvrir dans
 * l'éditeur » des devtools). Le HTML servi par le SSR et le bundle client sont
 * transformés à des moments différents : si le fichier change entre les deux,
 * les numéros de ligne divergent et React signale une fausse erreur
 * d'hydratation à chaque rechargement. L'attribut ne sert qu'aux devtools, on
 * le retire donc des deux côtés en dev pour que serveur et client concordent
 * toujours. Sans effet en production (l'attribut n'y existe pas).
 */
function stripTsdSource(): Plugin {
  return {
    name: "strip-tsd-source",
    enforce: "post",
    apply(config) {
      return config.mode === "development";
    },
    transform(code, id) {
      if (id.includes("node_modules") || !code.includes("data-tsd-source")) return;
      return code.replace(/\s+data-tsd-source="[^"]*"/g, "");
    },
  };
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Vercel deployment preset
  nitro: {
    preset: "vercel",
  },
  vite: {
    plugins: [stripTsdSource()],
    optimizeDeps: {
      // Ces deux paquets ne sont appelés qu'en import dynamique, au clic sur
      // « Télécharger le PDF ». Vite ne les découvre donc pas au démarrage et
      // sert des modules vides. On les pré-bundle explicitement.
      include: ["html-to-image", "jspdf"],
    },
  },
});

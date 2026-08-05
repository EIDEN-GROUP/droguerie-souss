// @lovable.dev/vite-tanstack-config already includes the following   do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Vercel deployment preset
  nitro: {
    preset: "vercel",
  },
  vite: {
    optimizeDeps: {
      // Ces deux paquets ne sont appelés qu'en import dynamique, au clic sur
      // « Télécharger le PDF ». Vite ne les découvre donc pas au démarrage et
      // sert des modules vides. On les pré-bundle explicitement.
      include: ["html-to-image", "jspdf"],
    },
  },
});

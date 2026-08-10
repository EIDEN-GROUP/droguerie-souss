import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";
import { gaHeadScripts, trackPageview } from "../lib/analytics";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-brand">404</h1>
        <h2 className="mt-4 font-display text-xl font-bold uppercase text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition hover:bg-brand-dark"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-bold uppercase text-foreground">
          Erreur de chargement
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur s'est produite. Essayez de rafraîchir la page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="rounded-full border border-input bg-background px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Vérification Google Search Console (métadonnée HTML). Rend le propriété
      // de préfixe d'URL vérifiable sans toucher au DNS.
      {
        name: "google-site-verification",
        content: "Z0qIkPxx8LMIeJkz0aVC6VxH8_SmG36Tf72Ge3T3yk0",
      },
      { title: "Souss Droguerie SARL | Matériaux de construction à Agadir" },
      {
        name: "description",
        content:
          "Souss Droguerie (Droguerie Souss) : votre droguerie et fournisseur de matériaux de construction à Agadir. Carrelage, marbre, peinture, ciment, zellige, plomberie, électricité et quincaillerie.",
      },
      { name: "author", content: "Souss Droguerie SARL" },
      { property: "og:title", content: "Souss Droguerie SARL | Matériaux de construction à Agadir" },
      {
        property: "og:description",
        content:
          "Souss Droguerie : votre droguerie et fournisseur de matériaux de construction à Agadir. Carrelage, marbre, peinture, ciment, plomberie, électricité et quincaillerie.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:site_name", content: "Souss Droguerie" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Souss Droguerie SARL | Matériaux de construction à Agadir" },
      { name: "twitter:description", content: "Souss Droguerie : votre droguerie et fournisseur de matériaux de construction à Agadir." },
    ],
    // Google Analytics 4 : rien n'est injecté tant que VITE_GA_MEASUREMENT_ID
    // n'est pas renseigné (voir .env.example).
    scripts: gaHeadScripts(),
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <PageviewTracker />
      <Outlet />
    </QueryClientProvider>
  );
}

/** Envoie un pageview GA4 à chaque navigation (SPA). Sans effet sans ID configuré. */
function PageviewTracker() {
  const href = useRouterState({ select: (s) => s.location.href });
  useEffect(() => {
    trackPageview(href);
  }, [href]);
  return null;
}

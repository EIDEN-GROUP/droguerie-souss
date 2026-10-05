import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // L'accueil s'ouvre sur son intro video, jouee en haut de page : tant qu'elle tient la
    // page (`ScrollLock top`), la position de defilement n'est pas retablie (rechargement).
    // Sur le serveur, c'est le script qui la retablit avant le demarrage de React qui n'y
    // est pas joint.
    scrollRestoration: ({ location }) =>
      typeof window === "undefined"
        ? location.pathname !== "/"
        : !document.querySelector('[data-scroll-lock="top"]'),
    defaultPreloadStaleTime: 0,
  });

  return router;
};

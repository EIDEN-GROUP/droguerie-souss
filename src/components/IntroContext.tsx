import { createContext, useContext } from "react";

/**
 * Intro video de l'accueil : la video du hero sert d'ecran de chargement, puis l'en-tete,
 * le texte du hero et le reste de la page apparaissent.
 *
 * - `active` : la page joue l'intro (seul l'accueil) ;
 * - `done`   : l'intro est terminee, tout peut s'afficher ;
 * - `finish` : appele par le hero quand la video est prete.
 *
 * Hors intro, `done` vaut `true` d'emblee : les composants se comportent normalement.
 */
export const IntroContext = createContext<{ active: boolean; done: boolean; finish: () => void }>({
  active: false,
  done: true,
  finish: () => {},
});

export const useIntro = () => useContext(IntroContext);

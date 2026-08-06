import { forwardRef, type ReactNode } from "react";
import logoWhite from "@/assets/icon-white.png";
import logoBlue from "@/assets/icon-blue.png";

/**
 * StPageFlip récupère chaque page via un ref posé sur l'élément racine : les composants
 * de page doivent donc impérativement passer par `forwardRef`, sinon le livre ne
 * s'initialise jamais (la liste des pages reste vide).
 */
export const BookPage = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; hard?: boolean }
>(({ children, className = "", hard = false }, ref) => (
  <div
    ref={ref}
    /** En mode HTML, StPageFlip ne lit la rigidité que sur `data-density` : c'est ce qui
     *  donne aux couvertures leur comportement de carton (et non l'option `showCover`). */
    data-density={hard ? "hard" : "soft"}
    className={`h-full w-full overflow-hidden bg-paper ${className}`}
  >
    {children}
  </div>
));
BookPage.displayName = "BookPage";

export const ImagePage = forwardRef<
  HTMLDivElement,
  { src: string; page: number; total: number; title: string }
>(({ src, page, total, title }, ref) => (
  <BookPage ref={ref} hard={page === 1 || page === total}>
    <img
      src={src}
      alt={`${title} — page ${page} sur ${total}`}
      loading={page <= 2 ? "eager" : "lazy"}
      /** Le drag natif de l'image entrerait en conflit avec le geste de tourne-page. */
      draggable={false}
      className="h-full w-full select-none object-contain"
    />
  </BookPage>
));
ImagePage.displayName = "ImagePage";

export const CoverPage = forwardRef<HTMLDivElement, { variant: "front" | "back"; title: string }>(
  ({ variant, title }, ref) => (
    <BookPage ref={ref} hard className="bg-brand-secondary text-paper">
      {variant === "front" ? (
        <div className="flex h-full w-full flex-col justify-between p-[8%]">
          <div className="h-16 w-16 sm:h-20 sm:w-20">
            <img src={logoWhite} alt="Souss Droguerie" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sky">
              Nos collections
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-[0.95] sm:text-4xl">
              {title}
            </h2>
            <span className="mt-4 block h-1 w-16 rounded-full bg-accent-red" />
            <p className="mt-4 text-xs leading-relaxed text-paper/70 sm:text-sm">
              Matériaux de construction &amp; finitions — Souss Droguerie SARL.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
            Agadir · Maroc
          </p>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-[10%] text-center">
          <div className="h-14 w-14">
            <img src={logoWhite} alt="Souss Droguerie" className="h-full w-full object-contain" />
          </div>
          <span className="block h-1 w-12 rounded-full bg-accent-red" />
          <div className="space-y-1 text-xs text-paper/70 sm:text-sm">
            <p className="font-display text-base font-bold uppercase text-paper">
              Souss Droguerie SARL
            </p>
            <p>Zone industrielle, Agadir, Maroc</p>
            <p>+212 528 838 992</p>
            <p>contact@soussdroguerie.com</p>
          </div>
        </div>
      )}
    </BookPage>
  ),
);
CoverPage.displayName = "CoverPage";

/** Affichée tant qu'aucune image n'a été déposée dans le dossier de l'édition. */
export const PlaceholderPage = forwardRef<HTMLDivElement, { page: number; total: number }>(
  ({ page, total }, ref) => (
    <BookPage ref={ref} className="bg-cream">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-[10%] text-center">
        <div className="h-12 w-12 opacity-40">
          <img src={logoBlue} alt="" className="h-full w-full object-contain" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft">
          Page à venir
        </p>
        <span className="block h-px w-10 bg-accent-red/50" />
        <p className="max-w-[80%] text-xs leading-relaxed text-ink-soft">
          Les pages de cette édition seront ajoutées prochainement.
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-widest text-ink-soft/70">
          {String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>
    </BookPage>
  ),
);
PlaceholderPage.displayName = "PlaceholderPage";

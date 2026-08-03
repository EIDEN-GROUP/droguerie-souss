/**
 * Les éditions du catalogue présentées sur /catalogue.
 *
 * Deux formats coexistent :
 *  - `flipbook` : les pages sont des images déposées dans `src/assets/catalogue/<année>/`
 *    (nomenclature `page-01.jpg`, voir le README du dossier). Elles sont découvertes
 *    automatiquement ; tant qu'un dossier est vide, la visionneuse affiche des pages
 *    provisoires aux couleurs de la marque.
 *  - `pdf` : un fichier déposé dans `public/catalogue/`, ouvert dans un nouvel onglet.
 */

const pageModules = import.meta.glob("../assets/catalogue/*/page-*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const coverModules = import.meta.glob("../assets/catalogue/covers/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

/** Regroupe les images par dossier d'édition. La numérotation à deux chiffres est ce qui
 *  rend le tri alphabétique des chemins équivalent à l'ordre des pages. */
function pagesOf(slug: string): string[] {
  return Object.keys(pageModules)
    .filter((path) => path.includes(`/catalogue/${slug}/`))
    .sort()
    .map((path) => pageModules[path]);
}

/** Une couverture maison (`covers/2026.jpg`) remplace la couverture dessinée par défaut. */
function coverOf(slug: string): string | undefined {
  const key = Object.keys(coverModules).find((path) => path.includes(`/covers/${slug}.`));
  return key ? coverModules[key] : undefined;
}

export type CatalogueEdition = {
  slug: string;
  year: number;
  title: string;
  description: string;
  cover?: string;
  isNew?: boolean;
} & (
  | { format: "flipbook"; pages: string[]; pdf?: never }
  | { format: "pdf"; pages?: never; pdf: { url: string; size: string; pageCount: number } }
);

export const catalogueEditions: CatalogueEdition[] = [
  {
    slug: "2026",
    year: 2026,
    title: "Catalogue 2026",
    description:
      "L'édition complète : carrelage, marbre, zellige, sanitaire, peinture et second œuvre.",
    cover: coverOf("2026"),
    isNew: true,
    format: "pdf",
    pdf: {
      /** Fichier servi tel quel depuis `public/catalogue/`. */
      url: "/catalogue/catalogue-ssd-2026.pdf",
      size: "88,7 Mo",
      pageCount: 908,
    },
  },
  {
    slug: "2025",
    year: 2025,
    title: "Catalogue 2025",
    description: "L'édition précédente, à feuilleter en ligne.",
    cover: coverOf("2025"),
    format: "flipbook",
    pages: pagesOf("2025"),
  },
  {
    slug: "2024",
    year: 2024,
    title: "Catalogue 2024",
    description: "Nos collections 2024, archivées et consultables.",
    cover: coverOf("2024"),
    format: "flipbook",
    pages: pagesOf("2024"),
  },
];

export const findEdition = (slug: string) => catalogueEditions.find((e) => e.slug === slug);

/** Ratio A4 portrait : dimensions de référence d'une page, StPageFlip s'étire ensuite. */
export const PAGE_WIDTH = 550;
export const PAGE_HEIGHT = 778;
export const PAGE_RATIO = PAGE_HEIGHT / PAGE_WIDTH;

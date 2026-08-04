/**
 * Fabrique la couverture de chaque édition dans `src/assets/catalogue/covers/<slug>.webp`,
 * là où `src/lib/catalogue.ts` va la chercher.
 *
 *   npm install --no-save --no-package-lock pdf-to-img @napi-rs/canvas
 *   node scripts/catalogue-covers.mjs
 *
 * Deux sources possibles par édition :
 *  - `image` : un visuel de couverture fourni (le cas courant, les catalogues ont leur
 *    affiche en portrait) ;
 *  - `pdf`   : à défaut, la première page du fichier est rendue en image.
 *
 * Le script affiche aussi le nombre de pages et le poids du PDF : les deux métadonnées à
 * recopier dans `catalogueEditions`.
 *
 * `--no-save --no-package-lock` : ces deux paquets ne servent qu'ici et n'ont rien à
 * faire dans les dépendances du site.
 */
import { writeFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coversDir = path.join(root, "src/assets/catalogue/covers");

/** Une entrée par édition de `src/lib/catalogue.ts`. `image` l'emporte sur `pdf`. */
const editions = [
  {
    slug: "2026",
    image: "C:/Users/Basma/Downloads/CATALOGUE-SOUSS-DROGUERIE-2026.png",
    pdf: "public/catalogue/catalogue-ssd-2026.pdf",
  },
  {
    slug: "souss-droguerie-2026",
    image: "C:/Users/Basma/Downloads/CATALOGUE-DAOUD-BUILDING-2026.png",
    pdf: "public/catalogue/catalogue-souss-droguerie-2026.pdf",
  },
];

/** Largeur affichée sur la carte (~440 px) doublée pour les écrans à haute densité. */
const COVER_WIDTH = 880;

/** Rend la première page du PDF en PNG. Import différé : inutile de charger pdf.js
 *  quand toutes les éditions ont déjà leur visuel. */
async function firstPagePng(file) {
  const { pdf } = await import("pdf-to-img");
  const document = await pdf(file, { scale: 1 });
  return { png: await document.getPage(1), pageCount: document.length };
}

async function buildCover(edition) {
  const source = edition.image
    ? { data: path.resolve(root, edition.image), pageCount: null }
    : await firstPagePng(path.join(root, edition.pdf)).then((r) => ({
        data: r.png,
        pageCount: r.pageCount,
      }));

  const image = await loadImage(source.data);
  const height = Math.round((image.height / image.width) * COVER_WIDTH);
  const canvas = createCanvas(COVER_WIDTH, height);
  const context = canvas.getContext("2d");
  /** Une page PDF n'a pas de fond opaque : sans ce remplissage la couverture sort
   *  transparente. Sans effet sur un PNG déjà opaque. */
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, COVER_WIDTH, height);
  context.drawImage(image, 0, 0, COVER_WIDTH, height);

  const webp = await canvas.encode("webp", 82);
  await writeFile(path.join(coversDir, `${edition.slug}.webp`), webp);

  const { size } = await stat(path.join(root, edition.pdf));
  const round = (n) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  console.log(
    [
      edition.slug.padEnd(22),
      (source.pageCount ? `${source.pageCount} pages` : "").padEnd(12),
      `${round(size / 1_000_000)} Mo`.padEnd(10),
      `couverture ${COVER_WIDTH}x${height} (${round(webp.length / 1000)} ko)`,
      edition.image ? "[visuel fourni]" : "[page 1 du PDF]",
    ].join(" "),
  );
}

await mkdir(coversDir, { recursive: true });
for (const edition of editions) await buildCover(edition);

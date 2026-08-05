import { PAGE_H, PAGE_W } from "./pages";

/**
 * Export PDF du catalogue tel qu'il est affiché.
 *
 * Les pages sont du DOM, pas des images : on les rend hors écran à taille
 * réelle, on les photographie une à une, puis on les empile dans un PDF A4.
 *
 * Ce qui a été optimisé (le premier rendu pouvait prendre plusieurs minutes) :
 *  - `skipFonts: true` : les polices (Fraunces, Inter, IBM Plex Mono) sont
 *    déjà chargées par la page. Sans cette option, html-to-image reparsait
 *    toutes les feuilles de style et ré-encastrait les fichiers de police sur
 *    CHAQUE feuille — c'était le poste de dépense dominant.
 *  - JPEG au lieu de PNG : l'encodage est ~3× plus rapide et le PDF nettement
 *    plus léger, sans différence visible sur un contenu photographique.
 *  - captures par rafales (`CONCURRENCY`) plutôt qu'une à une : les phases
 *    asynchrones (décodage des images) se chevauchent au lieu de s'additionner.
 *  - les images et polices sont décodées d'avance : la première feuille ne
 *    part pas à froid.
 *
 * Les deux bibliothèques ne sont chargées qu'au clic — inutile d'alourdir la
 * liseuse pour une action occasionnelle.
 */
const CONCURRENCY = 3; // captures simultanées (3 × ~5,6 Mo de canvas)
const JPEG_QUALITY = 0.92;

export async function exportCataloguePdf(
  stage: HTMLElement,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  const sheets = Array.from(stage.querySelectorAll<HTMLElement>("[data-page]"));
  if (sheets.length === 0) throw new Error("Aucune page à exporter.");

  // La scène d'export est masquée : les images en loading="lazy" ne partiraient
  // jamais (hors du viewport). On force le chargement immédiat, puis on attend
  // le décodage avec une garde-fou pour ne jamais bloquer l'export.
  const imgs = Array.from(stage.querySelectorAll<HTMLImageElement>("img"));
  imgs.forEach((img) => {
    if (img.loading === "lazy") img.loading = "eager";
  });
  await Promise.all([
    document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
    ...imgs.map((img) =>
      Promise.race([
        img.decode().catch(() => {}),
        new Promise((r) => setTimeout(r, 1500)),
      ]),
    ),
  ]);

  // A4 portrait en millimètres ; les pages partagent déjà ce rapport.
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const capture = (sheet: HTMLElement) =>
    toCanvas(sheet, {
      width: PAGE_W,
      height: PAGE_H,
      pixelRatio: 2, // 1000 px de large à l'A4 (~120 dpi) : net à l'écran et en impression
      cacheBust: false,
      backgroundColor: "#ffffff",
      skipFonts: true, // les polices sont déjà dans la page, inutile de les ré-encastrer
    }).then((canvas) => canvas.toDataURL("image/jpeg", JPEG_QUALITY));

  let done = 0;
  for (let i = 0; i < sheets.length; i += CONCURRENCY) {
    const batch = sheets.slice(i, i + CONCURRENCY);
    const jpegs = await Promise.all(batch.map(capture));
    for (const jpeg of jpegs) {
      if (done > 0) pdf.addPage();
      pdf.addImage(jpeg, "JPEG", 0, 0, W, H, undefined, "FAST");
      done++;
      onProgress?.(done, sheets.length);
    }
    // On rend la main au navigateur entre chaque rafale : l'onglet respire
    // sans ralentir la production du fichier.
    await new Promise((r) => setTimeout(r, 0));
  }

  pdf.save("catalogue-souss-droguerie-2026.pdf");
}

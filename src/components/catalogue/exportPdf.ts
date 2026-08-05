import { PAGE_H, PAGE_W } from "./pages";

/**
 * Export PDF du catalogue tel qu'il est affiché.
 *
 * Les pages sont du DOM, pas des images : on les rend hors écran à taille
 * réelle, on les photographie une à une, puis on les empile dans un PDF A4.
 * Les deux bibliothèques ne sont chargées qu'au clic — inutile d'alourdir la
 * liseuse pour une action occasionnelle.
 */
export async function exportCataloguePdf(
  stage: HTMLElement,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);

  const sheets = Array.from(stage.querySelectorAll<HTMLElement>("[data-page]"));
  if (sheets.length === 0) throw new Error("Aucune page à exporter.");

  // A4 portrait en millimètres ; les pages partagent déjà ce rapport.
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < sheets.length; i++) {
    const png = await toPng(sheets[i], {
      width: PAGE_W,
      height: PAGE_H,
      pixelRatio: 2, // ~300 dpi une fois ramené au format A4
      cacheBust: false,
      backgroundColor: "#ffffff",
      skipFonts: false,
    });
    if (i > 0) pdf.addPage();
    pdf.addImage(png, "PNG", 0, 0, W, H, undefined, "FAST");
    onProgress?.(i + 1, sheets.length);
    // On rend la main au navigateur : sans cela l'onglet gèle sur 60 pages.
    await new Promise((r) => setTimeout(r, 0));
  }

  pdf.save("catalogue-souss-droguerie-2026.pdf");
}

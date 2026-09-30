import { DAOUD_H, DAOUD_W } from "./daoudPages";

/**
 * Export PDF du catalogue Daoud tel qu'affiché (A4 portrait, comme
 * l'« interactif » et le catalogue Dune).
 */
const CONCURRENCY = 3;
const JPEG_QUALITY = 0.92;

/** A4 : 210 × 297 mm. */
const W_MM = 210;
const H_MM = 297;

export async function exportDaoudCataloguePdf(
  stage: HTMLElement,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const [{ toCanvas }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);

  const sheets = Array.from(stage.querySelectorAll<HTMLElement>("[data-page]"));
  if (sheets.length === 0) throw new Error("Aucune page à exporter.");

  const imgs = Array.from(stage.querySelectorAll<HTMLImageElement>("img"));
  imgs.forEach((img) => {
    if (img.loading === "lazy") img.loading = "eager";
  });
  await Promise.all([
    document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
    ...imgs.map((img) =>
      Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 1500))]),
    ),
  ]);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [W_MM, H_MM],
  });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const capture = (sheet: HTMLElement) =>
    toCanvas(sheet, {
      width: DAOUD_W,
      height: DAOUD_H,
      pixelRatio: 2,
      cacheBust: false,
      backgroundColor: "#fffaf6",
      skipFonts: true,
    }).then((canvas) => canvas.toDataURL("image/jpeg", JPEG_QUALITY));

  let done = 0;
  for (let i = 0; i < sheets.length; i += CONCURRENCY) {
    const batch = sheets.slice(i, i + CONCURRENCY);
    const jpegs = await Promise.all(batch.map(capture));
    for (const jpeg of jpegs) {
      if (done > 0) pdf.addPage([W_MM, H_MM], "portrait");
      pdf.addImage(jpeg, "JPEG", 0, 0, W, H, undefined, "FAST");
      done++;
      onProgress?.(done, sheets.length);
    }
    await new Promise((r) => setTimeout(r, 0));
  }

  pdf.save("catalogue-daoud-building.pdf");
}

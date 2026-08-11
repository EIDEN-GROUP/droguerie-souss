/**
 * Génère les favicons « propres » du site (PNG 32/96/180 + vrai .ico multi-tailles)
 * et compresse les deux grosses photos de la page À propos.
 *
 *   node scripts/generate-icons.cjs
 *
 * Nécessite `ffmpeg` dans le PATH. Les fichiers générés sont commités dans le repo :
 * ce script est un utilitaire de dev, il n'est PAS appelé par le build (Vercel n'a
 * pas ffmpeg). Pourquoi des PNG en plus du .ico :
 *   - Google n'affiche une favicon que si le fichier fait 48px ou un multiple de 48px
 *     (48, 96, 144…). L'ancien favicon.ico était un PNG 1102×1102 renommé : Google le
 *     rejetait, d'où l'absence d'icône dans les résultats de recherche.
 *   - favicon-96x96.png (96 = multiple de 48) + <link rel="icon" type="image/png"
 *     sizes="96x96"> est la référence la plus fiable pour Google — elle est déclarée
 *     EN PREMIER dans <head> pour que Google ne retienne pas la 32×32 (qui échoue à
 *     la règle du multiple de 48).
 *   - favicon.ico (16/32/48 réels, entrées BITMAP classiques non compressées) couvre
 *     les navigateurs qui demandent l'ICO. Les entrées sont en BMP classique (et non
 *     en PNG compressé) : c'est le format le plus largement compatible — le même que
 *     celui de droguerie-ifriquia.ma, dont l'icône s'affiche dans Google.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const ASSETS = path.join(ROOT, "src", "assets");

/** Source carrée : l'icône bleue de la marque (1102×1102). */
const SOURCE = path.join(ASSETS, "icon-blue.png");

function ffmpeg(args, opts = {}) {
  return execFileSync("ffmpeg", args, { stdio: "inherit", ...opts });
}

/** Construit un .ico avec des entrées BITMAP classiques (non compressées), le format
 *  que tout le monde lit — Windows, navigateurs et le crawler de favicons de Google.
 *
 *  Structure par entrée : BITMAPINFOHEADER (40 o) + pixels BGRA bottom-up + masque
 *  AND 1bpp (zéros = opaque). Les pixels bruts viennent de ffmpeg en rawvideo
 *  top-down ; on inverse l'ordre des lignes pour l'ordre bottom-up du DIB. */
function buildClassicIco(sizes, out) {
  const images = sizes.map((s) => {
    const src = path.join(PUBLIC, `favicon-${s}.png`);
    const raw = execFileSync(
      "ffmpeg",
      ["-y", "-i", src, "-f", "rawvideo", "-pix_fmt", "bgra", "-"],
      { encoding: null, maxBuffer: 64 * 1024 * 1024 },
    );
    if (raw.length !== s * s * 4) {
      throw new Error(`pixels inattendus pour ${s}px : ${raw.length}`);
    }
    return { size: s, raw };
  });

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type: icône
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  const payloads = [];
  let offset = 6 + 16 * images.length;

  for (const { size, raw } of images) {
    const rowBytes = size * 4;
    // XOR : lignes inversées (top-down → bottom-up, l'ordre du DIB).
    const xor = Buffer.alloc(rowBytes * size);
    for (let y = 0; y < size; y++) {
      raw.copy(xor, y * rowBytes, (size - 1 - y) * rowBytes, (size - y) * rowBytes);
    }
    // Masque AND : 1 bpp, lignes arrondies à 32 bits. Zéros = opacité totale
    // (l'alpha du PNG porte déjà la transparence), l'ordre des lignes n'importe pas.
    const andRowBytes = Math.ceil(size / 32) * 4;
    const andMask = Buffer.alloc(andRowBytes * size);

    const dib = Buffer.alloc(40);
    dib.writeUInt32LE(40, 0); // biSize
    dib.writeInt32LE(size, 4); // biWidth
    dib.writeInt32LE(size * 2, 8); // biHeight (XOR + AND)
    dib.writeUInt16LE(1, 12); // biPlanes
    dib.writeUInt16LE(32, 14); // biBitCount
    dib.writeUInt32LE(0, 16); // biCompression = BI_RGB
    dib.writeUInt32LE(xor.length + andMask.length, 20); // biSizeImage
    // Octets 24→39 : résolutions et couleurs à zéro (déjà le cas).

    const entryData = Buffer.concat([dib, xor, andMask]);

    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // largeur (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // hauteur
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // réservé
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(entryData.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += entryData.length;

    entries.push(e);
    payloads.push(entryData);
  }

  fs.writeFileSync(out, Buffer.concat([header, ...entries, ...payloads]));
  console.log(`[icons] ${path.relative(ROOT, out)} (${sizes.join("/")}px, entrées BITMAP classiques)`);
}

function main() {
  // Les PNG livrés : 32×32 (navigateurs), 96×96 (multiple de 48, référence Google).
  const sizes = [32, 96];
  for (const s of sizes) {
    ffmpeg(["-y", "-i", SOURCE, "-vf", `scale=${s}:${s}`, path.join(PUBLIC, `favicon-${s}x${s}.png`)]);
    console.log(`[icons] favicon-${s}x${s}.png`);
  }

  // Le .ico embarque 16/32/48 (générés en temporaire puis supprimés).
  for (const s of [16, 32, 48]) {
    ffmpeg(["-y", "-i", SOURCE, "-vf", `scale=${s}:${s}`, path.join(PUBLIC, `favicon-${s}.png`)]);
  }
  buildClassicIco([16, 32, 48], path.join(PUBLIC, "favicon.ico"));
  for (const s of [16, 32, 48]) {
    fs.rmSync(path.join(PUBLIC, `favicon-${s}.png`));
  }

  // apple-touch-icon (iOS) : 180×180.
  ffmpeg(["-y", "-i", SOURCE, "-vf", "scale=180:180", path.join(PUBLIC, "apple-touch-icon.png")]);
  console.log("[icons] apple-touch-icon.png");

  // Les deux photos 1448×1086 (2,5 Mo chacune) de la page À propos → JPEG q80.
  // Les PNG sources ont été supprimés du repo après leur conversion : on ne
  // re-compresse que si le fichier source existe encore.
  for (const [src, out] of [
    ["1.png", "1.jpg"],
    ["22.png", "22.jpg"],
  ]) {
    const srcPath = path.join(ASSETS, src);
    if (!fs.existsSync(srcPath)) {
      console.log(`[icons] ${src} absent (déjà converti ?) — étape ignorée.`);
      continue;
    }
    ffmpeg([
      "-y", "-i", srcPath,
      "-vf", "scale=1280:-2",
      "-q:v", "4", // qualité JPEG ~80
      path.join(ASSETS, out),
    ]);
    const before = fs.statSync(srcPath).size;
    const after = fs.statSync(path.join(ASSETS, out)).size;
    console.log(`[icons] ${src} → ${out} (${(before / 1024 / 1024).toFixed(1)} Mo → ${(after / 1024).toFixed(0)} Ko)`);
  }

  console.log("[icons] Terminé.");
}

main();

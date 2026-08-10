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
 *     sizes="96x96"> est la référence la plus fiable pour Google.
 *   - favicon.ico (16/32/48 réels, entrées PNG compressées — valide sur Vista+ et
 *     tous les navigateurs modernes) couvre les navigateurs qui le demandent seuls.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const ASSETS = path.join(ROOT, "src", "assets");

/** Source carrée : l'icône bleue de la marque (1102×1102). */
const SOURCE = path.join(ASSETS, "icon-blue.png");

function ffmpeg(args) {
  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

/** Empaquette des PNG (déjà en mémoire) dans un vrai fichier .ico multi-tailles.
 *  Format ICO : header 6 octets + une entrée 16 octets par image + les PNG bruts. */
function buildIco(sizes, out) {
  const pngs = sizes.map((s) =>
    fs.readFileSync(path.join(PUBLIC, `favicon-${s}.png`)),
  );
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type: icône
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  let offset = 6 + 16 * pngs.length;
  pngs.forEach((png, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0); // largeur (0 = 256)
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1); // hauteur
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // réservé
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(e);
  });

  fs.writeFileSync(out, Buffer.concat([header, ...entries, ...pngs]));
  console.log(`[icons] ${path.relative(ROOT, out)} (${sizes.join("/")}px)`);
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
  buildIco([16, 32, 48], path.join(PUBLIC, "favicon.ico"));
  for (const s of [16, 32, 48]) {
    fs.rmSync(path.join(PUBLIC, `favicon-${s}.png`));
  }

  // apple-touch-icon (iOS) : 180×180.
  ffmpeg(["-y", "-i", SOURCE, "-vf", "scale=180:180", path.join(PUBLIC, "apple-touch-icon.png")]);
  console.log("[icons] apple-touch-icon.png");

  // Les deux photos 1448×1086 (2,5 Mo chacune) de la page À propos → JPEG q80.
  for (const [src, out] of [
    ["1.png", "1.jpg"],
    ["22.png", "22.jpg"],
  ]) {
    ffmpeg([
      "-y", "-i", path.join(ASSETS, src),
      "-vf", "scale=1280:-2",
      "-q:v", "4", // qualité JPEG ~80
      path.join(ASSETS, out),
    ]);
    const before = fs.statSync(path.join(ASSETS, src)).size;
    const after = fs.statSync(path.join(ASSETS, out)).size;
    console.log(`[icons] ${src} → ${out} (${(before / 1024 / 1024).toFixed(1)} Mo → ${(after / 1024).toFixed(0)} Ko)`);
  }

  console.log("[icons] Terminé. Pensez à mettre à jour les <link rel=\"icon\"> dans src/routes/__root.tsx.");
}

main();

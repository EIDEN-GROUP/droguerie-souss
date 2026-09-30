"""Extract Dune Distribution catalogue assets from the source PDF.

Outputs (all under public/catalogue-dune/):
  - model photos named by plate + model, e.g. 120x60-estatuario.webp
  - family ambiance photos, e.g. ceramique-banner.webp
  - cover-logo.webp, cover-bg.webp, cover-qr.webp
  - cover.webp : 3/4 crop of page 1 for the /catalogue card

Run: python scripts/extract_dune_catalogue.py
"""
import os
import re
import unicodedata

import pymupdf
from PIL import Image

SRC = r"M:/pdf/Catalogue Dune Distribution VF 270826.pdf"
BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(BASE, "..", "public", "catalogue-dune"))


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s


# plate pages: pdf page number (1-based) -> (size slug, [model names in reading order])
PLATES = {
    4: ("120x60", ["ESTATUARIO", "CALACATA", "GENOVA NEGRO"]),
    5: ("60x60", ["ROOL GF", "ROOL GC", "MIRAGE", "CARRAPLUS",
                  "VAIL CREMA", "VAIL GRIS"]),
    6: ("30x90", ["CAPRICE NOIR", "GROWN", "FLY MARBELLA", "BETTA"]),
    7: ("30x60", ["GENOVA", "GENOVA DAMA", "JAVA BEIGE", "JAVA DAMA",
                  "JAVA LOFT", "SARAGOSSA", "SARAGOSSA DAMA"]),
    8: ("25x50", ["LIGHT BEIGE", "LIGHT BEIGE DECO", "LIGHT PERLA",
                  "LIGHT PERLA DECO", "LIGHT GRIS", "LIGHT VERDA"]),
    9: ("parquet-20x60", ["62032", "62035", "62037", "62055"]),
    13: ("revetement-33x33", ["LCB NOIR", "CARRE NOIR", "STRIE ROUGE",
                              "STRIE BEIGE", "BELDI BEIGE", "BELDI NOIR"]),
    14: ("revetement-40x60", ["LC BEIGE", "LCB NOIR", "LCB ROUGE"]),
}

# family/cover pages: pdf page number -> [names in placement order (row-major)]
NAMED = {
    1: ["cover-logo", "cover-bg", "cover-qr"],
    2: ["about-logo", "about-photo"],
    3: ["ceramique-banner", "ceramique-sdb", "ceramique-tiles"],
    10: ["usines-logo"],
    11: ["ciment-colle-banner", "ciment-colle-pose", "ciment-colle-truelle"],
    12: ["ciment-colle-sacs", "ciment-colle-poudre"],
    15: ["cpj-chantier", "cpj-fer", "cpj-betonnage"],
    16: ["prefab-agglos", "prefab-paves", "prefab-plancher"],
    17: ["sanitaire-sdb", "sanitaire-vasque", "sanitaire-robinet"],
    18: ["peinture-mur", "peinture-seau", "peinture-futs", "peinture-pots"],
    19: ["metallurgie-tole", "metallurgie-fil", "metallurgie-soudure"],
    20: ["solaire-panneaux", "solaire-onduleur", "solaire-cube"],
    21: ["back-logo", "back-bg", "back-qr"],
}


def trim_dark_border(img: Image.Image, threshold=28, pad=2) -> Image.Image:
    """Supprime les bordures noires « baked in » si elles sont quasi uniformes."""
    w, h = img.size
    px = img.convert("L").getdata()

    def row_dark(y):
        return sum(1 for x in range(0, w, 4) if px[y * w + x] < threshold) > (w / 4) * 0.92

    def col_dark(x):
        return sum(1 for y in range(0, h, 4) if px[y * w + x] < threshold) > (h / 4) * 0.92

    top = bottom = left = right = 0
    for y in range(h // 2):
        if row_dark(y):
            top = y + 1
        else:
            break
    for y in range(h - 1, h // 2, -1):
        if row_dark(y):
            bottom = y
        else:
            break
    for x in range(w // 2):
        if col_dark(x):
            left = x + 1
        else:
            break
    for x in range(w - 1, w // 2, -1):
        if col_dark(x):
            right = x
        else:
            break
    if top + bottom > h * 0.5 or left + right > w * 0.5:
        return img  # image légitimement sombre, pas de frame
    if top < 8 and bottom < 8 and left < 8 and right < 8:
        return img
    x0, y0 = max(left - pad, 0), max(top - pad, 0)
    x1, y1 = min(right + pad, w - 1), min(bottom + pad, h - 1)
    if x1 - x0 < 60 or y1 - y0 < 60:
        return img
    return img.crop((x0, y0, x1, y1))


def opaque_bbox(doc, smask, img_w, img_h):
    """Boîte du contenu opaque d'après le SMask (pixels image), ou None."""
    try:
        mpix = pymupdf.Pixmap(doc, smask)
        if mpix.n - mpix.alpha != 1:
            mpix = pymupdf.Pixmap(pymupdf.csGRAY, mpix)
        mask = Image.frombytes("L", [mpix.width, mpix.height], mpix.samples)
    except Exception:
        return None
    if (mask.width, mask.height) != (img_w, img_h):
        mask = mask.resize((img_w, img_h), Image.NEAREST)
    bbox = mask.point(lambda v: 255 if v > 128 else 0).getbbox()
    if not bbox:
        return None
    area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
    if area < img_w * img_h * 0.05:  # masque dégénéré
        return None
    return bbox


def save_render(page, doc, xref, smask, img_w, img_h, path, max_w=1400):
    """Rend la région de l'image telle qu'elle s'affiche dans le PDF : le SMask
    (transparence) est composite au rendu, donc plus de bordures noires. Si un
    SMask existe, on recadre en plus sur la boîte opaque exacte du visuel."""
    rects = page.get_image_rects(xref)
    if not rects:
        raise RuntimeError(f"xref {xref}: pas de rectangle")
    r = rects[0]
    zoom = min(max(max_w / max(r.width, r.height), 2), 8)
    clip = pymupdf.Rect(r.x0, r.y0, r.x1, r.y1)
    clip.intersect(page.rect)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip)
    img = Image.frombytes("RGB" if pix.n - pix.alpha <= 3 else "RGBA",
                          [pix.width, pix.height], pix.samples)
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    if smask and img_w and img_h:
        # placement axis-aligned ? aspect image ~= aspect rect
        rect_ratio = r.width / max(r.height, 1)
        img_ratio = img_w / max(img_h, 1)
        if abs(rect_ratio - img_ratio) / max(img_ratio, 0.01) < 0.03:
            bbox = opaque_bbox(doc, smask, img_w, img_h)
            if bbox:
                x0 = r.x0 + bbox[0] / img_w * r.width
                y0 = r.y0 + bbox[1] / img_h * r.height
                x1 = r.x0 + bbox[2] / img_w * r.width
                y1 = r.y0 + bbox[3] / img_h * r.height
                pad = 3
                px0 = max(int((x0 - clip.x0) * zoom) - pad, 0)
                py0 = max(int((y0 - clip.y0) * zoom) - pad, 0)
                px1 = min(int((x1 - clip.x0) * zoom) + pad, img.width)
                py1 = min(int((y1 - clip.y0) * zoom) + pad, img.height)
                if px1 - px0 > 60 and py1 - py0 > 60:
                    img = img.crop((px0, py0, px1, py1))
    else:
        img = trim_dark_border(img)
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    img.save(path, "WEBP", quality=84, method=6)
    return img.size


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = pymupdf.open(SRC)
    seen: dict[int, str] = {}
    report = []
    for pno in range(1, len(doc) + 1):
        page = doc[pno - 1]
        items = []
        for img in page.get_images(full=True):
            xref = img[0]
            rects = page.get_image_rects(xref)
            if not rects:
                continue
            r = rects[0]
            items.append((xref, (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2, r, img[1], img[2], img[3]))
        # row-major placement order
        items.sort(key=lambda t: (round(t[2] / 40), t[1]))
        if pno in PLATES:
            size, models = PLATES[pno]
            assert len(items) == len(models), f"p{pno}: {len(items)} imgs vs {len(models)} models"
            names = [f"{size}-{slug(m)}" for m in models]
        elif pno in NAMED:
            names = NAMED[pno]
            if len(items) != len(names):
                print(f"WARN p{pno}: {len(items)} imgs vs {len(names)} names -> positional")
                names = [f"p{pno:02d}-{chr(97 + k)}" for k in range(len(items))]
        else:
            raise SystemExit(f"page {pno} not mapped")
        for (xref, cx, cy, r, smask, iw, ih), name in zip(items, names):
            if xref in seen:
                report.append(f"p{pno:02d} {name:32s} REUSE {seen[xref]}")
                continue
            path = os.path.join(OUT, name + ".webp")
            w, h = save_render(page, doc, xref, smask, iw, ih, path)
            seen[xref] = name + ".webp"
            report.append(
                f"p{pno:02d} {name:32s} {w}x{h}px at ({r.x0:5.0f},{r.y0:5.0f})-({r.x1:5.0f},{r.y1:5.0f})")
    print("\n".join(report))

    # couverture réelle fournie par le client -> copie de secours webp (carte /catalogue)
    front = os.path.join(OUT, "dune-distribution(front-cover).png")
    if os.path.exists(front):
        im = Image.open(front).convert("RGB")
        im.save(os.path.join(OUT, "front-cover.png"), "PNG")
        print(f"front-cover.png {im.size}")
    print(f"OK: {len(seen)} unique images -> {OUT}")


if __name__ == "__main__":
    main()

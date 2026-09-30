"""Extract Daoud Building catalogue assets from the source PDF.

Outputs (all under public/catalogue-daoud/):
  - product photos named by family, e.g. agglos-07x50x20.webp
  - section photos, cover bg/logo/QR, attestation scans

Render-based extraction (SMask-aware): each image region is rendered as
displayed, then cropped to the SMask opaque box. Logos keep their alpha.

Run: python scripts/extract_daoud_catalogue.py
"""
import os

import pymupdf
from PIL import Image

SRC = r"M:/droguerie-souss/public/catalogue/catalogue-souss-droguerie-2026.pdf"
BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(BASE, "..", "public", "catalogue-daoud"))


def trim_dark_border(img: Image.Image, threshold=28, pad=2) -> Image.Image:
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
        return img
    if top < 8 and bottom < 8 and left < 8 and right < 8:
        return img
    x0, y0 = max(left - pad, 0), max(top - pad, 0)
    x1, y1 = min(right + pad, w - 1), min(bottom + pad, h - 1)
    if x1 - x0 < 60 or y1 - y0 < 60:
        return img
    return img.crop((x0, y0, x1, y1))


def opaque_bbox(doc, smask, img_w, img_h):
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
    if area < img_w * img_h * 0.05:
        return None
    return bbox


def save_render(page, doc, xref, smask, img_w, img_h, path, max_w=1400, keep_alpha=False,
                rect=None):
    if rect is None:
        rects = page.get_image_rects(xref)
        if not rects:
            raise RuntimeError(f"xref {xref}: pas de rectangle")
        rect = rects[0]
    r = rect
    zoom = min(max(max_w / max(r.width, r.height), 2), 8)
    clip = pymupdf.Rect(r.x0, r.y0, r.x1, r.y1)
    clip.intersect(page.rect)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip)
    img = Image.frombytes(
        "RGB" if pix.n - pix.alpha <= 3 else "RGBA", [pix.width, pix.height], pix.samples
    )
    if keep_alpha:
        # Logos : le clip COMPLET est le visuel (le SMask exclut la baseline).
        # Aplatissement sur le fond papier du catalogue, sans recadrage.
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 250, 246))
            bg.paste(img, mask=img.split()[3])
            img = bg
    else:
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 250, 246))
            bg.paste(img, mask=img.split()[3])
            img = bg
        if smask and img_w and img_h:
            rect_ratio = r.width / max(r.height, 1)
            img_ratio = img_w / max(img_h, 1)
            if abs(rect_ratio - img_ratio) / max(img_ratio, 0.01) < 0.03:
                bbox = opaque_bbox(doc, smask, img_w, img_h)
                if bbox:
                    x0 = r.x0 + bbox[0] / img_w * r.width
                    y0 = r.y0 + bbox[1] / img_h * r.height
                    x1 = r.x0 + bbox[2] / img_w * r.width
                    y1 = r.y0 + bbox[3] / img_h * r.height
                    pad = 9
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
    if img.mode == "RGBA":
        img.save(path, "WEBP", quality=88, method=6)
    else:
        img.save(path, "WEBP", quality=84, method=6)
    return img.size


# (pdf page, xref, name, max_w, keep_alpha?) — placement order = reading order
# except where noted; p7/p9 handled via all-placements below.
JOBS: list = [
    (1, 984, "cover-bg", 1600, False),
    (1, 48, "cover-logo", 900, True),
    (1, 47, "cover-qr", 600, False),
    (8, 93, "logo", 700, True),
    (3, 1009, "usine-photo", 1400, False),
    (3, 1012, "machine-photo", 1000, False),
    (4, 1026, "yard-photo", 1400, False),
    (5, 1040, "silos-photo", 1400, False),
    (6, 79, "agglo-schema", 1400, False),
    (6, 80, "brick-icon", 700, False),
    (8, 89, "plancher-schema-1", 1000, False),
    (8, 90, "plancher-schema-2", 1400, False),
    (8, 91, "plancher-schema-3", 1000, False),
    (10, 131, "poutrelle-photo", 1400, False),
    (11, 137, "poutrelle-pc-photo", 1000, False),
    (12, 141, "pose-photo", 1400, False),
    (13, 168, "pave-behaton", 700, False),
    (13, 169, "pave-holanda", 700, False),
    (13, 170, "pave-uni", 700, False),
    (13, 171, "pave-dim-1", 800, False),
    (13, 172, "pave-dim-2", 800, False),
    (13, 173, "pave-dim-3", 800, False),
    (13, 167, "pave-calepinage-1", 800, False),
    (13, 166, "pave-calepinage-2", 1000, False),
    (13, 174, "pave-calepinage-3", 800, False),
    (14, 178, "bordure-photo", 1400, False),
    (15, 195, "bordure-t2", 800, False),
    (15, 196, "bordure-t3", 800, False),
    (15, 197, "bordure-dim-t2", 1000, False),
    (15, 198, "bordure-dim-t3", 1000, False),
    (16, 1304, "sol33-striee-beige", 700, False),
    (16, 1307, "sol33-striee-rouge", 700, False),
    (16, 1310, "sol33-carre-noir", 700, False),
    (16, 1325, "sol33-lcb-noir", 800, False),
    (16, 1316, "sol33-beldi-beige", 800, False),
    (16, 1313, "sol33-beldi-noir", 800, False),
    (16, 1322, "sol33-beldi-rouge", 800, False),
    (17, 1335, "sol40-lc-beige", 900, False),
    (17, 218, "sol40-lcb-noir", 900, False),
    (17, 219, "sol40-lcb-rouge", 900, False),
    (18, 224, "blocs-photo", 1400, False),
    (19, 1356, "trucks-photo", 1400, False),
    (19, 233, "highway-photo", 1400, False),
    (20, 1366, "tower-photo", 1000, False),
    (21, 243, "rebar-photo", 1000, False),
    (21, 244, "treillis-photo", 1400, False),
    (21, 245, "beton-photo", 1400, False),
    (21, 246, "agregats-photo", 1400, False),
    (22, 1382, "eoliennes-photo", 1400, False),
    (22, 1385, "solaire-photo", 1400, False),
    (23, 1401, "city-photo", 1400, False),
    (24, 264, "att-agglos-1", 800, False),
    (24, 265, "att-agglos-2", 800, False),
    (24, 266, "att-agglos-3", 800, False),
    (24, 267, "att-agglos-4", 800, False),
    (25, 273, "att-paves-1", 800, False),
    (26, 279, "att-beton-1", 800, False),
    (26, 280, "att-beton-2", 800, False),
    (27, 286, "att-hourdis-1", 800, False),
    (27, 287, "att-hourdis-2", 800, False),
    (27, 288, "att-hourdis-3", 800, False),
    (28, 294, "att-poutrelles-1", 800, False),
    (28, 295, "att-poutrelles-2", 800, False),
    (29, 305, "contact-logo", 900, True),
    (29, 1917, "contact-band", 1600, False),
]

# pages whose product photos share xrefs across columns: (page, xref, [names L->R])
MULTI = {
    7: [(84, ["agglos-07x50x20", "agglos-10x50x20"]), (85, ["agglos-15x50x20", "agglos-20x50x20", "agglos-20x50x25"])],
    9: [(126, ["hourdis-12x53x20", "hourdis-16x53x20"]), (127, ["hourdis-20x53x20"])],
}


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = pymupdf.open(SRC)
    by_page: dict[int, list] = {}
    for pno, xref, name, max_w, alpha in JOBS:
        by_page.setdefault(pno, []).append((xref, name, max_w, alpha))
    for pno in sorted(set(list(by_page) + list(MULTI))):
        page = doc[pno - 1]
        if pno in by_page:
            for xref, name, max_w, alpha in by_page[pno]:
                info = next((i for i in page.get_images(full=True) if i[0] == xref), None)
                smask, iw, ih = (info[1], info[2], info[3]) if info else (0, 0, 0)
                # use first rect for single-placement names
                w, h = save_render(page, doc, xref, smask, iw, ih,
                                   os.path.join(OUT, name + ".webp"), max_w, alpha)
                print(f"p{pno:02d} {name:24s} {w}x{h}")
        if pno in MULTI:
            for xref, names in MULTI[pno]:
                info = next((i for i in page.get_images(full=True) if i[0] == xref), None)
                smask, iw, ih = (info[1], info[2], info[3]) if info else (0, 0, 0)
                rects = sorted(page.get_image_rects(xref), key=lambda r: (round(r.y0 / 40), r.x0))
                assert len(rects) == len(names), f"p{pno} xref{xref}: {len(rects)} rects vs {len(names)} names"
                for r, name in zip(rects, names):
                    path = os.path.join(OUT, name + ".webp")
                    w, h = save_render(page, doc, xref, smask, iw, ih, path, 900, False, r)
                    print(f"p{pno:02d} {name:24s} {w}x{h} (placement)")
    print(f"OK -> {OUT}")


if __name__ == "__main__":
    main()

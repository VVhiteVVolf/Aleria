"""Read-only extraction of the 21 drawn settlement circles; writes diagnostics only."""
from collections import deque
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(r"E:\Aleria")
OUT = ROOT / "diagnostics/ishtaran/placement-map-review"
MAPS = ROOT / "Vorschau/Ishtaran/assets/maps"
NORMAL = MAPS / "ishtaran-normal.webp"
REGIONS = MAPS / "ishtaran-regions.webp"
SEEDS = [
    ("white", 500, 192, 56), ("white", 1833, 197, 107),
    ("white", 2797, 122, 56), ("white", 3752, 566, 56),
    ("white", 1127, 872, 56), ("white", 183, 872, 56),
    ("white", 2882, 1228, 56), ("white", 3414, 1236, 56),
    ("white", 2077, 1347, 56),
    ("blue", 3723, 323, 33), ("blue", 1068, 588, 33),
    ("blue", 2047, 747, 33), ("blue", 2230, 675, 33),
    ("blue", 2910, 843, 33), ("blue", 2044, 919, 33),
    ("blue", 573, 1089, 33), ("blue", 1131, 1514, 33),
    ("blue", 256, 1653, 33), ("blue", 620, 1838, 33),
    ("red", 1262, 1825, 33), ("blue", 3471, 1918, 33),
]


def marker_component(pixels, color, x, y, radius):
    margin = radius + 14
    left, top = x - margin, y - margin
    local = pixels[top:y + margin + 1, left:x + margin + 1].astype(int)
    red, green, blue = local[:, :, 0], local[:, :, 1], local[:, :, 2]
    if color == "white":
        mask = (np.minimum(np.minimum(red, green), blue) > 238) & (local.max(axis=2) - local.min(axis=2) < 15)
    elif color == "blue":
        mask = (blue > 190) & (red < 150) & (green > 55) & (green < 185) & (blue - green > 50)
    else:
        mask = (red > 175) & (green < 75) & (blue < 75) & (red - green > 110)
    ys, xs = np.nonzero(mask)
    desired = np.array([margin + radius * .85, margin])
    index = np.argmin((xs - desired[0]) ** 2 + (ys - desired[1]) ** 2)
    seed = (int(xs[index]), int(ys[index]))
    queue, found = deque([seed]), {seed}
    while queue:
        px, py = queue.popleft()
        for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
            if 0 <= nx < mask.shape[1] and 0 <= ny < mask.shape[0] and mask[ny, nx] and (nx, ny) not in found:
                found.add((nx, ny))
                queue.append((nx, ny))
    actual_x = [point[0] + left for point in found]
    actual_y = [point[1] + top for point in found]
    bounds = [min(actual_x), min(actual_y), max(actual_x) + 1, max(actual_y) + 1]
    centre = [(bounds[0] + bounds[2] - 1) / 2, (bounds[1] + bounds[3] - 1) / 2]
    return centre, bounds, len(found)


def phase_alignment(normal, regions):
    size = (512, round(normal.height * 512 / normal.width))
    a = np.asarray(normal.convert("L").resize(size), dtype=float)
    b = np.asarray(regions.convert("L").resize(size), dtype=float)
    a -= a.mean()
    b -= b.mean()
    spectrum = np.fft.fft2(a) * np.conjugate(np.fft.fft2(b))
    correlation = np.fft.ifft2(spectrum / np.maximum(np.abs(spectrum), 1e-10)).real
    y, x = np.unravel_index(np.argmax(correlation), correlation.shape)
    if x > size[0] / 2:
        x -= size[0]
    if y > size[1] / 2:
        y -= size[1]
    return {"sampleSize": list(size), "peakShiftSamplePixels": [int(x), int(y)], "peak": float(correlation.max())}


def make_evidence(normal, regions, record):
    x, y = record["pixelCentre"]
    half = 140
    box = [round(x) - half, round(y) - half, round(x) + half, round(y) + half]
    left = normal.crop(box).convert("RGB")
    right = regions.crop(box).convert("RGB")
    cross = ImageDraw.Draw(left)
    cross.line((half - 9, half, half + 9, half), fill="#c51f1f", width=2)
    cross.line((half, half - 9, half, half + 9), fill="#c51f1f", width=2)
    canvas = Image.new("RGB", (580, 320), "#f2ebdc")
    canvas.paste(left, (5, 30))
    canvas.paste(right, (295, 30))
    draw = ImageDraw.Draw(canvas)
    label = record["id"] + "  " + record["type"] + "  x=" + str(record["x"]) + "% y=" + str(record["y"]) + "%"
    draw.text((7, 7), label, fill="black")
    draw.text((7, 311), "Normal (cross = centre)", fill="black")
    draw.text((297, 311), "Regions (original marker)", fill="black")
    path = OUT / (record["id"] + "-normal-regions.png")
    canvas.save(path)
    return str(path.relative_to(ROOT)).replace("\\", "/")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    normal, regions = Image.open(NORMAL).convert("RGB"), Image.open(REGIONS).convert("RGB")
    assert normal.size == regions.size == (4096, 2349)
    pixels = np.array(regions)
    points = []
    for color, x, y, radius in SEEDS:
        centre, bounds, count = marker_component(pixels, color, x, y, radius)
        points.append({"markerColor": color, "pixelCentre": centre, "markerBounds": bounds, "markerPixels": count,
                       "diameter": [bounds[2] - bounds[0], bounds[3] - bounds[1]]})
    whites = sorted([p for p in points if p["markerColor"] == "white"], key=lambda p: (p["pixelCentre"][1], p["pixelCentre"][0]))
    capital = max(whites, key=lambda p: p["diameter"][0])
    capital["id"], capital["type"] = "capital", "capital"
    number = 0
    for point in whites:
        if point is capital:
            continue
        number += 1
        point["id"], point["type"] = f"large-{number:02d}", "large-count-seat"
    smalls = sorted([p for p in points if p["markerColor"] != "white"], key=lambda p: (p["pixelCentre"][1], p["pixelCentre"][0]))
    for number, point in enumerate(smalls, 1):
        point["id"], point["type"] = f"small-{number:02d}", "small-seat"
    records = [capital] + [p for p in whites if p is not capital] + smalls
    for point in records:
        point["x"] = round(point["pixelCentre"][0] / normal.width * 100, 4)
        point["y"] = round(point["pixelCentre"][1] / normal.height * 100, 4)
        point["properPlaceName"] = None
        point["evidenceCrop"] = make_evidence(normal, regions, point)
    for start in range(0, len(records), 7):
        group = records[start:start + 7]
        contact = Image.new("RGB", (1160, 1280), "#e4dccb")
        for index, record in enumerate(group):
            crop = Image.open(ROOT / record["evidenceCrop"])
            contact.paste(crop, ((index % 2) * 580, (index // 2) * 320))
        contact.save(OUT / f"contact-{start + 1:02d}-{start + len(group):02d}.jpg", quality=95)
    result = {
        "schemaVersion": 1, "reviewedAt": "2026-11-03",
        "sourceFiles": [
            {"path": str(p.relative_to(ROOT)).replace("\\", "/"), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
            for p in (NORMAL, REGIONS)],
        "dimensions": list(normal.size), "alignment": phase_alignment(normal, regions),
        "counts": {"allCircles": 21, "largeWhiteIncludingCapital": 9, "capital": 1, "ordinaryLarge": 8,
                   "small": 12, "smallBlue": 11, "smallRed": 1},
        "capitalIncludedInNineLarge": True,
        "namesNote": "Only generic Pascharat and Herrschaft labels are drawn. No proper city or territory names are present.",
        "colorNote": "Small red marker's separate color has no supplied legend; do not infer a different rank solely from it.",
        "capacityFromLatestUserInstruction": {"capitalAdditionalHousesMinimum": 2, "largeAdditionalTarkanHousesMaximum": 2,
                                              "largeAdditionalTarkanHousesOptional": True, "smallTotalHouses": 1},
        "records": records}
    (OUT / "map-anchor-review.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

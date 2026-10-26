"""Prepare user-authorized warrior alpha, previews and independent QA evidence.

Only alpha changes in the 1024x1536 production PNG. Generator originals and
every original RGB byte remain unchanged. There is no hole or circle filling.
Requires Pillow and NumPy. Runs only when explicitly invoked; never watches.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets/warriors"
MANIFEST = ASSETS / "manifest.json"
QA = ROOT.parents[1] / "diagnostics/goldmund/warriors"
RUNTIME_SIZE = (1024, 1536)
PREVIEW_SIZE = (768, 1152)
DEFAULT_PROCESSING = {"version": 1, "outsideThreshold": 160, "coreThreshold": 240, "edgeRadius": 2}


def sha256(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def save_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_manifest() -> dict:
    if not MANIFEST.exists():
        return {"schema": "aleria.goldmund.warrior-artifacts", "version": 1, "entries": []}
    value = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if value.get("schema") != "aleria.goldmund.warrior-artifacts" or value.get("version") != 1:
        raise ValueError("Unexpected warrior artifact manifest")
    return value


def normalized_alpha(source_alpha: np.ndarray, processing: dict) -> np.ndarray:
    """Keep opaque core and at most a two-pixel antialiased contour by default.

    a<=160 -> 0; a>=240 -> 255; in between a linear 0..255 transition.
    The transition survives only next to the >=240 core, removing distant
    alpha-160..239 halos without joining gaps, pruning parts or filling holes.
    """
    floor, core, radius = (processing[key] for key in ("outsideThreshold", "coreThreshold", "edgeRadius"))
    if not (0 <= floor < core <= 255 and 0 <= radius <= 4):
        raise ValueError("Invalid alpha thresholds or edge radius")
    foreground = source_alpha >= core
    if not foreground.any():
        raise ValueError("No sufficiently opaque warrior core found")
    core_image = Image.fromarray(np.where(foreground, 255, 0).astype("uint8"))
    nearby = np.asarray(core_image.filter(ImageFilter.MaxFilter(radius * 2 + 1))) > 0 if radius else foreground
    transition = np.rint(np.clip((source_alpha.astype(float) - floor) / (core - floor), 0, 1) * 255).astype("uint8")
    return np.where(foreground, 255, np.where(nearby, transition, 0)).astype("uint8")


def alpha_metrics(alpha: np.ndarray) -> dict:
    image = Image.fromarray(alpha)
    bbox = image.getbbox()
    if bbox is None:
        raise ValueError("The image has no visible pixels")
    left, top, right, bottom = bbox
    margins = {"left": left, "top": top, "right": image.width - right, "bottom": image.height - bottom}
    return {
        "dimensions": [image.width, image.height],
        "boundingBox": list(bbox),
        "margins": margins,
        "minimumMarginPixels": min(margins.values()),
        "touchesCanvas": min(margins.values()) == 0,
        "transparentPixels": int((alpha == 0).sum()),
        "opaquePixels": int((alpha == 255).sum()),
        "partialAlphaPixels": int(((alpha > 0) & (alpha < 255)).sum()),
        "alphaRange": [int(alpha.min()), int(alpha.max())],
    }


def prepare_one(asset_id: str, processing: dict) -> dict:
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", asset_id):
        raise ValueError(f"Invalid warrior id: {asset_id}")
    source = ASSETS / f"generated/{asset_id}.png"
    source_hash = sha256(source)
    with Image.open(source) as original:
        if original.size != RUNTIME_SIZE:
            raise ValueError(f"{asset_id}: source is {original.size}, expected {RUNTIME_SIZE}; RGB-preserving cleanup does not resize")
        pixels = np.array(original.convert("RGBA"))
    alpha = normalized_alpha(pixels[:, :, 3], processing)
    cleaned = pixels.copy()
    cleaned[:, :, 3] = alpha
    production = ASSETS / f"production/{asset_id}.png"
    production.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(cleaned).save(production, optimize=True)
    preview = ASSETS / f"previews/{asset_id}.webp"
    preview.parent.mkdir(parents=True, exist_ok=True)
    image = Image.fromarray(cleaned).resize(PREVIEW_SIZE, Image.Resampling.LANCZOS)
    image.save(preview, "WEBP", quality=94, method=6, exact=True)
    with Image.open(production) as saved:
        production_pixels = np.array(saved.convert("RGBA"))
    with Image.open(preview) as saved:
        preview_alpha = np.array(saved.convert("RGBA"))[:, :, 3]
    rgb_unchanged = bool(np.array_equal(production_pixels[:, :, :3], pixels[:, :, :3]))
    original_unchanged = sha256(source) == source_hash
    if not rgb_unchanged or not original_unchanged:
        raise ValueError(f"{asset_id}: original/RGB preservation failed")
    return {
        "id": asset_id, "source": relative(source), "sourceSha256": source_hash,
        "production": relative(production), "productionSha256": sha256(production),
        "preview": relative(preview), "previewSha256": sha256(preview),
        "processing": processing, "sourceAlpha": alpha_metrics(pixels[:, :, 3]),
        "alpha": alpha_metrics(alpha), "previewAlpha": alpha_metrics(preview_alpha),
        "proof": {"rgbUnchanged": rgb_unchanged, "originalUnchanged": original_unchanged,
                  "sourceTransparentPixelsExposed": int(((pixels[:, :, 3] == 0) & (alpha > 0)).sum()),
                  "corePixelsNotOpaque": int(((pixels[:, :, 3] >= processing["coreThreshold"]) & (alpha != 255)).sum()),
                  "originalTransparentGapsFilled": False, "lowAlphaFloor": processing["outsideThreshold"]},
    }


def build(ids: list[str] | None, processing: dict) -> None:
    selected = ids if ids is not None else sorted(path.stem for path in (ASSETS / "generated").glob("*.png"))
    if not selected:
        raise ValueError("No generated warrior PNGs available")
    if len(set(selected)) != len(selected):
        raise ValueError("Duplicate warrior ids")
    manifest = read_manifest()
    entries = {entry["id"]: entry for entry in manifest["entries"]}
    for asset_id in selected:
        entries[asset_id] = prepare_one(asset_id, processing)
    manifest["entries"] = sorted(entries.values(), key=lambda entry: entry["id"])
    save_json(MANIFEST, manifest)
    print(json.dumps({"prepared": selected, "manifestEntries": len(entries)}))


def audit(expected_count: int | None) -> dict:
    entries = read_manifest()["entries"]
    failures, warnings = [], []
    if expected_count is not None and len(entries) != expected_count:
        failures.append(f"Expected {expected_count} warriors, found {len(entries)}")
    for entry in entries:
        asset_id = entry["id"]
        for name in ("source", "production", "preview"):
            path = ROOT / entry[name]
            if not path.is_file() or sha256(path) != entry[f"{name}Sha256"]:
                failures.append(f"{asset_id}: missing or changed {name}")
        if any(not (ROOT / entry[name]).is_file() for name in ("source", "production", "preview")):
            continue
        with Image.open(ROOT / entry["source"]) as image:
            source = np.array(image.convert("RGBA"))
        with Image.open(ROOT / entry["production"]) as image:
            production = np.array(image.convert("RGBA"))
        with Image.open(ROOT / entry["preview"]) as image:
            preview = np.array(image.convert("RGBA"))
        if source.shape != (RUNTIME_SIZE[1], RUNTIME_SIZE[0], 4) or production.shape != source.shape:
            failures.append(f"{asset_id}: invalid source/production size")
            continue
        if not np.array_equal(source[:, :, :3], production[:, :, :3]):
            failures.append(f"{asset_id}: production RGB differs from original")
        if not np.array_equal(normalized_alpha(source[:, :, 3], entry["processing"]), production[:, :, 3]):
            failures.append(f"{asset_id}: alpha differs from documented transfer function")
        if preview.shape[:2] != (PREVIEW_SIZE[1], PREVIEW_SIZE[0]):
            failures.append(f"{asset_id}: wrong preview size")
        metrics = alpha_metrics(production[:, :, 3])
        if metrics != entry["alpha"]:
            failures.append(f"{asset_id}: stale alpha metrics")
        if metrics["touchesCanvas"]:
            failures.append(f"{asset_id}: figure reaches canvas edge")
        elif metrics["minimumMarginPixels"] < 16:
            warnings.append(f"{asset_id}: tight but transparent margin ({metrics['minimumMarginPixels']} px)")
        if np.any((source[:, :, 3] == 0) & (production[:, :, 3] > 0)):
            failures.append(f"{asset_id}: transparent source gaps filled")
        if np.any((source[:, :, 3] >= entry["processing"]["coreThreshold"]) & (production[:, :, 3] != 255)):
            failures.append(f"{asset_id}: core not fully opaque")
    report = {"checkedWarriors": len(entries), "expectedCount": expected_count, "failures": failures, "warnings": warnings}
    save_json(QA / "audit.json", report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return report


def contact() -> None:
    entries = read_manifest()["entries"]
    if not entries or len(entries) > 20:
        raise ValueError("The 4x5 contact sheet requires between 1 and 20 warriors")
    tile_width, picture_height, label_height = 256, 384, 24
    tile_height = picture_height + label_height
    sheet = Image.new("RGB", (tile_width * 4, tile_height * 5), (225, 225, 225))
    labels = ImageDraw.Draw(sheet)
    for index, entry in enumerate(entries):
        with Image.open(ROOT / entry["production"]) as source:
            image = source.convert("RGBA")
            image.thumbnail((tile_width - 12, picture_height - 12), Image.Resampling.LANCZOS)
        tile = Image.new("RGBA", (tile_width, picture_height), (225, 225, 225, 255))
        tile.alpha_composite(image, ((tile_width - image.width) // 2, (picture_height - image.height) // 2))
        left, top = (index % 4) * tile_width, (index // 4) * tile_height
        sheet.paste(tile.convert("RGB"), (left, top))
        labels.text((left + 8, top + picture_height + 4), entry["id"], fill=(30, 30, 30))
    QA.mkdir(parents=True, exist_ok=True)
    sheet.save(QA / "contact-sheet.jpg", quality=95)
    print(str(QA / "contact-sheet.jpg"))


def review(asset_id: str) -> None:
    entry = next((entry for entry in read_manifest()["entries"] if entry["id"] == asset_id), None)
    if entry is None:
        raise ValueError(f"Unknown prepared warrior: {asset_id}")
    width, height = RUNTIME_SIZE
    sheet = Image.new("RGB", (width * 2, height + 32), (225, 225, 225))
    labels = ImageDraw.Draw(sheet)
    for index, name in enumerate(("source", "production")):
        with Image.open(ROOT / entry[name]) as source:
            image = source.convert("RGBA")
        background = Image.new("RGBA", RUNTIME_SIZE, (225, 225, 225, 255))
        background.alpha_composite(image)
        sheet.paste(background.convert("RGB"), (index * width, 32))
        labels.text((index * width + 12, 10), f"{asset_id} / {name}", fill=(30, 30, 30))
    QA.mkdir(parents=True, exist_ok=True)
    destination = QA / f"{asset_id}-review.jpg"
    sheet.save(destination, quality=95)
    print(str(destination))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    build_parser = commands.add_parser("build", help="Prepare explicitly requested or all currently present inputs")
    build_parser.add_argument("--ids", nargs="+")
    build_parser.add_argument("--outside-threshold", type=int, default=160)
    build_parser.add_argument("--core-threshold", type=int, default=240)
    build_parser.add_argument("--edge-radius", type=int, default=2)
    audit_parser = commands.add_parser("audit", help="Verify originals, RGB, alpha, previews and margins")
    audit_parser.add_argument("--expected-count", type=int)
    commands.add_parser("contact", help="Write a fixed 4x5 neutral-background contact sheet")
    review_parser = commands.add_parser("review", help="Write a neutral-background source/production comparison")
    review_parser.add_argument("id")
    args = parser.parse_args()
    if args.command == "build":
        processing = {**DEFAULT_PROCESSING, "outsideThreshold": args.outside_threshold,
                      "coreThreshold": args.core_threshold, "edgeRadius": args.edge_radius}
        build(args.ids, processing)
    elif args.command == "audit":
        if audit(args.expected_count)["failures"]:
            raise SystemExit(1)
    elif args.command == "contact":
        contact()
    else:
        review(args.id)


if __name__ == "__main__":
    main()

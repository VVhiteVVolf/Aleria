"""Archive supplied Goldmund art and build web previews without changing motifs.

Run from any directory. Originals are never replaced with edited artwork.
Pillow and NumPy are required; no image generation is performed here.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys

import numpy as np
from PIL import Image

sys.dont_write_bytecode = True
from alpha_cleanup import prepare_production, verify_production_rgb, verify_exact_circle, inscribed_circle_probe


ROOT = Path(__file__).resolve().parents[1]
DIAGNOSTICS = ROOT.parents[1] / "diagnostics/goldmund"
HOUSE_IDS = (
    "adrard", "broeck", "goldveld", "lanette", "rielle", "roden",
    "roosenvelt", "vandergard", "waalen", "witten",
)
REVISED_HOUSES = frozenset(("goldveld", "lanette", "roden"))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def archive(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        if digest(destination) != digest(source):
            raise ValueError(f"Original already exists with different bytes: {destination}")
        return
    shutil.copy2(source, destination)
    if digest(destination) != digest(source):
        raise ValueError(f"Archive verification failed: {destination}")


def transcode(source: Path, destination: Path, maximum: int, quality: int = 94) -> dict:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        dimensions = list(original.size)
        image = original.convert("RGBA" if "A" in original.getbands() or "transparency" in original.info else "RGB")
        image.thumbnail((maximum, maximum), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6, exact=True)
        preview_dimensions = list(image.size)
    return {
        "file": relative(source),
        "preview": relative(destination),
        "sha256": digest(source),
        "dimensions": dimensions,
        "previewDimensions": preview_dimensions,
        "previewSha256": digest(destination),
    }


def prepare_sources(source_directory: Path) -> None:
    entries = []
    source_names = {path.name.casefold(): path for path in source_directory.iterdir() if path.is_file()}
    inputs = [
        ("Goldmund.png", "assets/originals/map.png", "assets/map.webp", 4096, 90),
        ("Fürstentum Goldmund.png", "assets/originals/source-realm.png", "assets/source-realm.webp", 1024, 94),
    ]
    inputs.extend(
        (
            f"{house}.png", f"assets/originals/houses/{house}.png",
            f"assets/{'source-crests' if house in REVISED_HOUSES else 'crests'}/{house}.webp", 1024, 94,
        )
        for house in HOUSE_IDS
    )
    for name, archived_path, preview_path, maximum, quality in inputs:
        source = source_names.get(name.casefold())
        if source is None:
            raise FileNotFoundError(f"Missing supplied image: {name}")
        archived = ROOT / archived_path
        archive(source, archived)
        entry = transcode(archived, ROOT / preview_path, maximum, quality)
        entry["sourceFile"] = source.name
        entries.append(entry)
        house = Path(name).stem.casefold()
        if house in REVISED_HOUSES:
            active = ROOT / f"assets/crests/{house}.webp"
            if not active.exists():
                active.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / preview_path, active)
    write_json(ROOT / "assets.source.json", entries)
    print(f"Archived and verified {len(entries)} supplied images.")


def alpha_audit(path: Path, circle: bool) -> dict:
    with Image.open(path) as image:
        alpha = image.convert("RGBA").getchannel("A")
        histogram = alpha.histogram()
        bbox = alpha.getbbox()
        visible_bbox = alpha.point(lambda value: 255 if value >= 128 else 0).getbbox()
        result = {
            "transparentPixels": histogram[0],
            "opaquePixels": histogram[255],
            "partialAlphaPixels": sum(histogram[1:255]),
            "alphaValues": [value for value, count in enumerate(histogram) if count],
            "boundingBox": list(bbox) if bbox else None,
            "visibleBoundingBox": list(visible_bbox) if visible_bbox else None,
            "visibleContentTouchesCanvas": bool(visible_bbox and (
                visible_bbox[0] == 0 or visible_bbox[1] == 0
                or visible_bbox[2] == image.width or visible_bbox[3] == image.height
            )),
            "cornersTransparent": all(alpha.getpixel(point) == 0 for point in (
                (0, 0), (image.width - 1, 0), (0, image.height - 1),
                (image.width - 1, image.height - 1),
            )),
        }
        if circle and bbox:
            left, top, right, bottom = bbox
            result["boundingBoxAspectRatio"] = round((right - left) / (bottom - top), 5)
            centre_x, centre_y = (left + right - 1) / 2, (top + bottom - 1) / 2
            radius = min(right - left, bottom - top) * 0.47
            y, x = np.ogrid[top:bottom, left:right]
            disk = (x - centre_x) ** 2 + (y - centre_y) ** 2 < radius ** 2
            inspected = int(disk.sum())
            nonopaque = int(((np.asarray(alpha)[top:bottom, left:right] != 255) & disk).sum())
            result["innerDiskNonopaquePixels"] = nonopaque
            result["innerDiskPixels"] = inspected
            result["innerDiskOpaqueFraction"] = round(1 - nonopaque / inspected, 6) if inspected else 0
        return result


def prepare_generated(groups: dict[str, list[str]]) -> None:
    manifest_path = ROOT / "assets.generated.json"
    previous = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else []
    entries = {(entry["category"], entry["id"]): entry for entry in previous}
    for category, ids in groups.items():
        for asset_id in ids:
            if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", asset_id):
                raise ValueError(f"Invalid asset id: {asset_id}")
            source = ROOT / f"assets/generated/{asset_id}.png"
            production = ROOT / f"assets/production/{asset_id}.png"
            destination = ROOT / f"assets/{category}/{asset_id}.webp"
            circle = category != "banners"
            cleanup = prepare_production(source, production, circle=circle)
            entry = transcode(production, destination, 1024)
            entry.update({
                "id": asset_id, "category": category, "pipelineVersion": 2,
                "file": relative(source), "sha256": digest(source),
                "dimensions": list(Image.open(source).size),
                "production": relative(production), "productionSha256": digest(production),
                "productionDimensions": list(Image.open(production).size),
                "alphaCleanup": cleanup, "alpha": alpha_audit(production, circle),
                "sourceAlpha": alpha_audit(source, circle),
                "previewAlpha": alpha_audit(destination, circle),
            })
            entries[(category, asset_id)] = entry
    write_json(manifest_path, sorted(entries.values(), key=lambda entry: (entry["category"], entry["id"])))
    print(f"Generated-art manifest now contains {len(entries)} images.")


def prepare_pending() -> None:
    """Pick up completed generator files without rebuilding unchanged outputs."""
    direction = json.loads((ROOT / "art-direction.json").read_text(encoding="utf-8"))
    manifest = ROOT / "assets.generated.json"
    previous = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else []
    entries = {(entry["category"], entry["id"]): entry for entry in previous}
    categories = {"crest": "crests", "realm": "realm", "banner": "banners", "historic": "history"}
    groups = {category: [] for category in categories.values()}
    missing = []
    for job in direction["jobs"]:
        asset_id, category = job["id"], categories[job["kind"]]
        source = ROOT / f"assets/generated/{asset_id}.png"
        if not source.is_file():
            missing.append(asset_id)
            continue
        prior = entries.get((category, asset_id))
        if (prior and prior.get("pipelineVersion") == 2 and prior["sha256"] == digest(source)
                and "sourceTransparentPixelsExposed" in prior.get("alphaCleanup", {})
                and (ROOT / prior["production"]).is_file() and (ROOT / prior["preview"]).is_file()):
            continue
        groups[category].append(asset_id)
    if any(groups.values()):
        prepare_generated(groups)
    print(json.dumps({"newlyPrepared": sum(map(len, groups.values())), "awaitingGenerator": missing}, ensure_ascii=False))


def audit() -> None:
    failures = []
    total = 0
    for manifest_name in ("assets.source.json", "assets.generated.json"):
        path = ROOT / manifest_name
        if not path.exists():
            if manifest_name == "assets.source.json":
                failures.append("Missing source manifest")
            continue
        for entry in json.loads(path.read_text(encoding="utf-8")):
            total += 1
            versions = [("file", "sha256", "dimensions"), ("preview", "previewSha256", "previewDimensions")]
            if "production" in entry:
                versions.append(("production", "productionSha256", "productionDimensions"))
            for file_key, hash_key, dimensions_key in versions:
                asset = ROOT / entry[file_key]
                if not asset.is_file():
                    failures.append(f"Missing {entry[file_key]}")
                    continue
                if digest(asset) != entry[hash_key]:
                    failures.append(f"Hash mismatch: {entry[file_key]}")
                with Image.open(asset) as image:
                    if list(image.size) != entry[dimensions_key]:
                        failures.append(f"Dimension mismatch: {entry[file_key]}")
            if "production" in entry:
                if not verify_production_rgb(ROOT / entry["file"], ROOT / entry["production"], entry["alphaCleanup"]["padding"]):
                    failures.append(f"Production RGB differs from original: {entry['production']}")
                alpha = alpha_audit(ROOT / entry["production"], entry["category"] != "banners")
                if alpha != entry["alpha"]:
                    failures.append(f"Alpha audit mismatch: {entry['production']}")
                if alpha["visibleContentTouchesCanvas"] or not alpha["cornersTransparent"]:
                    failures.append(f"Missing transparent border: {entry['production']}")
                if entry["category"] != "banners" and alpha["innerDiskNonopaquePixels"]:
                    failures.append(f"Nonopaque emblem interior: {entry['production']}")
                if entry["category"] != "banners" and not verify_exact_circle(ROOT / entry["production"], entry["alphaCleanup"]["padding"], entry["alphaCleanup"]["circle"]):
                    failures.append(f"Emblem alpha is not an exact circle: {entry['production']}")
                preview_alpha = alpha_audit(ROOT / entry["preview"], entry["category"] != "banners")
                if preview_alpha != entry["previewAlpha"]:
                    failures.append(f"Preview alpha audit mismatch: {entry['preview']}")
                if entry["category"] != "banners" and preview_alpha["innerDiskNonopaquePixels"]:
                    failures.append(f"Nonopaque WebP interior: {entry['preview']}")
    print(json.dumps({"checkedImages": total, "failures": failures}, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(1)


def circle_probes(ids: list[str]) -> None:
    report = []
    for asset_id in ids:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", asset_id):
            raise ValueError(f"Invalid asset id: {asset_id}")
        source = ROOT / f"assets/production/{asset_id}.png"
        destination = DIAGNOSTICS / f"circle-probes/{asset_id}.png"
        entry = inscribed_circle_probe(source, destination)
        visual_preview = destination.with_suffix(".jpg")
        with Image.open(destination) as image:
            background = Image.new("RGBA", image.size, (225, 225, 225, 255))
            background.alpha_composite(image.convert("RGBA"))
            background.convert("RGB").save(visual_preview, quality=95)
        entry.update({"id": asset_id, "source": relative(source), "file": destination.relative_to(ROOT.parents[1]).as_posix(),
                      "sourceSha256": digest(source), "sha256": digest(destination),
                      "visualPreview": visual_preview.relative_to(ROOT.parents[1]).as_posix()})
        report.append(entry)
    write_json(DIAGNOSTICS / "circle-probes.json", report)
    print(json.dumps(report, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    source_parser = commands.add_parser("source", help="Archive supplied originals and create source previews")
    source_parser.add_argument("--source-dir", required=True, type=Path)
    generated_parser = commands.add_parser("generated", help="Transcode already generated PNGs without motif changes")
    generated_parser.add_argument("--crest", nargs="*", default=[])
    generated_parser.add_argument("--realm", nargs="*", default=[])
    generated_parser.add_argument("--banner", nargs="*", default=[])
    generated_parser.add_argument("--historic", nargs="*", default=[])
    probe_parser = commands.add_parser("circle-probe", help="Create separate exact-circle alpha samples for visual approval")
    probe_parser.add_argument("--id", nargs="+", required=True)
    commands.add_parser("audit", help="Verify originals, preview hashes and dimensions")
    commands.add_parser("pending", help="Prepare completed planned inputs and skip unchanged production files")
    args = parser.parse_args()
    if args.command == "source":
        prepare_sources(args.source_dir)
    elif args.command == "generated":
        prepare_generated({"crests": args.crest, "realm": args.realm, "banners": args.banner, "history": args.historic})
    elif args.command == "circle-probe":
        circle_probes(args.id)
    elif args.command == "pending":
        prepare_pending()
    else:
        audit()


if __name__ == "__main__":
    try:
        main()
    except (ValueError, FileNotFoundError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from error

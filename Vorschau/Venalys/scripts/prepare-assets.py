"""Archive Venalys inputs and prepare explicit, reproducible web images.

Supplied originals are byte-preserved. Only generated heraldry uses the existing
user-authorized alpha processor; the five supplied patrician emblems do not.
"""
from __future__ import annotations

import argparse
import hashlib
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import re
import shutil
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
REALM = Path(__file__).resolve().parents[1]
SOURCES = REALM / "sources"
QA = ROOT / "diagnostics/venalys-20261102"
SOURCE_FOLDER = Path("C:/Users/fhg_r/Downloads/Venalys")
SOURCE_MANIFEST = REALM / "assets.source.json"
WEB_RECEIPTS = SOURCES / "asset-receipts.json"
ALPHA_RECEIPTS = SOURCES / "alpha-receipts.json"
PLANS = SOURCES / "house-plans.json"

SUPPLIED = {
    "Abor.png": "assets/originals/abor.png",
    "Arentino.png": "assets/originals/arentino.png",
    "Avenicci.png": "assets/originals/avenicci.png",
    "Bergbausiedlung.png": "assets/originals/poi-mine.png",
    "Diese namen verboten 2.png": "assets/originals/name-ban-02.png",
    "Diese Namen verboten.png": "assets/originals/name-ban-01.png",
    "DorfKleinerOrtGehöftHofWeilerEtc.png": "assets/originals/poi-hamlet.png",
    "Große Burg.png": "assets/originals/poi-castle.png",
    "Kirche.png": "assets/originals/poi-church.png",
    "Kloster.png": "assets/originals/poi-monastery.png",
    "RitterlichesGutoderFestung.png": "assets/originals/poi-fortified-estate.png",
    "StandardSiedlungstypHandelHandwerk.png": "assets/originals/poi-settlement.png",
    "Tavernentyp.png": "assets/originals/poi-tavern-01.png",
    "Tavernentype2.png": "assets/originals/poi-tavern-02.png",
    "Tullius.png": "assets/originals/tullius.png",
    "Turm.png": "assets/originals/poi-tower.png",
    "Venalys (Bezirke).png": "sources/originals/map-districts.png",
    "Venalys Anwesen.png": "assets/originals/poi-estate.png",
    "Venalys Normal.png": "sources/originals/map-normal.png",
    "Venalys Wappen.png": "assets/originals/venalys.png",
    "Vinicius.png": "assets/originals/vinicius.png",
    "Waldsiedlung.png": "assets/originals/poi-woodland.png",
}
PATRICIAN_IDS = ("vinicius", "avenicci", "abor", "tullius", "arentino", "venalys")
EXISTING_IDS = ("falveri", "falto")


def read_json(file: Path, default=None):
    return json.loads(file.read_text(encoding="utf-8")) if file.exists() else default


def write_json(file: Path, value) -> None:
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def sha256(file: Path) -> str:
    with file.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def relative(file: Path) -> str:
    return file.resolve().relative_to(ROOT).as_posix()


def archive(source: Path, destination: Path, label: str, published=True) -> dict:
    if not source.is_file():
        raise FileNotFoundError(source)
    digest = sha256(source)
    if destination.exists() and sha256(destination) != digest:
        raise ValueError(f"Existing original differs; preserve and version explicitly: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not destination.exists():
        shutil.copyfile(source, destination)
    if sha256(destination) != digest:
        raise ValueError(f"Original copy failed: {destination}")
    with Image.open(destination) as image:
        dimensions = list(image.size)
    return {"sourceFile": label, "sha256": digest, "dimensions": dimensions,
            "original": relative(destination), "publishedOriginal": published}


def web_image(source: Path, destination: Path, width: int, quality: int) -> dict:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        image = original.convert("RGBA") if "A" in original.getbands() else original.convert("RGB")
        image.thumbnail((width, width), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6, exact=True)
        dimensions = list(image.size)
    return {"source": relative(source), "sourceSha256": sha256(source),
            "path": relative(destination), "sha256": sha256(destination),
            "dimensions": dimensions, "bytes": destination.stat().st_size}


def prepare_supplied(source_folder: Path) -> dict:
    known = set(SUPPLIED)
    present = {p.name for p in source_folder.glob("*.png")}
    if known != present:
        raise ValueError(f"Input inventory changed. Missing: {sorted(known-present)}; additional: {sorted(present-known)}")
    originals = [archive(source_folder / name, REALM / target, name,
                         published=not target.startswith("sources/")) for name, target in SUPPLIED.items()]
    for asset_id in EXISTING_IDS:
        source = ROOT / f"Stammbäume/assets/images/houses/Venalys/haus-{asset_id}.png"
        originals.append(archive(source, REALM / f"assets/originals/{asset_id}.png", relative(source)))
    write_json(SOURCE_MANIFEST, originals)
    web = []
    active_maps = read_json(SOURCES / "active-map-sources.json", {})
    for stem, target in [("map-normal", "map"), ("map-districts", "map-districts")]:
        map_id = "normal" if stem == "map-normal" else "districts"
        active = next((entry for entry in active_maps.get("maps", []) if entry["id"] == map_id), None)
        source = ROOT / active["original"] if active else REALM / f"sources/originals/{stem}.png"
        web.append(web_image(source, REALM / f"assets/{target}.webp", 4096, 91))
        web.append(web_image(source, REALM / f"assets/{target}-full.webp", 8192, 94))
    for asset_id in (*PATRICIAN_IDS, *EXISTING_IDS):
        web.append(web_image(REALM / f"assets/originals/{asset_id}.png",
                             REALM / f"assets/crests/{asset_id}.webp", 600, 95))
    write_json(WEB_RECEIPTS, {"schemaVersion": 1, "originalsPreserved": True,
                              "suppliedPngCount": len(SUPPLIED), "webImages": web})
    return {"suppliedOriginals": len(SUPPLIED), "existingHouseOriginals": len(EXISTING_IDS), "webImages": len(web)}


def check_record(file: Path, digest: str, dimensions=None) -> None:
    if not file.is_file() or sha256(file) != digest:
        raise ValueError(f"Missing or changed asset: {file}")
    if dimensions:
        with Image.open(file) as image:
            if list(image.size) != dimensions:
                raise ValueError(f"Unexpected dimensions: {file}")


def check_supplied() -> dict:
    originals = read_json(SOURCE_MANIFEST)
    receipts = read_json(WEB_RECEIPTS)
    if not originals or not receipts or len(originals) != len(SUPPLIED) + len(EXISTING_IDS):
        raise ValueError("Original or web-image inventory is incomplete")
    for entry in originals:
        check_record(ROOT / entry["original"], entry["sha256"], entry["dimensions"])
    for entry in receipts["webImages"]:
        check_record(ROOT / entry["source"], entry["sourceSha256"])
        check_record(ROOT / entry["path"], entry["sha256"], entry["dimensions"])
    return {"originalsChecked": len(originals), "webImagesChecked": len(receipts["webImages"])}


def house_ids() -> list[str]:
    plans = read_json(PLANS)
    if not plans or not plans.get("houses"):
        raise ValueError("House art directions are missing")
    ids = [house["id"] for house in plans["houses"]]
    if len(ids) != len(set(ids)) or any(not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", item) for item in ids):
        raise ValueError("Invalid or duplicate house art IDs")
    return ids


def prepare_heraldry(ids: list[str]) -> dict:
    spec = spec_from_file_location("venalys_heraldic_alpha", ROOT / "AleriaAlmanach/scripts/heraldic_emblem_alpha.py")
    processor = module_from_spec(spec)
    spec.loader.exec_module(processor)
    files = {asset_id: REALM / f"assets/generated/crests/{asset_id}.png" for asset_id in ids}
    missing = [asset_id for asset_id, file in files.items() if not file.is_file()]
    if missing:
        raise ValueError(f"Generated emblems still missing: {', '.join(missing)}")
    receipt = read_json(ALPHA_RECEIPTS, {"schemaVersion": 1, "permission": "Ja, Alpha bereinigen – geltende Nutzerfreigabe", "crests": []})
    entries = {entry["id"]: entry for entry in receipt["crests"]}
    for asset_id, source in files.items():
        source_hash = sha256(source)
        production = REALM / f"assets/production/{asset_id}.png"
        framing = processor.prepare_emblem_from_source(source, production, coverage=.88)
        preview = web_image(production, REALM / f"assets/crests/{asset_id}.webp", 600, 94)
        if sha256(source) != source_hash:
            raise ValueError(f"Generator original changed: {source}")
        entries[asset_id] = {"id": asset_id, **framing, "source": relative(source),
                             "sourceSha256": source_hash, "production": relative(production),
                             "productionSha256": sha256(production), "preview": preview["path"],
                             "previewSha256": preview["sha256"]}
    receipt["crests"] = sorted(entries.values(), key=lambda entry: entry["id"])
    write_json(ALPHA_RECEIPTS, receipt)
    return {"preparedEmblems": ids}


def check_heraldry(expected_ids: list[str]) -> dict:
    receipt = read_json(ALPHA_RECEIPTS, {})
    entries = {entry["id"]: entry for entry in receipt.get("crests", [])}
    if set(entries) != set(expected_ids):
        raise ValueError(f"Heraldry receipt IDs differ. Missing: {sorted(set(expected_ids)-set(entries))}; extra: {sorted(set(entries)-set(expected_ids))}")
    for entry in entries.values():
        for field in ("source", "production", "preview"):
            check_record(ROOT / entry[field], entry[field + "Sha256"])
        with Image.open(ROOT / entry["production"]) as original:
            pixels = np.asarray(original.convert("RGBA"))
        yy, xx = np.ogrid[:pixels.shape[0], :pixels.shape[1]]
        cx, cy = entry["circle"]["centre"]
        disc = (xx-cx)**2 + (yy-cy)**2 <= entry["circle"]["radius"]**2
        if set(np.unique(pixels[:, :, 3])) != {0, 255} or not np.array_equal(pixels[:, :, 3] == 255, disc):
            raise ValueError(f"Emblem alpha is not a solid exact circle: {entry['id']}")
        with Image.open(ROOT / entry["source"]) as original:
            source = np.asarray(original.convert("RGBA"))
        x, y = entry["padding"]["left"], entry["padding"]["top"]
        if not np.array_equal(source[:, :, :3], pixels[y:y+source.shape[0], x:x+source.shape[1], :3]):
            raise ValueError(f"Emblem RGB changed: {entry['id']}")
    return {"emblemsChecked": len(entries), "solidCircularAlpha": True, "rgbUnchanged": True}


def heraldry_contact(ids: list[str]) -> None:
    """Diagnostic backgrounds belong only to this review sheet, never the PNGs."""
    columns, cell_width, cell_height = 5, 285, 315
    rows = (len(ids) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * cell_width, rows * cell_height), "#dededb")
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 18)
    except OSError:
        font = ImageFont.load_default()
    for index, asset_id in enumerate(ids):
        x, y = (index % columns) * cell_width, (index // columns) * cell_height
        fill = "#f7f5ef" if index % 2 else "#d6d8d8"
        draw.rectangle((x + 5, y + 5, x + cell_width - 5, y + cell_height - 5), fill=fill)
        with Image.open(REALM / f"assets/production/{asset_id}.png") as source:
            preview = source.convert("RGBA")
            preview.thumbnail((255, 255), Image.Resampling.LANCZOS)
            canvas.paste(preview, (x + (cell_width-preview.width)//2, y + 12), preview)
        draw.text((x + 16, y + 278), asset_id, fill="#232425", font=font)
    output = QA / "crests/contact.jpg"
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, "JPEG", quality=95)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE_FOLDER)
    parser.add_argument("--art", action="store_true", help="Prepare generated house crests instead of supplied assets")
    parser.add_argument("--ids", nargs="+", help="Prepare only these expected crest IDs; never weakens --check")
    parser.add_argument("--check", action="store_true", help="Read-only verification of all assets in the selected stage")
    parser.add_argument("--contact", action="store_true", help="Create an independent heraldry review sheet under diagnostics")
    args = parser.parse_args()
    if args.ids and (not args.art or args.check):
        parser.error("--ids is only available for preparation with --art; --check always checks the full expected set")
    if args.contact and not args.art:
        parser.error("--contact requires --art")
    if args.art:
        expected = house_ids()
        ids = args.ids or expected
        if not set(ids).issubset(expected):
            parser.error("Unknown crest ID")
        result = check_heraldry(expected) if args.check else prepare_heraldry(ids)
        if args.contact:
            heraldry_contact(ids)
    else:
        result = check_supplied() if args.check else prepare_supplied(args.source)
    print(json.dumps({"status": "ok", "mode": "check" if args.check else "prepare", **result}, ensure_ascii=False))


if __name__ == "__main__":
    main()

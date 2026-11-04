"""Prepare explicitly listed Leukonia assets; run on demand, never watch.

Original PNGs are byte-preserved. Figure alpha uses WarriorArtifacts; heraldry
uses the same shared alpha operations as prepare-country-art.py. No segmentation
or RGB recoloring is implemented here. Supplied emblems receive previews only.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import re
import shutil
import sys
from uuid import uuid4

import numpy as np
from PIL import Image, ImageDraw

sys.dont_write_bytecode = True
WORKSPACE = Path(__file__).resolve().parents[3]
REALM = Path(__file__).resolve().parents[1]
QA = WORKSPACE / "diagnostics/argentum-leukonia/assets"
RESULTS = REALM / "sources/art-generation-results.json"
RECEIPTS = REALM / "sources/asset-receipts.json"
SOURCE_MANIFEST = REALM / "assets.source.json"
SOURCE_FOLDER = Path("C:/Users/fhg_r/Downloads/Länder/Das Kaiserreich Argentum/Tirnara Provinz")
SUPPLIED = {
    "apinia": "Apinia.png", "bolar": "Bolar.png", "lex": "Lex.png",
    "orania": "Orania.png", "pelagia": "Pelagia.png", "tremelia": "Tremelia.png",
    "argentum": "Kaiserreich Argentum.png", "mede": "Mede Wappen.png",
}
CATEGORIES = {"castes", "emblems", "banners", "warriors"}


def load_module(name: str, path: Path):
    spec = spec_from_file_location(name, path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


FIGURES = load_module("leukonia_shared_figure_artifacts", WORKSPACE / "Vorschau/shared/warrior-artifacts/pipeline.py")
HERALDRY = load_module("leukonia_shared_heraldic_alpha", WORKSPACE / "AleriaAlmanach/scripts/heraldic_emblem_alpha.py")
LOCKS = load_module("leukonia_asset_pipeline_lock", Path(__file__).with_name("asset-pipeline-lock.py"))


class CategoryArtifacts(FIGURES.WarriorArtifacts):
    """Adapt only category paths; shared figure processing and audit stay intact."""

    def __init__(self, category: str, qa_dir: Path):
        super().__init__(root=REALM, schema=f"aleria.leukonia.{category}", qa_dir=qa_dir / category)
        self.assets = REALM / "assets" / category
        self.manifest = self.assets / "manifest.json"


def read_json(path: Path, default=None):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def relative(path: Path) -> str:
    return path.resolve().relative_to(REALM).as_posix()


def copy_exact(source: Path, target: Path) -> str:
    digest = FIGURES.sha256(source)
    if target.exists() and FIGURES.sha256(target) != digest:
        raise ValueError(f"Different original already exists; archive explicitly before replacement: {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        shutil.copyfile(source, target)
    if FIGURES.sha256(target) != digest:
        raise ValueError(f"Original copy differs: {target}")
    return digest


def preview_square(source: Path, target: Path) -> dict:
    with Image.open(source) as opened:
        image = opened.convert("RGBA")
        image.thumbnail((600, 600), Image.Resampling.LANCZOS)
    preview = Image.new("RGBA", (600, 600))
    preview.paste(image, ((600-image.width)//2, (600-image.height)//2))
    target.parent.mkdir(parents=True, exist_ok=True)
    preview.save(target, "WEBP", quality=94, method=6, exact=True)
    return {"preview": relative(target), "previewSha256": FIGURES.sha256(target), "previewDimensions": [600, 600]}


def prepare_supplied(source_folder: Path) -> list[dict]:
    entries = []
    for asset_id, original_name in SUPPLIED.items():
        source = source_folder / original_name
        target = REALM / f"assets/originals/{asset_id}.png"
        digest = copy_exact(source, target)
        with Image.open(target) as image:
            dimensions = list(image.size)
        web = preview_square(target, REALM / f"assets/originals/previews/{asset_id}.webp")
        entries.append({"id": asset_id, "originalName": original_name, "sourcePath": str(source),
                        "sha256": digest, "dimensions": dimensions, "original": relative(target),
                        "bytes": target.stat().st_size, "originalUnchanged": True,
                        "alphaChanged": False, **web})
    manifest = read_json(SOURCE_MANIFEST, {"schemaVersion": 1})
    manifest["sourceFolder"] = str(source_folder)
    manifest["suppliedEmblems"] = entries
    manifest["mapsManagedSeparately"] = True
    FIGURES.save_json(SOURCE_MANIFEST, manifest)
    return entries


def generation_records(ids: list[str] | None, manifests: list[Path]) -> list[dict]:
    records = []
    for manifest in manifests:
        records.extend({**record, "inputManifest": relative(manifest),
                        "inputManifestSha256": FIGURES.sha256(manifest)}
                       for record in read_json(manifest)["records"])
    seen = set()
    for record in records:
        if record["category"] not in CATEGORIES or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", record["assetStem"]):
            raise ValueError(f"Invalid generation category/stem: {record['id']}")
        key = (record["category"], record["assetStem"])
        if key in seen:
            raise ValueError(f"Duplicate generated asset: {key}")
        seen.add(key)
    if ids is not None:
        missing = set(ids) - {record["id"] for record in records}
        if missing:
            raise ValueError(f"Unknown generation IDs: {sorted(missing)}")
        records = [record for record in records if record["id"] in ids]
    return records


def prepare_heraldry(record: dict) -> dict:
    category, stem = record["category"], record["assetStem"]
    source = REALM / f"assets/{category}/generated/{stem}.png"
    target = REALM / f"assets/{category}/production/{stem}.png"
    with Image.open(source) as opened:
        original = opened.convert("RGBA")
    if category == "emblems":
        framing = HERALDRY.prepare_emblem_from_source(source, target, coverage=.88)
    else:
        # This is the shared hanging-sign mode: keep suspension openings intact.
        target.parent.mkdir(parents=True, exist_ok=True)
        guard = Image.new("RGBA", (original.width+4, original.height+4))
        guard.paste(original, (2, 2))
        guard.save(target)
        HERALDRY.normalize_emblem_alpha(target, fill_enclosed=False)
        with Image.open(target) as opened:
            final = opened.crop((2, 2, original.width+2, original.height+2))
        final.save(target)
        framing = {"size": list(original.size), "padding": {"left": 0, "top": 0}, "circle": None,
                   "rgbUnchanged": True, "alphaValues": [0, 255]}
    with Image.open(target) as opened:
        pixels = np.asarray(opened.convert("RGBA"))
    x, y = framing["padding"]["left"], framing["padding"]["top"]
    if not np.array_equal(np.asarray(original)[:, :, :3], pixels[y:y+original.height, x:x+original.width, :3]):
        raise ValueError(f"Heraldry RGB changed: {record['id']}")
    web = preview_square(target, REALM / f"assets/{category}/previews/{stem}.webp")
    return {"production": relative(target), "productionSha256": FIGURES.sha256(target),
            "dimensions": list(pixels.shape[1::-1]), "framing": framing,
            "alpha": FIGURES.alpha_metrics(pixels[:, :, 3]), "rgbUnchanged": True, **web}


def prepare_generated(records: list[dict], qa_dir: Path) -> list[dict]:
    entries = []
    for record in records:
        category, stem = record["category"], record["assetStem"]
        source = Path(record["generatedFile"])
        target = REALM / f"assets/{category}/generated/{stem}.png"
        digest = copy_exact(source, target)
        if category in {"castes", "warriors"}:
            artifacts = CategoryArtifacts(category, qa_dir)
            artifacts.build([stem], dict(FIGURES.DEFAULT_PROCESSING))
            prepared = next(entry for entry in artifacts.read_manifest()["entries"] if entry["id"] == stem)
        else:
            prepared = prepare_heraldry(record)
        if FIGURES.sha256(source) != digest or FIGURES.sha256(target) != digest:
            raise ValueError(f"Generator original changed: {record['id']}")
        entries.append({"id": record["id"], "assetStem": stem, "category": category,
                        "generatedFile": str(source), "source": relative(target), "sourceSha256": digest,
                        "jobManifest": record["jobManifest"], "jobId": record["jobId"],
                        "inputManifest": record["inputManifest"], "inputManifestSha256": record["inputManifestSha256"],
                        **{key: value for key, value in prepared.items() if key not in {"id", "source", "sourceSha256"}}})
    old = read_json(RECEIPTS, {"schemaVersion": 1, "entries": []})
    merged = {entry["id"]: entry for entry in old["entries"]}
    merged.update({entry["id"]: entry for entry in entries})
    old.update({"permission": "Ja, Transparenz technisch bereinigen – ausdrückliche Nutzerfreigabe dieser Session",
                "entries": sorted(merged.values(), key=lambda entry: entry["id"])})
    FIGURES.save_json(RECEIPTS, old)
    return entries


def audit(records: list[dict], include_supplied: bool, qa_dir: Path) -> dict:
    receipts = {entry["id"]: entry for entry in read_json(RECEIPTS, {"entries": []})["entries"]}
    failures, warnings = [], []
    for record in records:
        entry = receipts.get(record["id"])
        if entry is None:
            failures.append(f"Missing receipt: {record['id']}")
            continue
        for field in ("source", "production", "preview"):
            path = REALM / entry[field]
            if not path.is_file() or FIGURES.sha256(path) != entry[field+"Sha256"]:
                failures.append(f"Missing/changed {field}: {record['id']}")
        if FIGURES.sha256(Path(record["generatedFile"])) != entry["sourceSha256"]:
            failures.append(f"Tool original differs: {record['id']}")
        with Image.open(REALM / entry["source"]) as opened:
            source = np.asarray(opened.convert("RGBA"))
        with Image.open(REALM / entry["production"]) as opened:
            production = np.asarray(opened.convert("RGBA"))
        padding = entry.get("framing", {}).get("padding", {"left": 0, "top": 0})
        x, y = padding["left"], padding["top"]
        if not np.array_equal(source[:, :, :3], production[y:y+source.shape[0], x:x+source.shape[1], :3]):
            failures.append(f"Production RGB differs: {record['id']}")
        if record["category"] == "emblems":
            circle = entry["framing"]["circle"]
            cx, cy = circle["centre"]
            yy, xx = np.ogrid[:production.shape[0], :production.shape[1]]
            disc = (xx-cx)**2 + (yy-cy)**2 <= circle["radius"]**2
            if not np.array_equal(production[:, :, 3] == 255, disc):
                failures.append(f"Emblem is not an opaque exact circle: {record['id']}")
        elif record["category"] == "banners":
            if source.shape != production.shape or entry["framing"]["circle"] is not None:
                failures.append(f"Banner shape/size changed: {record['id']}")
            elif np.any((source[:, :, 3] == 0) & (production[:, :, 3] > 0)):
                failures.append(f"Banner suspension gaps filled: {record['id']}")
    for category in sorted({record["category"] for record in records} & {"castes", "warriors"}):
        report = CategoryArtifacts(category, qa_dir).audit(None)
        failures.extend(report["failures"])
        warnings.extend(report["warnings"])
    originals = read_json(SOURCE_MANIFEST, {}).get("suppliedEmblems", []) if include_supplied else []
    if include_supplied and len(originals) != len(SUPPLIED):
        failures.append("Supplied emblem inventory is incomplete")
    for entry in originals:
        for path, digest in ((Path(entry["sourcePath"]), entry["sha256"]),
                             (REALM / entry["original"], entry["sha256"]),
                             (REALM / entry["preview"], entry["previewSha256"])):
            if not path.is_file() or FIGURES.sha256(path) != digest:
                failures.append(f"Supplied original/preview differs: {entry['id']}")
    report = {"generatedChecked": len(records), "suppliedChecked": len(originals),
              "failures": failures, "warnings": warnings}
    FIGURES.save_json(qa_dir / "audit.json", report)
    if failures:
        raise ValueError(json.dumps(report, ensure_ascii=False))
    return report


def contact(records: list[dict], include_supplied: bool, qa_dir: Path) -> None:
    entries = read_json(RECEIPTS, {"entries": []})["entries"]
    selected = {record["id"] for record in records}
    entries = [entry for entry in entries if entry["id"] in selected]
    if include_supplied:
        entries += [{"id": entry["id"], "production": entry["original"]}
                    for entry in read_json(SOURCE_MANIFEST)["suppliedEmblems"]]
    for background, label in (("#f1efe8", "light"), ("#242832", "dark")):
        columns, width, picture, caption = 4, 300, 360, 28
        rows = max(1, (len(entries)+columns-1)//columns)
        sheet = Image.new("RGB", (columns*width, rows*(picture+caption)), background)
        draw = ImageDraw.Draw(sheet)
        for index, entry in enumerate(entries):
            with Image.open(REALM / entry["production"]) as opened:
                image = opened.convert("RGBA")
                image.thumbnail((width-20, picture-16), Image.Resampling.LANCZOS)
            left, top = (index%columns)*width, (index//columns)*(picture+caption)
            sheet.paste(image, (left+(width-image.width)//2, top+(picture-image.height)//2), image)
            draw.text((left+10, top+picture+6), entry["id"], fill="#222222" if label == "light" else "#eeeeee")
        qa_dir.mkdir(parents=True, exist_ok=True)
        sheet.save(qa_dir / f"contact-{label}.jpg", quality=95)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE_FOLDER)
    parser.add_argument("--manifest", type=Path, action="append", help="Read-only result manifest, relative to the realm; repeatable. Default: sources/art-generation-results.json.")
    parser.add_argument("--ids", nargs="+", help="Generation record IDs to prepare; default is the current explicit manifest.")
    parser.add_argument("--skip-originals", action="store_true")
    parser.add_argument("--check", action="store_true", help="Verify existing files without rebuilding images.")
    parser.add_argument("--contact", action="store_true", help="Write independent light/dark review sheets.")
    parser.add_argument("--lock-timeout", type=float, default=180, help="Maximum seconds waiting for the single asset writer; default: 180.")
    args = parser.parse_args()
    manifests = [path if path.is_absolute() else REALM/path for path in args.manifest] if args.manifest else [RESULTS]
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid4().hex[:8]
    qa_dir = QA / "runs" / run_id
    with LOCKS.asset_pipeline_lock(REALM / "sources/.asset-pipeline.lock", args.lock_timeout):
        records = generation_records(args.ids, manifests)
        if not args.check:
            if not args.skip_originals:
                prepare_supplied(args.source)
            prepare_generated(records, qa_dir)
        report = audit(records, not args.skip_originals, qa_dir)
        if args.contact:
            contact(records, not args.skip_originals, qa_dir)
    print(json.dumps({"status": "ok", "qaDirectory": qa_dir.relative_to(WORKSPACE).as_posix(), **report}, ensure_ascii=False))


if __name__ == "__main__":
    main()

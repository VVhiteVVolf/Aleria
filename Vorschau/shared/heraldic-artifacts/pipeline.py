"""Prepare circular emblems with the established, RGB-preserving alpha operation."""
from __future__ import annotations

import argparse
import hashlib
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageDraw

WORKSPACE = Path(__file__).resolve().parents[3]
spec = spec_from_file_location("country_shared_emblem_alpha", WORKSPACE / "AleriaAlmanach/scripts/heraldic_emblem_alpha.py")
heraldry = module_from_spec(spec)
spec.loader.exec_module(heraldry)


def digest(path: Path) -> str:
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


class HeraldicArtifacts:
    def __init__(self, *, root: Path, source_manifests: tuple[str, ...], qa_dir: Path):
        self.root = Path(root).resolve()
        self.source_manifests = source_manifests
        self.qa_dir = Path(qa_dir).resolve()

    def relative(self, path: Path) -> str:
        return path.relative_to(self.root).as_posix()

    def current(self, entry: dict) -> bool:
        return all((self.root / entry[key]).is_file() and digest(self.root / entry[key]) == entry[f"{key}Sha256"]
                   for key in ("source", "production", "preview"))

    def prepare(self, job: dict) -> dict:
        asset_id = job["assetStem"]
        original = self.root / f"assets/emblems/generated/{asset_id}.png"
        original_hash = digest(original)
        target = self.root / f"assets/emblems/production/{asset_id}.png"
        framing = heraldry.prepare_emblem_from_source(original, target, coverage=.88)
        with Image.open(original) as image:
            source_pixels = np.asarray(image.convert("RGBA"))
        with Image.open(target) as image:
            production = image.convert("RGBA")
            pixels = np.asarray(production)
        x, y = framing["padding"]["left"], framing["padding"]["top"]
        if not np.array_equal(source_pixels[:, :, :3], pixels[y:y+source_pixels.shape[0], x:x+source_pixels.shape[1], :3]):
            raise ValueError(f"RGB differs from generator original: {asset_id}")
        if digest(original) != original_hash:
            raise ValueError(f"Generator original changed: {asset_id}")
        preview = self.root / f"assets/emblems/previews/{asset_id}.webp"
        preview.parent.mkdir(parents=True, exist_ok=True)
        production.thumbnail((600, 600), Image.Resampling.LANCZOS)
        production.save(preview, "WEBP", quality=94, method=6, exact=True)
        return {"id": job["id"], "source": self.relative(original), "sourceSha256": original_hash,
                "production": self.relative(target), "productionSha256": digest(target),
                "preview": self.relative(preview), "previewSha256": digest(preview),
                "framing": framing, "originalUnchanged": True, "rgbUnchanged": True}

    def contact(self, entries: list[dict]) -> None:
        columns, tile, label = 4, 256, 24
        rows = (len(entries) + columns - 1) // columns
        sheet = Image.new("RGB", (columns * tile, rows * (tile + label)), (230, 230, 225))
        draw = ImageDraw.Draw(sheet)
        for index, entry in enumerate(entries):
            with Image.open(self.root / entry["production"]) as opened:
                image = opened.convert("RGBA")
                image.thumbnail((tile - 14, tile - 14), Image.Resampling.LANCZOS)
            left, top = index % columns * tile, index // columns * (tile + label)
            sheet.paste(image, (left + (tile-image.width)//2, top + (tile-image.height)//2), image)
            draw.text((left + 8, top + tile + 4), entry["id"], fill=(30, 30, 30))
        self.qa_dir.mkdir(parents=True, exist_ok=True)
        sheet.save(self.qa_dir / "contact-sheet.jpg", quality=95)

    def build(self, ids: list[str] | None) -> dict:
        jobs = []
        for name in self.source_manifests:
            source = self.root / "sources" / name
            if source.exists():
                jobs.extend(json.loads(source.read_text(encoding="utf-8"))["jobs"])
        revisions = {}
        for filename in ("house-emblem-revisions.json", "artwork-revisions.json"):
            revision_file = self.root / "sources" / filename
            if revision_file.exists():
                revisions.update(json.loads(revision_file.read_text(encoding="utf-8")))
        jobs = [{**job, "assetStem": revisions.get(job["id"], {}).get("assetStem", job["assetStem"])} for job in jobs]
        if len({job["id"] for job in jobs}) != len(jobs):
            raise ValueError("Duplicate heraldry jobs")
        if any(not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", job["assetStem"]) for job in jobs):
            raise ValueError("Invalid heraldry asset stem")
        if ids and set(ids) - {job["id"] for job in jobs}:
            raise ValueError("Unknown heraldry IDs")
        available = [job for job in jobs if (self.root / f"assets/emblems/generated/{job['assetStem']}.png").exists()]
        selected = [job for job in available if not ids or job["id"] in ids]
        if ids and len(selected) != len(ids):
            raise ValueError("Requested generator originals are not ready")
        manifest_path = self.root / "sources/emblem-asset-receipts.json"
        prior = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {"schemaVersion": 1, "entries": []}
        entries = {entry["id"]: entry for entry in prior["entries"]}
        prepared = []
        for job in selected:
            if (job["id"] in entries and entries[job["id"]]["source"] == f"assets/emblems/generated/{job['assetStem']}.png"
                    and self.current(entries[job["id"]])):
                continue
            entries[job["id"]] = self.prepare(job)
            prepared.append(job["id"])
        prior["entries"] = sorted(entries.values(), key=lambda entry: entry["id"])
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(prior, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if prior["entries"]:
            self.contact(prior["entries"])
        return {"prepared": prepared, "manifestEntries": len(entries), "skippedUnchanged": len(selected) - len(prepared)}


def main(*, root: Path, source_manifests: tuple[str, ...], qa_dir: Path) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ids", nargs="+")
    args = parser.parse_args()
    print(json.dumps(HeraldicArtifacts(root=root, source_manifests=source_manifests, qa_dir=qa_dir).build(args.ids)))

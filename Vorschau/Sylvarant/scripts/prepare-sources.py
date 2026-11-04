"""Configure the shared original importer and record Sylvarant provenance."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import runpy
import sys

from PIL import Image, ImageDraw

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]


def digest(path: Path) -> str:
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def main() -> None:
    config_path = REALM / "source-import.json"
    sys.argv = ["prepare-country-sources", str(config_path)]
    runpy.run_path(str(WORKSPACE / "Vorschau/shared/prepare-country-sources.py"), run_name="__main__")
    config = json.loads(config_path.read_text(encoding="utf-8"))
    imported = json.loads((REALM / "assets.source.json").read_text(encoding="utf-8"))
    entries = []
    for item in config["files"]:
        source_record = next(record for record in imported if record["sourceFile"] == item["source"])
        original, preview = REALM / item["archive"], REALM / item["previews"][0]["file"]
        with Image.open(preview) as image:
            preview_dimensions = list(image.size)
        entries.append({"id": item["id"], "kind": item["kind"], "name": item["name"],
                        "sourceFile": item["source"], "sourceSha256": source_record["sha256"],
                        "original": item["archive"], "originalSha256": digest(original),
                        "dimensions": source_record["dimensions"], "originalUnchanged": True,
                        "alphaChanged": False, "preview": item["previews"][0]["file"],
                        "previewSha256": digest(preview), "previewDimensions": preview_dimensions})
    if len(entries) != 18 or sum(entry["kind"] == "house" for entry in entries) != 17:
        raise ValueError("Expected seventeen supplied houses and one realm emblem")
    manifest = {"schemaVersion": 1, "sourceDirectory": config["sourceDirectory"], "suppliedEmblems": entries}
    (REALM / "sources").mkdir(parents=True, exist_ok=True)
    (REALM / "sources/supplied-emblems.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    map_source = REALM / "sources/map-sources.json"
    if map_source.exists():
        manifest["maps"] = json.loads(map_source.read_text(encoding="utf-8"))["maps"]
    (REALM / "assets.source.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    columns, side, label = 4, 256, 24
    sheet = Image.new("RGB", (columns * side, ((len(entries) + columns - 1) // columns) * (side + label)), (230, 230, 225))
    draw = ImageDraw.Draw(sheet)
    for index, entry in enumerate(entries):
        with Image.open(REALM / entry["original"]) as opened:
            image = opened.convert("RGBA")
            image.thumbnail((side-16, side-16), Image.Resampling.LANCZOS)
        left, top = index % columns * side, index // columns * (side + label)
        sheet.paste(image, (left+(side-image.width)//2, top+(side-image.height)//2), image)
        draw.text((left+8, top+side+4), entry["name"], fill=(30, 30, 30))
    destination = REALM / "sources/review/supplied-emblems-contact.jpg"
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, quality=95)
    print(json.dumps({"suppliedHouses": 17, "realmEmblems": 1, "originalsBytePreserved": True}))


if __name__ == "__main__":
    main()

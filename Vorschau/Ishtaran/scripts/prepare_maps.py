"""Create bounded, image-faithful WebP views of the user-supplied maps."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


MAP_SOURCES = (
    ("normal", "Ishtaran (Normal).png", "ishtaran-normal.webp"),
    ("regions", "Ishtaran Regionen.png", "ishtaran-regions.webp"),
)


def sha256(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    originals = Path.home() / "Downloads/Länder/Ishtaran"
    outputs = root / "assets/maps"
    outputs.mkdir(parents=True, exist_ok=True)
    entries = []
    for asset_id, original_name, output_name in MAP_SOURCES:
        original = originals / original_name
        before = sha256(original)
        output = outputs / output_name
        with Image.open(original) as source:
            source_dimensions = list(source.size)
            source_mode = source.mode
            image = source.convert("RGBA")
            image.thumbnail((4096, 4096), Image.Resampling.LANCZOS)
            image.save(output, "WEBP", quality=90, method=6, exact=True)
        with Image.open(output) as saved:
            dimensions = list(saved.size)
            saved.verify()
        if sha256(original) != before:
            raise ValueError(f"Original changed during conversion: {original_name}")
        entries.append({
            "id": asset_id,
            "originalName": original_name,
            "originalPath": str(original),
            "originalBytes": original.stat().st_size,
            "originalSha256": before,
            "originalDimensions": source_dimensions,
            "originalMode": source_mode,
            "originalUnchanged": True,
            "originalCopiedIntoRepository": False,
            "image": f"assets/maps/{output_name}",
            "dimensions": dimensions,
            "bytes": output.stat().st_size,
            "sha256": sha256(output),
            "processing": {
                "format": "WebP",
                "maxWidth": 4096,
                "resampling": "Lanczos",
                "quality": 90,
                "method": 6,
                "aspectRatioPreserved": True,
                "crop": False,
                "labelsEdited": False,
                "boundariesEdited": False,
                "newAssignments": [],
            },
        })
    manifest = {
        "country": "Ishtaran",
        "preparedAt": "2026-11-03",
        "authorization": "The user supplied the two new maps and explicitly authorized their use in the current task.",
        "sourceOriginalsRetainedOutsideRepository": True,
        "oldIshtaranMapUsed": False,
        "zoomVariant": None,
        "zoomDecision": "4096-pixel views retain readable original labels and provide sufficient detail for the present map view; no second, larger payload is needed.",
        "entries": entries,
        "visualReview": {
            "reviewed": True,
            "normal": "Grünbraune Landflächen mit gegliederter Küste, weit ins Land reichenden Wasserläufen, größeren Wasserflächen, mehreren Gebirgsgruppen, Hügeln, Felsformationen und verteilten Wäldern. Wolken verdecken Teile der unteren und seitlichen Ränder. Keine Siedlungsnamen sind eingezeichnet.",
            "regions": "Dieselbe Geografie mit farbig unterlegten Gebietsflächen und roten Grenzlinien. Die gelieferten Bezeichnungen Pascharat und Herrschaft sowie große weiße und kleinere farbig umrandete Ringmarker bleiben unverändert sichtbar.",
            "interpretationLimit": "Keine eigenen Regionsnamen, Hauszuordnungen, Stadtnamen oder Bedeutungen der einzelnen Marker ergänzt.",
        },
    }
    destination = root / "sources/map-sources.json"
    destination.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"prepared": [{"id": entry["id"], "dimensions": entry["dimensions"], "bytes": entry["bytes"]} for entry in entries]}, ensure_ascii=False))


if __name__ == "__main__":
    main()

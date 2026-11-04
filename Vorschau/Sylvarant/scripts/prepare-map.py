"""Read Sylvarant's supplied map, reusing the existing marker measurement."""
from importlib.util import module_from_spec, spec_from_file_location
import hashlib
import json
from pathlib import Path
import sys

from PIL import Image

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
SOURCE = Path("C:/Users/fhg_r/Downloads/L\u00e4nder/Das Kaiserreich Argentum/Sylvarant/Kaiserreich (Sylvarant).png")
spec = spec_from_file_location("existing_argentum_map_measurement", WORKSPACE / "Vorschau/Calidaria/scripts/prepare-map-sources.py")
measurement = module_from_spec(spec)
spec.loader.exec_module(measurement)


def digest(path: Path) -> str:
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def main() -> None:
    target = REALM / "assets/maps/sylvarant.webp"
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE) as opened:
        dimensions = list(opened.size)
        markers = measurement.marker_components(opened)
        markers = [entry for entry in markers if .8 <= (entry['bbox'][2]-entry['bbox'][0])/(entry['bbox'][3]-entry['bbox'][1]) <= 1.2]
        image = opened.convert("RGB")
        image.thumbnail((4096, 4096), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=94, method=6)
    if len(markers) != 26:
        raise ValueError("Expected 26 visually reviewed source markers")
    record = {"id": "regions", "number": 1, "short": "Gelieferte Karte", "file": SOURCE.name,
              "sourcePath": str(SOURCE), "sourceSha256": digest(SOURCE), "sourceImageSize": dimensions,
              "originalRetained": True, "map": target.relative_to(REALM).as_posix(), "sha256": digest(target),
              "imageSize": list(image.size), "noGeometryEdits": True, "sourceMarkers": markers,
              "bakedNames": True, "bakedCityLabels": ["Hauptstadt"]}
    manifest = {"schemaVersion": 1, "maps": [record], "visualReview": {
        "archonates": 7, "imperialDomains": 1, "settlements": 26,
        "circles": 18, "squares": 7, "diamonds": 1,
        "notes": "Im ungeteilten blauen Südostgebiet steht Archonat zweimal. Ohne eine trennende Grenze wird kein zusätzliches Archonat erfunden."
    }}
    (REALM / "sources/map-sources.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    source_manifest = REALM / "assets.source.json"
    prior = json.loads(source_manifest.read_text(encoding="utf-8"))
    prior["maps"] = [record]
    source_manifest.write_text(json.dumps(prior, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"sourceSize": dimensions, "webSize": list(image.size), "markers": len(markers)}))


if __name__ == "__main__":
    main()

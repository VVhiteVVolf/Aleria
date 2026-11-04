"""Prepare the two aligned maps; measure places only from the marked regions map."""
from importlib.util import module_from_spec, spec_from_file_location
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
SOURCE = Path("C:/Users/fhg_r/Downloads/L\u00e4nder/Solestia")
MAPS = (("normal", "Solestia (Normal).png", "Landschaft"), ("regions", "Solestia Regionen.png", "Baronien"))
spec = spec_from_file_location("existing_map_source_measurement", WORKSPACE / "Vorschau/Calidaria/scripts/prepare-map-sources.py")
measurement = module_from_spec(spec)
spec.loader.exec_module(measurement)


def digest(path):
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def main():
    with Image.open(SOURCE / MAPS[1][1]) as image:
        source_size = list(image.size)
        markers = measurement.marker_components(image)
    if len(markers) != 10 or markers[0]["area"] < 12000 or any(marker["area"] > 7000 for marker in markers[1:]):
        raise ValueError("Expected the reviewed northern diamond and nine square source markers")
    records = []
    for number, (map_id, filename, label) in enumerate(MAPS, 1):
        source = SOURCE / filename
        target = REALM / f"assets/maps/solestia-{map_id}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as opened:
            if list(opened.size) != source_size:
                raise ValueError("The supplied maps no longer share their source dimensions")
            image = opened.convert("RGB")
            image.thumbnail((4096, 4096), Image.Resampling.LANCZOS)
            image.save(target, "WEBP", quality=94, method=6)
        records.append({"id": map_id, "number": number, "file": filename, "short": label,
                        "sourcePath": str(source), "sourceSha256": digest(source), "sourceImageSize": source_size,
                        "originalRetained": True, "map": target.relative_to(REALM).as_posix(), "sha256": digest(target),
                        "imageSize": list(image.size), "noGeometryEdits": True, "bakedNames": False,
                        "sourceMarkers": markers, "anchorsSource": MAPS[1][1],
                        "markersDrawnInSource": map_id == "regions", "regionLabelsBaked": map_id == "regions"})
    manifest = {"schemaVersion": 1, "maps": records, "sourceRetained": True, "anchorsFromDrawnMarkers": True,
                "visualReview": {"settlements": 10, "baronies": 9, "ducalDomains": 1, "squares": 9, "diamonds": 1,
                                 "notes": "Die Landschaftskarte besitzt keine Ortszeichen. Beide Karten sind deckungsgleich; Anker stammen unverändert aus der Regionenkarte."}}
    (REALM / "sources").mkdir(parents=True, exist_ok=True)
    (REALM / "sources/map-sources.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    source_manifest = REALM / "assets.source.json"
    existing = json.loads(source_manifest.read_text(encoding="utf-8"))
    existing["maps"] = records
    source_manifest.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"maps": len(records), "sourceSize": source_size, "settlements": len(markers), "webSize": records[0]["imageSize"]}))


if __name__ == "__main__":
    main()

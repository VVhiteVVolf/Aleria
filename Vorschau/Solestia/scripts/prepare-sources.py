"""Configure the shared original importer and record the supplied ducal emblem."""
import hashlib
import json
from pathlib import Path
import runpy
import sys
from PIL import Image

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]

if __name__ == "__main__":
    config_path = REALM / "source-import.json"
    sys.argv = ["prepare-country-sources", str(config_path)]
    runpy.run_path(str(WORKSPACE / "Vorschau/shared/prepare-country-sources.py"), run_name="__main__")
    config = json.loads(config_path.read_text(encoding="utf-8"))
    imported = json.loads((REALM / "assets.source.json").read_text(encoding="utf-8"))
    entries = []
    for item, record in zip(config["files"], imported, strict=True):
        original, preview = REALM / item["archive"], REALM / item["previews"][0]["file"]
        with Image.open(preview) as image:
            preview_size = list(image.size)
        entries.append({"id": item["id"], "kind": item["kind"], "name": item["name"],
                        "sourceFile": item["source"], "sourceSha256": record["sha256"],
                        "original": item["archive"], "originalSha256": hashlib.sha256(original.read_bytes()).hexdigest(),
                        "dimensions": record["dimensions"], "originalUnchanged": True, "alphaChanged": False,
                        "preview": item["previews"][0]["file"], "previewSha256": hashlib.sha256(preview.read_bytes()).hexdigest(),
                        "previewDimensions": preview_size})
    manifest = {"schemaVersion": 1, "sourceDirectory": config["sourceDirectory"], "suppliedEmblems": entries}
    (REALM / "sources").mkdir(parents=True, exist_ok=True)
    (REALM / "sources/supplied-emblems.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    maps = REALM / "sources/map-sources.json"
    if maps.exists():
        manifest["maps"] = json.loads(maps.read_text(encoding="utf-8"))["maps"]
    (REALM / "assets.source.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"suppliedEmblems": len(entries), "originalsBytePreserved": True}))

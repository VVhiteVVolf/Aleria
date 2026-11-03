"""Apply the requested pool-07 wing edit using the existing authorized alpha helper."""
from pathlib import Path
import hashlib
import importlib.util
import json
import shutil
import numpy as np
from PIL import Image

COUNTRY = Path(__file__).resolve().parents[1]
ROOT = COUNTRY.parents[1]
RECEIPT = COUNTRY / "sources/pool-07-wing-fix-20261103-v1.json"


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    receipt = json.loads(RECEIPT.read_text(encoding="utf-8"))
    tool_original = Path(receipt["generatedFile"])
    archive = COUNTRY / "assets/emblems/generated-archive/pool-07-wing-fix-20261103-v1"
    archive.mkdir(parents=True, exist_ok=True)
    edited_archive = archive / "edited-generator.png"
    if edited_archive.exists() and sha(edited_archive) != sha(tool_original):
        raise ValueError("Versioned edited source already exists with other bytes.")
    shutil.copy2(tool_original, edited_archive)
    for original in receipt["originalArchive"]:
        assert sha(COUNTRY / original["file"]) == original["sha256"]
    warrior_files = [
        COUNTRY / f"assets/warriors/{folder}/pool-07.{extension}"
        for folder, extension in (("generated", "png"), ("production", "png"), ("previews", "webp"))
    ]
    warrior_hashes = {str(path.relative_to(COUNTRY)): sha(path) for path in warrior_files}
    source = COUNTRY / "assets/emblems/generated/pool-07.png"
    target = COUNTRY / "assets/emblems/production/pool-07.png"
    preview_path = COUNTRY / "assets/emblems/previews/pool-07.webp"
    shutil.copy2(tool_original, source)
    spec = importlib.util.spec_from_file_location("pool07_authorized_alpha", ROOT / "AleriaAlmanach/scripts/heraldic_emblem_alpha.py")
    helper = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helper)
    report = helper.prepare_emblem_from_source(source, target, coverage=.88)
    assert sha(source) == sha(tool_original) == sha(edited_archive)
    production = Image.open(target).convert("RGBA")
    alpha = np.array(production.getchannel("A"))
    yy, xx = np.ogrid[:production.height, :production.width]
    cx, cy = report["circle"]["centre"]
    expected = (xx - cx) ** 2 + (yy - cy) ** 2 <= report["circle"]["radius"] ** 2
    assert np.array_equal(alpha == 255, expected)
    assert set(np.unique(alpha)) == {0, 255}
    preview = production.copy()
    preview.thumbnail((600, 600), Image.Resampling.LANCZOS)
    preview.save(preview_path, format="WEBP", lossless=True, exact=True)
    assert preview.getchannel("A").tobytes() == Image.open(preview_path).convert("RGBA").getchannel("A").tobytes()
    generation_path = COUNTRY / "sources/emblem-generation.json"
    generation = json.loads(generation_path.read_text(encoding="utf-8"))
    record = next(record for record in generation["records"] if record["id"] == "pool-07")
    record.update({
        "name": "Unzugeordnetes Wappen 07 – Goldener Adler",
        "motif": "Goldener Adler mit genau einem sichtbaren, rechts oben ausgebreiteten Flügel und kompaktem Körper auf Nachtgrün.",
        "prompt": receipt["editPrompt"],
        "referenced_image_paths": [receipt["editReference"]],
        "generatedFile": str(tool_original),
        "output_hint": receipt["output_hint"],
        "sourceSha256": sha(source), "sha256": sha(target), "previewSha256": sha(preview_path),
        "size": report["size"], "mode": "RGBA", "previewAlphaIdentical": True,
        "validationStatus": "passed", "validationNote": "Requested local extra-wing correction; authorized alpha-only circle preparation preserves edited RGB.",
        "alphaPreparation": report, "editReceipt": "sources/pool-07-wing-fix-20261103-v1.json",
    })
    generation_path.write_text(json.dumps(generation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    audit_update = {
        "sourceSha256": sha(source), "productionSha256": sha(target),
        "previewSha256": sha(preview_path), "previewSize": list(preview.size),
        "previewAlphaIdentical": True, "exactCircle": True, "interiorAlpha": 255, "exteriorAlpha": 0,
        "originalUnchanged": True, **report,
    }
    for name in ("emblem-alpha-audit.json", "emblem-alpha-audit.final.json"):
        path = COUNTRY / "sources" / name
        data = json.loads(path.read_text(encoding="utf-8"))
        audit_record = next(record for record in data["records"] if record["id"] == "pool-07")
        receipt.setdefault("previousAuditRecord", dict(audit_record))
        audit_record.update(audit_update)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    assert all(sha(COUNTRY / path) == digest for path, digest in warrior_hashes.items())
    receipt.update({
        "status": "prepared-pending-final-visual-review",
        "editedGeneratorArchive": str(edited_archive.relative_to(COUNTRY)),
        "sourceSha256": sha(source), "productionSha256": sha(target), "previewSha256": sha(preview_path),
        "alphaPreparation": report, "exactCircle": True, "interiorAlpha": 255, "exteriorAlpha": 0,
        "rgbUnchangedByAlphaPreparation": True, "toolOriginalUnchanged": True,
        "beforeVersionsVerified": True, "warriorPool07Unchanged": warrior_hashes,
        "visualCandidateReview": "Extra folded foreground wing removed; one raised rear wing remains; torso compact, head/legs/tail and frame visually preserved.",
    })
    RECEIPT.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"id": "pool-07", "status": receipt["status"], "report": report}))


if __name__ == "__main__":
    main()

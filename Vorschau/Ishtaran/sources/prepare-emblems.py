"""Prepare Ishtaran's generated emblem pool with the existing shared alpha helper.

Authorization: user explicitly approved technical transparency cleanup on 2026-11-03.
Only alpha and transparent padding change. Generator sources are preserved.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

COUNTRY = Path(__file__).resolve().parents[1]
ROOT = COUNTRY.parents[1]
HELPER = ROOT / "AleriaAlmanach/scripts/heraldic_emblem_alpha.py"
MANIFEST = COUNTRY / "sources/emblem-generation.json"
DIAGNOSTICS = ROOT / "diagnostics/ishtaran"
EXPECTED_IDS = [f"pool-{number:02d}" for number in range(1, 27)]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_shared_preparer():
    spec = importlib.util.spec_from_file_location("ishtaran_heraldic_alpha", HELPER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.prepare_emblem_from_source


def prepare_record(record, prepare):
    source = COUNTRY / record["generatedArchive"]
    target = COUNTRY / record["production"]
    source_hash = digest(source)
    report = prepare(source, target, coverage=.88)
    assert digest(source) == source_hash, "Generator original changed."
    final = Image.open(target).convert("RGBA")
    pixels = np.asarray(final)
    alpha = pixels[:, :, 3]
    centre_x, centre_y = report["circle"]["centre"]
    yy, xx = np.ogrid[:final.height, :final.width]
    expected = (xx - centre_x) ** 2 + (yy - centre_y) ** 2 <= report["circle"]["radius"] ** 2
    assert np.array_equal(alpha == 255, expected)
    assert set(np.unique(alpha)) == {0, 255}
    preview = final.copy()
    preview.thumbnail((600, 600), Image.Resampling.LANCZOS)
    preview_path = COUNTRY / record["preview"]
    preview_path.parent.mkdir(parents=True, exist_ok=True)
    preview.save(preview_path, format="WEBP", lossless=True, exact=True)
    preview_check = Image.open(preview_path).convert("RGBA")
    assert preview.getchannel("A").tobytes() == preview_check.getchannel("A").tobytes()
    audit = {
        "id": record["id"],
        "source": record["generatedArchive"],
        "sourceSha256": source_hash,
        "production": record["production"],
        "productionSha256": digest(target),
        "preview": record["preview"],
        "previewSha256": digest(preview_path),
        "previewSize": list(preview.size),
        "previewAlphaIdentical": True,
        "exactCircle": True,
        "interiorAlpha": 255,
        "exteriorAlpha": 0,
        "originalUnchanged": True,
        **report,
    }
    record.update({
        "sourceSha256": source_hash,
        "sha256": audit["productionSha256"],
        "previewSha256": audit["previewSha256"],
        "size": report["size"],
        "mode": "RGBA",
        "previewAlphaIdentical": True,
        "validationStatus": "passed",
        "validationNote": "User-authorized shared alpha cleanup and exact circular framing; original RGB pixels retained with transparent padding.",
        "alphaPreparation": report,
    })
    return audit


def contact_sheets(records):
    DIAGNOSTICS.mkdir(parents=True, exist_ok=True)
    paths = []
    for offset in range(0, len(records), 7):
        group = records[offset:offset + 7]
        sheet = Image.new("RGB", (len(group) * 230, 520), "white")
        draw = ImageDraw.Draw(sheet)
        for column, record in enumerate(group):
            emblem = Image.open(COUNTRY / record["production"]).convert("RGBA")
            for row, background in enumerate(("#f4ead6", "#182731")):
                tile = Image.new("RGBA", emblem.size, background)
                tile.alpha_composite(emblem)
                thumb = ImageOps.contain(tile.convert("RGB"), (220, 220))
                x, y = column * 230 + 5, row * 260 + 7
                sheet.paste(thumb, (x, y))
                draw.text((x + 4, y + 228), record["id"], fill="black")
        path = DIAGNOSTICS / f"emblems-final-{offset + 1:02d}-{offset + len(group):02d}-light-dark.jpg"
        sheet.save(path, quality=95)
        paths.append(str(path.relative_to(ROOT)))
    return paths


def main():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    initial_audit = COUNTRY / "sources/emblem-alpha-audit.json"
    original_audit = COUNTRY / "sources/emblem-alpha-audit.generator.json"
    if initial_audit.exists() and not original_audit.exists():
        original_audit.write_bytes(initial_audit.read_bytes())
    records = sorted(data["records"], key=lambda record: record["id"])
    assert [record["id"] for record in records] == EXPECTED_IDS, "Expected all 26 unassigned pool emblems."
    prepare = load_shared_preparer()
    audits = [prepare_record(record, prepare) for record in records]
    data["records"] = records
    data["qualityStatus"] = "passed"
    data["qualityNote"] = "Exact opaque circular production masks; fully transparent exterior; every original RGB pixel retained in the padded canvas."
    data["alphaAuthorization"] = {
        "date": "2026-11-03",
        "quote": "Ja, Transparenz technisch bereinigen",
        "helper": "AleriaAlmanach/scripts/heraldic_emblem_alpha.py",
        "operation": "prepare_emblem_from_source(source, target, coverage=.88)",
    }
    sheets = contact_sheets(records)
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    audit = {
        "schemaVersion": 1,
        "authorization": data["alphaAuthorization"],
        "count": len(audits),
        "status": "passed",
        "contactSheets": sheets,
        "records": audits,
    }
    (COUNTRY / "sources/emblem-alpha-audit.final.json").write_text(
        json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    initial_audit.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"count": len(audits), "status": "passed", "contactSheets": sheets}))


if __name__ == "__main__":
    main()

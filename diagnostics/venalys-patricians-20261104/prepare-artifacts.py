"""Admit three tool originals through Venalys' existing RGB-preserving pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import shutil
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
REALM = ROOT / "Vorschau/Venalys"
QA = Path(__file__).resolve().parent
spec = spec_from_file_location("venalys_art_adapter", REALM / "prepare-warriors.py")
adapter = module_from_spec(spec)
spec.loader.exec_module(adapter)
pipeline = adapter.pipeline
artifacts = pipeline.WarriorArtifacts(root=REALM, schema="aleria.venalys.warrior-artifacts", qa_dir=QA)
result_path = REALM / "sources/patrician-warriors-20261104-results.json"
results = json.loads(result_path.read_text(encoding="utf-8"))
ids = [record["id"] for record in results["records"]]
assert set(ids) == {"vinicius", "tullius", "arentino"}

# Keep the original audit inputs, and prove all older figures and crests survive.
baseline_path = QA / "preserved-assets-before.json"
if not baseline_path.exists():
    manifest = artifacts.read_manifest()
    protected = [REALM / entry[key] for entry in manifest["entries"] if entry["id"] not in ids
                 for key in ("source", "production", "preview")]
    protected += list((REALM / "assets/crests").glob("*.webp"))
    protected += list((REALM / "assets/originals").glob("*.png"))
    pipeline.save_json(baseline_path, {path.relative_to(ROOT).as_posix(): pipeline.sha256(path)
                                       for path in protected})
    pipeline.save_json(QA / "warrior-manifest-before.json", manifest)
    shutil.copyfile(REALM / "sources/alpha-receipts.json", QA / "alpha-receipts-before.json")

for record in results["records"]:
    source, target = Path(record["generatedFile"]), REALM / record["workspaceOriginal"]
    digest = pipeline.sha256(source)
    if target.exists() and pipeline.sha256(target) != digest:
        raise ValueError(f"Preserve differing original first: {record['id']}")
    if not target.exists():
        shutil.copyfile(source, target)
    assert pipeline.sha256(target) == digest
    record["sha256"] = digest

artifacts.build(ids, pipeline.DEFAULT_PROCESSING)
expected = adapter.expected_ids()
assert {entry["id"] for entry in artifacts.read_manifest()["entries"]} == set(expected)
audit = artifacts.audit(expected_count=len(expected))
if audit["failures"]:
    raise ValueError(audit["failures"])
for asset_id in ids:
    artifacts.review(asset_id)
artifacts.contact(columns=4, rows=6)

protected = json.loads(baseline_path.read_text(encoding="utf-8"))
assert all(pipeline.sha256(ROOT / file) == digest for file, digest in protected.items())
pipeline.save_json(QA / "preservation-check.json", {"checkedFiles": len(protected), "allUnchanged": True})
pipeline.save_json(result_path, results)
receipt_path = REALM / "sources/alpha-receipts.json"
receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
receipt["warriors"] = {"expectedIds": expected, "manifest": "assets/warriors/manifest.json", "audit": audit}
pipeline.save_json(receipt_path, receipt)
print(json.dumps({"prepared": ids, "totalWarriors": len(expected), "preservedFiles": len(protected)}))

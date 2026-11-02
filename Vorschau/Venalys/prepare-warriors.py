"""Venalys adapter for the shared alpha-preserving warrior artifact pipeline."""
from __future__ import annotations

import argparse
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parent
ROOT = REALM.parents[1]
spec = spec_from_file_location("venalys_warrior_artifacts", REALM.parent / "shared/warrior-artifacts/pipeline.py")
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)


def expected_ids() -> list[str]:
    catalog = REALM / "warrior-data.mjs"
    if catalog.exists():
        node = shutil.which("node")
        if not node:
            raise RuntimeError("Node is required to read the authored warrior catalog")
        script = f"import {{warriors}} from {json.dumps(catalog.as_uri())}; console.log(JSON.stringify(warriors.map(w=>w.id)));"
        result = subprocess.run([node, "--input-type=module", "-e", script], check=True, capture_output=True, text=True, encoding="utf-8")
        ids = json.loads(result.stdout)
    else:
        plans = json.loads((REALM / "sources/house-plans.json").read_text(encoding="utf-8"))
        ids = [house["id"] for house in plans["houses"]] + ["falveri", "falto"]
    if not ids or len(ids) != len(set(ids)):
        raise ValueError("Expected warrior IDs are empty or duplicated")
    return ids


def verify(artifacts, expected: list[str]) -> dict:
    entries = artifacts.read_manifest()["entries"]
    actual = {entry["id"] for entry in entries}
    if actual != set(expected):
        raise ValueError(f"Warrior IDs differ. Missing: {sorted(set(expected)-actual)}; extra: {sorted(actual-set(expected))}")
    report = artifacts.audit(expected_count=len(expected))
    if report["failures"]:
        raise ValueError(report["failures"])
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--warriors", action="store_true", help="Explicit warrior stage (the default)")
    parser.add_argument("--ids", nargs="+", help="Prepare only these authored IDs; final --check remains complete")
    parser.add_argument("--check", action="store_true", help="Audit every expected warrior; never skips missing art")
    parser.add_argument("--review", action="store_true", help="Create gray review images and a contact sheet")
    args = parser.parse_args()
    if args.ids and args.check:
        parser.error("--check always audits all expected warriors; omit --ids")
    expected = expected_ids()
    selected = args.ids or expected
    if not set(selected).issubset(expected):
        parser.error("Unknown warrior ID")
    artifacts = pipeline.WarriorArtifacts(root=REALM, schema="aleria.venalys.warrior-artifacts", qa_dir=ROOT / "diagnostics/venalys-20261102/warriors")
    if args.check:
        report = verify(artifacts, expected)
    else:
        missing = [asset_id for asset_id in selected if not (REALM / f"assets/warriors/generated/{asset_id}.png").is_file()]
        if missing:
            raise ValueError(f"Generated warriors still missing: {', '.join(missing)}")
        artifacts.build(selected, pipeline.DEFAULT_PROCESSING)
        if args.review:
            for asset_id in selected:
                artifacts.review(asset_id)
            entries = artifacts.read_manifest()["entries"]
            artifacts.contact(rows=(len(entries) + 3) // 4)
        if args.ids:
            actual = {entry["id"] for entry in artifacts.read_manifest()["entries"]}
            if not actual.issubset(expected):
                raise ValueError("Prepared warrior manifest contains unauthored IDs")
            report = verify(artifacts, expected) if actual == set(expected) else artifacts.audit(expected_count=None)
            if report["failures"]:
                raise ValueError(report["failures"])
            report.update({"prepared": selected, "expectedTotal": len(expected),
                           "missingIds": sorted(set(expected) - actual), "finalAuditPending": actual != set(expected)})
        else:
            report = verify(artifacts, expected)
    receipts = REALM / "sources/alpha-receipts.json"
    if not args.check:
        value = json.loads(receipts.read_text(encoding="utf-8")) if receipts.exists() else {"schemaVersion": 1, "permission": "Ja, Alpha bereinigen – geltende Nutzerfreigabe", "crests": []}
        value["warriors"] = {"expectedIds": expected, "manifest": "assets/warriors/manifest.json", "audit": report}
        pipeline.save_json(receipts, value)
    print(json.dumps({"status": "ok", "mode": "check" if args.check else "prepare", **report}, ensure_ascii=False))


if __name__ == "__main__":
    main()

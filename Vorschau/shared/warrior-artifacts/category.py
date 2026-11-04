"""Explicit category configuration for the RGB-preserving figure artifact pipeline."""
import argparse
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import re
import shutil
import sys

sys.dont_write_bytecode = True
spec = spec_from_file_location("category_figure_pipeline", Path(__file__).with_name("pipeline.py"))
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)


class CategoryArtifacts(pipeline.WarriorArtifacts):
    def __init__(self, *, category, **configuration):
        if not re.fullmatch(r"[a-z]+", category):
            raise ValueError("Invalid artifact category")
        super().__init__(**configuration)
        self.assets = self.root / "assets" / category
        self.manifest = self.assets / "manifest.json"


def main(*, root, schema, category, result_names, expected_count, qa_dir):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Audit existing originals and production without rebuilding")
    args = parser.parse_args()
    artifacts = CategoryArtifacts(root=root,schema=schema,category=category,qa_dir=qa_dir)
    records = []
    for filename in result_names:
        data = json.loads((root / "sources" / filename).read_text(encoding="utf-8-sig"))
        records.extend(data.get("records", data.get("entries", [])))
    ids = [record["assetStem"] for record in records]
    if len(ids) != expected_count or len(set(ids)) != expected_count:
        raise ValueError("Unexpected or duplicate figure originals")
    for record in records:
        stem = record["assetStem"]
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", stem):
            raise ValueError("Invalid asset filename")
        source = Path(record["generatedFile"])
        target = artifacts.assets / "generated" / f"{stem}.png"
        digest = pipeline.sha256(source)
        if record.get("sha256") and record["sha256"] != digest:
            raise ValueError(f"Tool original differs from its receipt: {stem}")
        if args.check and not target.is_file():
            raise ValueError(f"Original missing: {target}")
        if target.exists() and pipeline.sha256(target) != digest:
            raise ValueError(f"Preserve differing original before replacing: {target}")
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source,target)
        if pipeline.sha256(target) != digest:
            raise ValueError(f"Original copy differs: {stem}")
    if not args.check:
        artifacts.build(ids,dict(pipeline.DEFAULT_PROCESSING))
    report = artifacts.audit(expected_count=expected_count)
    if report["failures"]:
        raise SystemExit(1)
    if not args.check:
        artifacts.contact(columns=3,rows=(expected_count+2)//3)

"""Klythesia estate art: explicit configuration of the shared figure pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location("klythesia_estates", WORKSPACE / "Vorschau/shared/warrior-artifacts/category.py")
category = module_from_spec(spec)
spec.loader.exec_module(category)

if __name__ == "__main__":
    category.main(root=REALM, schema="aleria.klythesia.estates", category="estates", expected_count=8,
        result_names=("estate-generation-receipts.json",),
        qa_dir=WORKSPACE / "diagnostics/klythesia-expansion-20261104/estates")

"""Venalys' five comic estates, using the shared category figure pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys
sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location("venalys_estates", WORKSPACE / "Vorschau/shared/warrior-artifacts/category.py")
category = module_from_spec(spec)
spec.loader.exec_module(category)
if __name__ == "__main__":
    category.main(root=REALM,schema="aleria.venalys.estates",category="estates",expected_count=5,
        result_names=("estates-a-results.json","estates-b-results.json"),
        qa_dir=WORKSPACE / "diagnostics/venalys-20261104/estates")

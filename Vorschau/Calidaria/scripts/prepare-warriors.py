"""Calidaria configuration for the shared, RGB-preserving figure pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location("calidaria_warrior_artifacts", WORKSPACE / "Vorschau/shared/warrior-artifacts/pipeline.py")
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)

if __name__ == "__main__":
    pipeline.main(root=REALM, schema="aleria.calidaria.warriors",
                  qa_dir=WORKSPACE / "diagnostics/argentum-calidaria/warriors")

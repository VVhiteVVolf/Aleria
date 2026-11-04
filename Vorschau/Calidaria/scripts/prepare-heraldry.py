"""Calidaria configuration for shared circular heraldry preparation."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location("calidaria_heraldic_artifacts", WORKSPACE / "Vorschau/shared/heraldic-artifacts/pipeline.py")
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)

if __name__ == "__main__":
    pipeline.main(root=REALM, source_manifests=("heraldry-colony-jobs.json", "heraldry-tlapanui-a-jobs.json",
                  "heraldry-tlapanui-b-jobs.json", "province-heraldry-jobs.json"),
                  qa_dir=WORKSPACE / "diagnostics/argentum-calidaria/emblems")

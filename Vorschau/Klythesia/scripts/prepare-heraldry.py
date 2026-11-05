"""Klythesia wrapper for the shared, RGB-preserving circular crest pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location(
    'klythesia_heraldic_artifacts',
    WORKSPACE / 'Vorschau/shared/heraldic-artifacts/pipeline.py',
)
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)

if __name__ == '__main__':
    pipeline.main(
        root=REALM,
        source_manifests=('heraldry/additional-emblem-jobs.json',),
        qa_dir=WORKSPACE / 'diagnostics/klythesia-expansion-20261104/heraldry',
        manifest_name='heraldry-asset-receipts.json',
    )

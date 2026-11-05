"""Prepare only Klythesia's country-sign Thorax, apart from classes and houses."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location(
    'klythesia_realm_warrior_artifacts',
    WORKSPACE / 'Vorschau/shared/warrior-artifacts/pipeline.py',
)
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)

if __name__ == '__main__':
    pipeline.main(
        root=REALM,
        schema='aleria.klythesia.realm-warrior',
        qa_dir=WORKSPACE / 'diagnostics/klythesia-expansion-20261104/realm-warrior',
        asset_ids=['realm-klythesia'],
        manifest_name='realm-manifest.json',
    )

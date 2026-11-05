"""Keep Klythesia's seven house Thorax figures separate from class prototypes."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import json
import sys

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location(
    'klythesia_house_warrior_artifacts',
    WORKSPACE / 'Vorschau/shared/warrior-artifacts/pipeline.py',
)
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)

if __name__ == '__main__':
    source = json.loads((REALM / 'sources/house-warrior-art-direction.json').read_text(encoding='utf-8'))
    pipeline.main(
        root=REALM,
        schema='aleria.klythesia.house-warriors',
        qa_dir=WORKSPACE / 'diagnostics/klythesia-expansion-20261104/house-warriors',
        asset_ids=[entry['id'] for entry in source['entries']],
        manifest_name='house-manifest.json',
    )

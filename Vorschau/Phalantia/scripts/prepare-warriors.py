"""Phalantia configuration for the shared RGB-preserving warrior pipeline."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys
import json

sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location("phalantia_warrior_artifacts", WORKSPACE / "Vorschau/shared/warrior-artifacts/pipeline.py")
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)

if __name__ == "__main__":
    revision_path = REALM / 'sources/warrior-art-revisions.json'
    revisions = json.loads(revision_path.read_text(encoding='utf8')) if revision_path.exists() else {}
    overrides = {value['assetStem']:value['alphaProcessing'] for value in revisions.values()
                 if value.get('alphaProcessing')}
    source = json.loads((REALM/'sources/warrior-art-direction.json').read_text(encoding='utf8'))
    owned_ids = sorted({entry['id'] for entry in source['entries']} |
                       {value['assetStem'] for value in revisions.values()})
    pipeline.main(root=REALM, schema="aleria.phalantia.warriors", qa_dir=WORKSPACE / "diagnostics/phalantia/warriors",
                  processing_overrides=overrides, asset_ids=owned_ids)

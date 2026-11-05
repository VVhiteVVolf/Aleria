"""Prepare hoplon region shields with their own shared-pipeline receipts."""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys
sys.dont_write_bytecode = True
REALM = Path(__file__).resolve().parents[1]
WORKSPACE = REALM.parents[1]
spec = spec_from_file_location('phalantia_region_shields',WORKSPACE/'Vorschau/shared/heraldic-artifacts/pipeline.py')
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)
if __name__ == '__main__':
    pipeline.main(root=REALM,source_manifests=('regional-shield-jobs.json',),
                  qa_dir=WORKSPACE/'diagnostics/phalantia/regions',
                  manifest_name='region-shield-asset-receipts.json')

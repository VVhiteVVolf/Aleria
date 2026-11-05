"""Use the shared RGB-preserving figure pipeline with an isolated receipt file."""
from importlib.util import module_from_spec,spec_from_file_location
from pathlib import Path
import sys
import json
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
WORKSPACE=ROOT.parents[1]
spec=spec_from_file_location('phalantia_house_b_artifacts',WORKSPACE/'Vorschau/shared/warrior-artifacts/pipeline.py')
pipeline=module_from_spec(spec)
spec.loader.exec_module(pipeline)
if __name__=='__main__':
    artifacts=pipeline.WarriorArtifacts(root=ROOT,schema='aleria.phalantia.house-warriors-b',qa_dir=WORKSPACE/'diagnostics/phalantia/warriors-b')
    artifacts.manifest=ROOT/'sources/house-warriors-b-asset-receipts.json'
    jobs=json.loads((ROOT/'sources/house-warriors-b-jobs.json').read_text(encoding='utf8'))['jobs']
    ids=[job['assetStem'] for job in jobs]
    if len(ids)!=4 or len(set(ids))!=4: raise ValueError('Expected four selected B-house figures')
    if sys.argv[1:]==['build']:
        manifest=artifacts.read_manifest()
        old=[entry for entry in manifest['entries'] if entry['id'] not in ids]
        if old:
            manifest.setdefault('supersededEntries',[]).extend(old)
            manifest['entries']=[entry for entry in manifest['entries'] if entry['id'] in ids]
            pipeline.save_json(artifacts.manifest,manifest)
        for job in jobs:
            processing={**pipeline.DEFAULT_PROCESSING,**job.get('alphaProcessing',{})}
            artifacts.build([job['assetStem']],processing)
    elif sys.argv[1:]==['audit']:
        if artifacts.audit(4)['failures']: raise SystemExit(1)
    elif sys.argv[1:]==['contact']:
        artifacts.contact(columns=4,rows=1)
    else:
        raise SystemExit('Use build, audit or contact')

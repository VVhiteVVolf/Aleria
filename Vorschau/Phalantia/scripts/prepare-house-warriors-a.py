"""Prepare only the five assigned house figures using shared RGB-safe processing."""
import argparse
import json
from importlib.util import module_from_spec,spec_from_file_location
from pathlib import Path
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]
spec = spec_from_file_location('phalantia_house_warriors_a',WORKSPACE/'Vorschau/shared/warrior-artifacts/pipeline.py')
pipeline = module_from_spec(spec)
spec.loader.exec_module(pipeline)

def preserve_superseded_entries(artifacts, active):
    value = artifacts.read_manifest()
    archived = {entry['id']:entry for entry in value.get('supersededEntries',[]) if entry['id'] not in active}
    for entry in value['entries']:
        if entry['id'] not in active: archived[entry['id']] = entry
    value['entries'] = [entry for entry in value['entries'] if entry['id'] in active]
    value['supersededEntries'] = sorted(archived.values(),key=lambda entry:entry['id'])
    pipeline.save_json(artifacts.manifest,value)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['build','audit','contact'])
    parser.add_argument('--ids',nargs='+')
    args = parser.parse_args()
    artifacts = pipeline.WarriorArtifacts(root=ROOT,schema='aleria.phalantia.house-warriors-a',qa_dir=WORKSPACE/'diagnostics/phalantia/warriors-a')
    artifacts.manifest = ROOT/'sources/house-warriors-a-asset-receipts.json'
    jobs = json.loads((ROOT/'sources/house-warriors-a-jobs.json').read_text(encoding='utf8'))['jobs']
    active = [job['assetStem'] for job in jobs]
    allowed = set(active)
    if args.command == 'build':
        selected = args.ids or active
        if set(selected)-allowed: raise ValueError('Unexpected house figure')
        artifacts.build(selected,pipeline.DEFAULT_PROCESSING)
        preserve_superseded_entries(artifacts,allowed)
    elif args.command == 'audit':
        if artifacts.audit(expected_count=5)['failures']: raise SystemExit(1)
    else: artifacts.contact(columns=3,rows=2)

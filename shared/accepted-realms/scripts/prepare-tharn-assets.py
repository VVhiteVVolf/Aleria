"""Explicit, user-authorized alpha preparation of Tharn's two new houses.

Reuses the project heraldry and warrior processors. Originals and source RGB
remain intact; only alpha and transparent heraldic padding change.
"""
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import hashlib
import json
import shutil
import sys
from PIL import Image

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / 'shared/accepted-realms/sources/tharn-20261102'
PREVIEW = ROOT / 'Vorschau/Aeldrunmar'
QA = ROOT / 'diagnostics/tharn-houses-20261102'


def load_module(name, file):
    spec = spec_from_file_location(name, ROOT / file)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def main():
    heraldry = load_module('tharn_heraldic_alpha', 'AleriaAlmanach/scripts/heraldic_emblem_alpha.py')
    warriors = load_module('tharn_warrior_pipeline', 'Vorschau/shared/warrior-artifacts/pipeline.py')
    plans = json.loads((SOURCE / 'art-prompts.json').read_text(encoding='utf-8'))['houses']
    ids, crests, originals = [], [], []
    for house in plans:
        house_id = house['id']
        ids.append(house_id)
        raw_crest = SOURCE / f'raw/{house_id}-crest.png'
        raw_warrior = SOURCE / f'raw/{house_id}-warrior.png'
        hashes = {file.name: sha(file) for file in [raw_crest, raw_warrior]}
        production = PREVIEW / f'assets/production/{house_id}.png'
        frame = heraldry.prepare_emblem_from_source(raw_crest, production, coverage=.88)
        crest_preview = PREVIEW / f'assets/crests/{house_id}.webp'
        crest_preview.parent.mkdir(parents=True, exist_ok=True)
        web = Image.open(production).convert('RGBA')
        web.thumbnail((600, 600), Image.Resampling.LANCZOS)
        web.save(crest_preview, 'WEBP', quality=94, method=6, exact=True)
        generated = PREVIEW / f'assets/warriors/generated/{house_id}.png'
        generated.parent.mkdir(parents=True, exist_ok=True)
        if generated.exists() and sha(generated) != sha(raw_warrior):
            raise ValueError(f'Unexpected existing warrior source: {house_id}')
        if not generated.exists():
            shutil.copyfile(raw_warrior, generated)
        for file in [raw_crest, raw_warrior]:
            assert sha(file) == hashes[file.name], 'Generator original changed'
        originals.append({'id': house_id, 'originals': hashes})
        crests.append({'id': house_id, **frame, 'sourceSha256': hashes[raw_crest.name],
                       'productionSha256': sha(production), 'previewSha256': sha(crest_preview)})
    artifacts = warriors.WarriorArtifacts(root=PREVIEW, schema='aleria.aeldrunmar.warrior-artifacts', qa_dir=QA)
    artifacts.build(ids, warriors.DEFAULT_PROCESSING)
    for house_id in ids:
        artifacts.review(house_id)
    report = artifacts.audit(expected_count=37)
    if report['failures']:
        raise ValueError(report['failures'])
    QA.mkdir(parents=True, exist_ok=True)
    (SOURCE / 'alpha-receipts.json').write_text(json.dumps({
        'permission': 'Existing user approval: Ja, Alpha bereinigen; originals and RGB retained.',
        'crests': crests, 'originals': originals, 'warriorAudit': report,
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'crests': len(crests), 'warriors': len(ids), 'originalsPreserved': True}))


if __name__ == '__main__':
    main()

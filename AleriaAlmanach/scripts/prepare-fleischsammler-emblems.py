"""Admit the eight selected ImageGen crests through the shared heraldry processor."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

sys.dont_write_bytecode = True
from heraldic_emblem_alpha import ROOT, prepare_emblem_from_source

DIAGNOSTICS = ROOT / 'diagnostics/fleischsammler-quest-20261102'
receipt = json.loads((DIAGNOSTICS / 'wappen-generation.json').read_text(encoding='utf-8'))
source_directory = DIAGNOSTICS / 'image-sources'
source_directory.mkdir(exist_ok=True)
checks = []
for asset in receipt['variants']:
    original = Path(asset['original'])
    source = source_directory / f"haus-{asset['slug']}-generator.png"
    if source.exists() and source.read_bytes() != original.read_bytes():
        raise RuntimeError(f'Abweichendes Quelloriginal: {source}')
    if not source.exists():
        shutil.copy2(original, source)
    target = ROOT / asset['file']
    report = prepare_emblem_from_source(source, target, coverage=.88)
    checks.append({'family': asset['slug'], 'source': source.relative_to(ROOT).as_posix(),
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'target': asset['file'], 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), **report})
(DIAGNOSTICS / 'wappen-verification.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(checks))

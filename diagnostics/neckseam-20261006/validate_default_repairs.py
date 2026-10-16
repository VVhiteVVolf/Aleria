"""Validate staged builds and record exact before/after hashes for deployment."""
import hashlib
import json
import shutil
import sys
from pathlib import Path
from audit import INSTANCE
from neck_geometry import shapes
from nif_links import header, normalize_bodytri

ROOT = Path(__file__).parent
STAGE = ROOT / 'default-repair-build'
TARGET = INSTANCE / 'MODS/mods/Local - New Downloads OBody Output 20261006'


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    statuses = json.loads((STAGE / 'build-status.json').read_text())
    if len(statuses) != 3 or not all(s['success'] for s in statuses):
        raise ValueError('Not all correction groups completed')
    rows = []
    failures = []
    unchanged = 0
    for generated in sorted((STAGE / 'output').rglob('*')):
        if not generated.is_file():
            continue
        relative = generated.relative_to(STAGE / 'output').as_posix()
        old = TARGET / relative
        if not old.is_file():
            failures.append('No original output: ' + relative)
            continue
        if generated.suffix.casefold() == '.nif':
            tri_relative = relative[:-6] + '.tri' if relative.casefold().endswith(('_0.nif', '_1.nif')) else relative[:-4] + '.tri'
            data, edits = normalize_bodytri(generated.read_bytes(), tri_relative.casefold())
            if edits:
                generated.write_bytes(data)
            header(generated.read_bytes())
        old_hash, new_hash = digest(old), digest(generated)
        if old_hash == new_hash:
            unchanged += 1
            continue
        if generated.suffix.casefold() == '.tri':
            failures.append('Morph table changed unexpectedly: ' + relative)
        if relative.casefold().endswith('_1.nif'):
            old_shapes, new_shapes = shapes(old), shapes(generated)
            if [(s['name'], s['vertices']) for s in old_shapes] != [(s['name'], s['vertices']) for s in new_shapes]:
                failures.append('Weight 100 geometry changed: ' + relative)
            else:
                failures.append('Weight 100 binary differs despite same positions: ' + relative)
        rows.append({'relative': relative, 'target': str(old), 'source': str(generated),
                     'old_sha256': old_hash, 'new_sha256': new_hash, 'bytes': generated.stat().st_size})
    expected = json.loads((ROOT / 'build-default-audit.json').read_text())['affected_projects']
    if sum(s['projects'] for s in statuses) != expected:
        failures.append('Project count mismatch')
    result = {'verified': not failures, 'projects': expected, 'unchanged_files': unchanged,
              'changed_files': len(rows), 'failures': failures, 'files': rows}
    (ROOT / 'repair-validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in result.items() if k != 'files'}, indent=2), flush=True)
    if failures:
        raise ValueError('Repair validation failed; see repair-validation.json')


if __name__ == '__main__':
    main()

"""Capture changed mods and private state for later migration; read game files only."""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
BASE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
MODS = BASE / 'MODS/mods'


def main():
    receipt = json.loads((ROOT / 'installation.json').read_text())
    names = [p['new'] for p in receipt['updates']] + [
        'SkyrimNet - Beta25 Test Runtime 20260927', 'SkyrimNet - Beta 25 Local Compatibility',
        'SkyrimNet - Lever Interaction']
    files = {}
    for name in names:
        folder = MODS / name
        for path in folder.rglob('*'):
            if path.is_file() and not any(part in ('models', 'logs', 'screenshots') for part in path.relative_to(folder).parts):
                files['mods/' + path.relative_to(MODS).as_posix()] = path
    for path in (BASE / 'MODS/profiles').glob('*/*'):
        if path.name in ('modlist.txt', 'plugins.txt', 'loadorder.txt'):
            files['profiles/' + path.relative_to(BASE / 'MODS/profiles').as_posix()] = path
    files['repair/ERGEBNIS.txt'] = ROOT / 'ERGEBNIS.txt'
    files['repair/installation.json'] = ROOT / 'installation.json'
    target = ROOT / 'migration-after.zip'
    hashes = {}
    with zipfile.ZipFile(target, 'x', zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
        for member, path in sorted(files.items()):
            hashes[member] = hashlib.sha256(path.read_bytes()).hexdigest()
            archive.write(path, member)
        archive.writestr('SHA256.json', json.dumps(hashes, indent=2))
    with zipfile.ZipFile(target) as archive:
        for member, expected in hashes.items():
            assert hashlib.sha256(archive.read(member)).hexdigest() == expected
    result = {'status': 'VERIFIED_MIGRATION_ADDENDUM_NOT_FULL_BACKUP', 'files': len(files),
              'bytes': target.stat().st_size, 'archive_sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
    (ROOT / 'migration-after.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()

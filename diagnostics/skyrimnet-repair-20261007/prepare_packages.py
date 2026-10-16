"""Prepare complete updated mods, identifying every local customization first."""
import hashlib
import json
import re
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET
from fomod_install import build

ROOT = Path(__file__).parent
MODS = Path(r'E:\Nolvus\Instances\Nolvus Awakening\MODS\mods')
PACKAGES = [
    ('SeverActions 3.9.14 - Beta 25', 'SeverActions 4.2.0', 'Severause--SeverActions', '4.2.0'),
    ('OStimNet 2.5.2 - SkyrimNet 25', 'OStimNet 2.5.4 - SkyrimNet 25', 'tetherball88--OStimNet', '2.5.4'),
    ('NarrativeEngine 0.6.0', 'NarrativeEngine 0.7.1', 'pdusen--skyrimnet-plugin-narrative-engine', '0.7.1'),
    ('OStim Navigator', 'OStim Navigator 2.2.1', 'tetherball88--OStimNavigator', '2.2.1'),
]


def sha(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def old_archive_path(mod):
    meta = (mod / 'meta.ini').read_text(encoding='utf-8-sig')
    name = re.search(r'^installationFile=(.*)$', meta, re.M)[1].strip()
    path = Path(name)
    if path.is_file():
        return path
    if mod.name == 'OStim Navigator':
        duplicate = MODS / 'OStim Navigator 2.2.0'
        for f in mod.rglob('*'):
            if f.is_file() and f.name != 'meta.ini':
                assert f.read_bytes() == (duplicate / f.relative_to(mod)).read_bytes()
        return old_archive_path(duplicate)
    raise FileNotFoundError('Original archive not found: ' + name)


def old_file_digests(archive_path):
    with zipfile.ZipFile(archive_path) as archive:
        if 'fomod/ModuleConfig.xml' not in archive.namelist():
            return {n.casefold(): hashlib.sha256(archive.read(n)).hexdigest()
                    for n in archive.namelist() if not n.endswith('/')}
        config = ET.fromstring(archive.read('fomod/ModuleConfig.xml'))
        mapping = {}
        for entry in config.iter():
            if entry.tag not in ('folder', 'file') or 'source' not in entry.attrib:
                continue
            source = entry.attrib['source'].replace('\\', '/').rstrip('/')
            dest = entry.attrib.get('destination', '').replace('\\', '/').rstrip('/')
            for name in archive.namelist():
                if name.endswith('/'):
                    continue
                if entry.tag == 'folder' and name.startswith(source + '/'):
                    rel = '/'.join(filter(None, (dest, name[len(source) + 1:])))
                elif entry.tag == 'file' and name == source:
                    rel = dest if Path(dest).suffix else '/'.join(filter(None, (dest, Path(source).name)))
                else:
                    continue
                mapping.setdefault(rel.casefold(), set()).add(hashlib.sha256(archive.read(name)).hexdigest())
        return mapping


def main():
    plan_file = ROOT / 'package-plan.json'
    report = json.loads(plan_file.read_text()) if plan_file.exists() else []
    for old, new, repo, version in PACKAGES:
        source = ROOT / 'upstream' / repo
        dest = ROOT / 'stage' / new
        if dest.exists():
            assert any(item['new'] == new for item in report), 'Untracked existing stage'
            continue
        fomod = build(source, dest) if repo == 'Severause--SeverActions' else None
        if fomod is None:
            shutil.copytree(source, dest)
        old_mod = MODS / old
        defaults = old_file_digests(old_archive_path(old_mod))
        preserved, conflicts = [], []
        for path in old_mod.rglob('*'):
            if not path.is_file() or path.name == 'meta.ini':
                continue
            rel = path.relative_to(old_mod)
            hashes = defaults.get(rel.as_posix().casefold(), set())
            if isinstance(hashes, str):
                hashes = {hashes}
            if sha(path) in hashes:
                continue
            # Generated state and user configuration survive complete replacement.
            safe = path.suffix.lower() in ('.ini', '.json', '.db', '.sqlite', '.log')
            unsafe_root = 'SkyrimNet/external/' in rel.as_posix() or 'SkyrimNet/config/plugins/' in rel.as_posix()
            if safe and not unsafe_root:
                target = dest / rel
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, target)
                preserved.append(rel.as_posix())
            else:
                conflicts.append(rel.as_posix())
        release = json.loads((ROOT / 'releases' / (repo + '.json')).read_text())[0]
        archive = next(a for a in release['assets'] if 'Pre-25' not in a['name'])
        meta = (old_mod / 'meta.ini').read_text(encoding='utf-8-sig')
        updates = {'version': version, 'installationFile': str(ROOT / 'downloads' / archive['name']).replace('\\', '/'),
                   'url': release['html_url'], 'hasCustomURL': 'true'}
        for key, value in updates.items():
            if re.search('^' + key + '=', meta, re.M):
                meta = re.sub('^' + key + '=.*$', key + '=' + value, meta, flags=re.M)
            else:
                meta += '\n' + key + '=' + value + '\n'
        (dest / 'meta.ini').write_text(meta, encoding='utf-8')
        report.append({'old': old, 'new': new, 'version': version, 'fomod': fomod,
                       'preserved_local_files': preserved, 'review_conflicts': conflicts})
    (ROOT / 'package-plan.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    for item in report:
        print(json.dumps({k: v for k, v in item.items() if k != 'fomod'}))
    assert not any(item['review_conflicts'] for item in report), 'Review local modifications before installation'


if __name__ == '__main__':
    main()

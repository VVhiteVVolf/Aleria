"""Install verified staging folders, then commit the selected MO2 profile."""
from pathlib import Path
import configparser
import hashlib
import json
import re
import shutil
import subprocess
import time
import xml.etree.ElementTree as ET

OUT = Path(__file__).parent
PLAN = json.loads((OUT / 'deployment-plan.json').read_text(encoding='utf-8'))
INSTANCE = Path(PLAN['instance'])
MODS = INSTANCE / 'MODS/mods'
PROFILE = INSTANCE / 'MODS/profiles' / PLAN['profile']
CONFIG = MODS / 'BodySlide and Outfit Studio/CalienteTools/BodySlide/Config.xml'


def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


def assert_closed():
    result = subprocess.run(['powershell', '-NoProfile', '-Command',
        "@(Get-Process SkyrimSE,ModOrganizer,BodySlide,BodySlide_x64 -ErrorAction SilentlyContinue).Count"],
        capture_output=True, text=True, check=True)
    if result.stdout.strip() != '0':
        raise RuntimeError('Skyrim, MO2 or BodySlide is open; no profile commit allowed')


def protected_files():
    names = [line[1:] for line in (PROFILE / 'modlist.txt').read_text(encoding='utf-8-sig').splitlines()
             if line.startswith('+')]
    paths = set()
    for name in names:
        if any(word in name.casefold() for word in ('skyrimnet', 'ostimnet', 'intelengine', 'prisma', 'compatibility', 'obody')):
            paths.update(p for p in (MODS / name).rglob('*') if p.is_file())
    paths.update(p for p in (PROFILE / 'saves').rglob('*') if p.is_file())
    return {str(p): sha(p) for p in sorted(paths)}


def metadata(mod):
    version = '2026.10.06'
    if mod.get('nexus_id'):
        match = re.search(r'-' + str(mod['nexus_id']) + r'-(.*?)-\d{9,11}', mod['archive'])
        if match:
            version = match[1].replace('-', '.')
        else:
            match = re.search(r'\b' + str(mod['nexus_id']) + r'\s+([\w.]+)', mod['archive'])
            if match:
                version = match[1]
    info = OUT / 'metadata' / mod['archive'] / 'info.xml'
    if info.is_file():
        try:
            root = ET.parse(info).getroot()
            version = root.findtext('Version') or root.findtext('version') or version
        except ET.ParseError:
            pass
    config = configparser.ConfigParser(interpolation=None)
    config.optionxform = str
    config['General'] = {'gameName': 'Skyrim Special Edition', 'modid': str(mod.get('nexus_id') or 0),
        'version': version, 'installationFile': mod['archive'],
        'comments': 'Installed 2026-10-06; verified local receipt: installation-receipt.json. '
                    'Local compatibility changes are documented in INSTALLATIONSBERICHT.md.'}
    with (Path(mod['directory']) / 'meta.ini').open('w', encoding='utf-8') as stream:
        config.write(stream, space_around_delimiters=False)


def main():
    assert_closed()
    if (OUT / 'deployment-result.json').exists():
        raise FileExistsError('Deployment already has a receipt; inspect before any rerun')
    for mod in PLAN['mods']:
        source = Path(mod['directory'])
        assert source.parent == OUT / 'mod-stage' and source.name == mod['name']
        if (MODS / source.name).exists():
            raise FileExistsError(MODS / source.name)
        for path in source.rglob('*'):
            assert not path.is_symlink() and not path.is_junction(), str(path)
    assert not (MODS / PLAN['separator']).exists()
    required = sum(p.stat().st_size for m in PLAN['mods'] for p in Path(m['directory']).rglob('*') if p.is_file())
    assert shutil.disk_usage(MODS).free > required + 10 * 2**30
    before = OUT / 'before'
    before.mkdir(exist_ok=False)
    for name in ('modlist.txt', 'plugins.txt', 'loadorder.txt'):
        shutil.copy2(PROFILE / name, before / name)
    shutil.copy2(CONFIG, before / 'BodySlide.Config.xml')
    shutil.copy2(INSTANCE / 'MO2/ModOrganizer.ini', before / 'ModOrganizer.ini')
    protected = protected_files()
    save('protected-before.json', protected)
    manifests = []
    created = []
    started = time.time()
    try:
        for i, mod in enumerate(PLAN['mods'], 1):
            source = Path(mod['directory'])
            metadata(mod)
            receipt = {'source_archive': mod['archive'], 'selected_options': mod.get('choices', []),
                       'nexus_id': mod.get('nexus_id'), 'date': '2026-10-06',
                       'profile': PLAN['profile'], 'body_build_validation': 'build-validation.json',
                       'local_changes_report': str(OUT / 'INSTALLATIONSBERICHT.md')}
            (source / 'installation-receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding='utf-8')
            destination = MODS / source.name
            created.append(destination)
            shutil.copytree(source, destination, copy_function=shutil.copy2)
            rows = []
            for p in source.rglob('*'):
                if not p.is_file():
                    continue
                relative = p.relative_to(source)
                target = destination / relative
                digest = sha(p)
                assert target.stat().st_size == p.stat().st_size and sha(target) == digest, str(target)
                rows.append({'relative': relative.as_posix(), 'bytes': p.stat().st_size, 'sha256': digest})
            manifests.append({'mod': source.name, 'files': rows})
            save('deployment-status.json', {'stage': 'copy-verified', 'mods_done': i, 'mods_total': len(PLAN['mods'])})
            print(f'Copied and SHA-256 verified {i}/{len(PLAN["mods"])}: {source.name}', flush=True)
        separator = MODS / PLAN['separator']
        separator.mkdir()
        created.append(separator)
        (separator / 'meta.ini').write_text('[General]\nmodid=0\nversion=1.0\n', encoding='utf-8')
        # Only update the output path; preserve all other XML bytes and preferences.
        data = CONFIG.read_bytes()
        target = str(MODS / PLAN['mods'][-1]['name']) + '\\'
        updated, count = re.subn(rb'(<OutputDataPath>).*?(</OutputDataPath>)',
            lambda match: match[1] + target.encode('utf-8') + match[2], data, count=1, flags=re.S)
        assert count == 1
        assert_closed()
        for name in ('modlist.txt', 'plugins.txt', 'loadorder.txt'):
            expected = (before / name).read_bytes()
            assert (PROFILE / name).read_bytes() == expected, f'{name} changed concurrently'
        # No original mod folder is overwritten or removed.
        assert all(Path(p).is_file() and sha(p) == digest for p, digest in protected.items())
        CONFIG.write_bytes(updated)
        for name in ('modlist', 'plugins', 'loadorder'):
            temp = PROFILE / (name + '.new-downloads.tmp')
            shutil.copy2(OUT / (name + '.after.txt'), temp)
            temp.replace(PROFILE / (name + '.txt'))
        save('deployed-file-manifest.json', manifests)
        result = {'completed': True, 'profile': PLAN['profile'], 'mods': len(manifests),
                  'files': sum(len(m['files']) for m in manifests), 'plugin_counts': PLAN['plugin_counts'],
                  'new_plugins': len(PLAN['new_plugins']), 'disabled_mods': PLAN['disabled_mods'],
                  'protected_files_unchanged': len(protected), 'bytes': required,
                  'elapsed_seconds': round(time.time() - started, 1), 'backup': str(before),
                  'created_directories': [str(p) for p in created]}
        save('deployment-result.json', result)
        print(json.dumps(result, ensure_ascii=False, indent=2), flush=True)
    except Exception:
        for name in ('modlist.txt', 'plugins.txt', 'loadorder.txt'):
            shutil.copy2(before / name, PROFILE / name)
        shutil.copy2(before / 'BodySlide.Config.xml', CONFIG)
        save('deployment-failure.json', {'profile_restored': True, 'created_directories': [str(p) for p in created]})
        # Leave installed but inactive folders for diagnosis instead of deleting data.
        raise


if __name__ == '__main__':
    main()

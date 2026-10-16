"""Validate effective providers, masters, compiled functions and release integrity."""
import collections
import hashlib
import json
import sys
import zipfile
from pathlib import Path
import yaml

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile
from plugin_reader import records, text
sys.path.insert(0, r'E:\Aleria\diagnostics\skyrimnet-repair-20261007')
from papyrus_reader import functions


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main():
    installed = '--installed' in sys.argv
    profile = selected_profile(INSTANCE)
    plans = json.loads((ROOT / 'package-plan.json').read_text())
    substitutes = {p['old']: ROOT / 'stage' / p['new'] for p in plans}
    sources = []
    retired = {'OStim Navigator 2.2.0'}
    for name, path in profile['sources']:
        if not installed and name in retired:
            continue
        if not installed and (ROOT / 'overrides' / name).is_dir():
            sources.append(('planned fixes for ' + name, ROOT / 'overrides' / name))
        sources.append((name, path if installed else substitutes.get(name, path)))
    script_providers, dll_providers, plugins, skn_files = {}, {}, {}, {}
    dll_copies = collections.defaultdict(list)
    related = []
    for name, path in sources:
        if not path.exists():
            continue
        for directory, extension, index in [('Scripts', '.pex', script_providers),
                                           ('SKSE/Plugins', '.dll', dll_providers)]:
            folder = path / directory
            if folder.is_dir():
                for f in folder.iterdir():
                    if f.is_file() and f.suffix.lower() == extension:
                        index.setdefault(f.name.lower(), f)
                        if extension == '.dll':
                            dll_copies[f.name.lower()].append({'mod': name, 'file': str(f)})
        for f in path.iterdir():
            if f.is_file() and f.suffix.lower() in ('.esp', '.esm', '.esl'):
                plugins.setdefault(f.name.lower(), f)
        root = path / 'SKSE/Plugins/SkyrimNet'
        if root.is_dir():
            related.append(name)
            for f in root.rglob('*'):
                if f.is_file() and f.suffix.lower() in ('.json', '.yaml', '.prompt'):
                    rel = f.relative_to(root)
                    if not any(p in ('logs', 'data', 'models', 'saves', 'screenshots', 'voices') for p in rel.parts):
                        skn_files.setdefault(rel.as_posix().lower(), f)
    counts = collections.Counter()
    active_names = {p.lower() for p in profile['plugins']}
    missing_masters = []
    for name in profile['plugins']:
        f = plugins[name.lower()]
        _, flags, _, values = next(records(f, (b'TES4',)))
        counts['light' if flags & 0x200 else 'full'] += 1
        for tag, data in values:
            if tag == b'MAST' and text(data).lower() not in active_names:
                missing_masters.append({'plugin': name, 'master': text(data)})

    parse_errors, bindings, binding_errors = [], [], []
    function_cache = {}
    for rel, f in skn_files.items():
        if not rel.endswith('.yaml') or '/actions/' not in rel:
            continue
        try:
            document = yaml.safe_load(f.read_text(encoding='utf-8-sig'))
        except Exception as error:
            parse_errors.append({'file': str(f), 'error': str(error)})
            continue
        if not isinstance(document, dict) or not document.get('scriptName') or not document.get('executionFunctionName'):
            continue
        script = document['scriptName']
        execution = document['executionFunctionName']
        pex = script_providers.get(script.lower() + '.pex')
        row = {'action': document.get('name'), 'script': script, 'function': execution,
               'pex': str(pex) if pex else None, 'file': str(f)}
        if pex:
            if pex not in function_cache:
                function_cache[pex] = {name.casefold() for names in functions(pex).values() for name in names}
            row['function_present'] = execution.casefold() in function_cache[pex]
        else:
            row['function_present'] = False
        bindings.append(row)
        if not row['function_present']:
            binding_errors.append(row)

    manifest_errors, manifests = [], []
    for rel, f in skn_files.items():
        if not rel.endswith('/manifest.json'):
            continue
        data = json.loads(f.read_text(encoding='utf-8-sig'))
        manifests.append({'id': data.get('id'), 'version': data.get('version'), 'file': str(f)})
        for requirement in data.get('mods', []):
            if requirement.get('required') and requirement.get('file', '').lower() not in active_names:
                manifest_errors.append({'id': data.get('id'), 'missing_plugin': requirement.get('file')})

    # Confirm current core is exactly its authenticated release, apart from known overlays.
    core = INSTANCE / 'MODS/mods/SkyrimNet - Beta 27' if installed else ROOT / 'stage/SkyrimNet - Beta 27'
    core_archive = INSTANCE / 'MODS/downloads/skyrimnet-beta27.zip'
    release = json.loads((ROOT / 'releases/MinLL--SkyrimNet-GamePlugin.json').read_text())[0]
    asset = next(a for a in release['assets'] if a['name'] == core_archive.name)
    assert 'sha256:' + digest(core_archive) == asset['digest']
    core_errors, core_count = [], 0
    with zipfile.ZipFile(core_archive) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            target = core / entry.filename
            if not target.is_file() or digest(target) != hashlib.sha256(archive.read(entry)).hexdigest():
                core_errors.append(entry.filename)
            core_count += 1
    duplicates = {name: rows for name, rows in dll_copies.items()
                  if len(rows) > 1 and any(t in name for t in ('skyrimnet', 'ostimnet', 'ostimnav', 'sever', 'narrative', 'intelengine', 'prisma', 'magelight'))}
    report = {'profile': profile['profile'], 'plugin_counts': dict(counts),
              'missing_masters': missing_masters, 'related_active_sources': related,
              'action_bindings_verified': len(bindings), 'binding_errors': binding_errors,
              'yaml_errors': parse_errors, 'manifest_errors': manifest_errors,
              'manifests': manifests, 'ai_dll_duplicates': duplicates,
              'core_release_files_checked': core_count, 'core_errors': core_errors,
              'bindings': bindings}
    output = 'installed-validation.json' if installed else 'staging-validation.json'
    (ROOT / output).write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k not in ('bindings', 'manifests')}, indent=2))
    assert not missing_masters and not parse_errors and not core_errors
    assert not binding_errors and not manifest_errors, 'Review registration problems'


if __name__ == '__main__':
    main()

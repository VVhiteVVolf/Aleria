"""Apply the reviewed plan transactionally; retain exact originals for rollback."""
import datetime
import hashlib
import json
import shutil
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
BASE = Path(r'E:\Nolvus\Instances\Nolvus Awakening').resolve()
MODS = BASE / 'MODS/mods'
PROFILES = BASE / 'MODS/profiles'
PROFILE = PROFILES / 'Nolvus Awakening - SkyrimNet Beta25 Test'
RUNTIME = MODS / 'SkyrimNet - Beta25 Test Runtime 20260927'
PERSONAL = MODS / 'SkyrimNet - Personal Prompt Import 20260927'
COMPAT = MODS / 'SkyrimNet - Beta 25 Local Compatibility'


def sha(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def stopped():
    result = subprocess.run(['powershell', '-NoProfile', '-Command',
        'Get-Process SkyrimSE,ModOrganizer -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id'],
        capture_output=True, text=True)
    assert not result.stdout.strip(), 'Skyrim or MO2 is running; stop before changing files'


def direct_child(path, parent):
    assert path.resolve().parent == parent.resolve(), 'Unexpected resolved move target'
    assert not path.is_symlink(), 'Do not move linked mod directories'


def main():
    stopped()
    assert not (ROOT / 'installation.json').exists(), 'This transaction was already applied'
    validation = json.loads((ROOT / 'staging-validation.json').read_text())
    for field in ('missing_masters', 'binding_errors', 'yaml_errors', 'manifest_errors', 'core_errors', 'ai_dll_duplicates'):
        assert not validation[field], 'Unresolved pre-install validation: ' + field
    plans = json.loads((ROOT / 'package-plan.json').read_text())
    patches = json.loads((ROOT / 'override-plan.json').read_text())
    new_payloads = {}
    for plan in plans:
        old, new = MODS / plan['old'], MODS / plan['new']
        direct_child(old, MODS); direct_child(new, MODS)
        assert old.is_dir() and not new.exists()
        stage = ROOT / 'stage' / plan['new']
        new_payloads[plan['new']] = {f.relative_to(stage).as_posix(): sha(f)
                                    for f in stage.rglob('*') if f.is_file()}
    for patch in patches:
        path = RUNTIME / patch['relative']
        assert path.resolve().is_relative_to(RUNTIME.resolve())
        assert (sha(path) if path.exists() else None) == patch['before_sha256'], 'Runtime changed since preparation'
        assert sha(ROOT / 'overrides' / patch['relative']) == patch['after_sha256']

    backup = ROOT / 'backup'
    backup.mkdir(exist_ok=False)
    (backup / 'mods').mkdir()
    (backup / 'profiles').mkdir()
    profile_originals = {}
    for directory in PROFILES.iterdir():
        if not directory.is_dir():
            continue
        for filename in ('modlist.txt', 'plugins.txt', 'loadorder.txt'):
            path = directory / filename
            if path.is_file():
                profile_originals[str(path)] = path.read_bytes()
                dest = backup / 'profiles' / directory.name / filename
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, dest)
    patched_paths = {str(RUNTIME / item['relative']) for item in patches}
    protected = {}
    with zipfile.ZipFile(backup / 'personal-state-before.zip', 'x', zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
        for mod in (RUNTIME, PERSONAL, COMPAT):
            for path in mod.rglob('*'):
                if not path.is_file():
                    continue
                rel = path.relative_to(mod)
                if any(part in ('models', 'logs', 'screenshots') for part in rel.parts):
                    continue
                archive.write(path, path.relative_to(MODS).as_posix())
                if str(path) not in patched_paths:
                    protected[str(path)] = sha(path)
        for name, content in profile_originals.items():
            archive.writestr('profiles/' + Path(name).relative_to(PROFILES).as_posix(), content)
    (backup / 'protected-before.json').write_text(json.dumps(protected, indent=2), encoding='utf-8')
    with zipfile.ZipFile(backup / 'personal-state-before.zip') as archive:
        assert archive.testzip() is None

    moved, created, patched = [], [], []
    try:
        stopped()
        for plan in plans:
            old = MODS / plan['old']
            destination = backup / 'mods' / plan['old']
            direct_child(destination, backup / 'mods')
            shutil.move(str(old), str(destination))
            moved.append((old, destination))
            new = MODS / plan['new']
            created.append(new)
            shutil.copytree(ROOT / 'stage' / plan['new'], new)
            for rel, expected in new_payloads[plan['new']].items():
                assert sha(new / rel) == expected, 'Installed package differs from validated stage'
        for patch in patches:
            path = RUNTIME / patch['relative']
            patched.append((path, path.read_bytes() if path.exists() else None))
            path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / 'overrides' / patch['relative'], path)
        renames = {plan['old']: plan['new'] for plan in plans}
        for filename, original in profile_originals.items():
            path = Path(filename)
            if path.name != 'modlist.txt':
                continue
            lines = original.decode('utf-8-sig').splitlines()
            updated = []
            for line in lines:
                if line[:1] in ('+', '-') and line[1:] in renames:
                    line = line[0] + renames[line[1:]]
                if path.parent == PROFILE and line in (
                    '+SkyrimNet - Personal Prompt Import 20260927', '+OStim Navigator 2.2.0'):
                    line = '-' + line[1:]
                updated.append(line)
            if updated != lines:
                path.write_bytes(('\r\n'.join(updated) + '\r\n').encode('utf-8-sig'))
        for path, expected in protected.items():
            assert sha(Path(path)) == expected, 'Unexpected change to protected personal state'
        for patch in patches:
            assert sha(RUNTIME / patch['relative']) == patch['after_sha256']
        for filename, original in profile_originals.items():
            if Path(filename).name != 'modlist.txt':
                assert Path(filename).read_bytes() == original, 'Plugin order or activation changed'
        receipt = {'status': 'INSTALLED_OFFLINE_VALIDATED_PENDING_GAME_TEST',
                   'timestamp': datetime.datetime.now().astimezone().isoformat(),
                   'profile': PROFILE.name, 'updates': [{k: p[k] for k in ('old', 'new', 'version')} for p in plans],
                   'patches': patches, 'protected_files_unchanged': len(protected),
                   'retired_in_current_profile': ['SkyrimNet - Personal Prompt Import 20260927', 'OStim Navigator 2.2.0'],
                   'plugin_activation_and_order': 'unchanged', 'backup': str(backup)}
        (ROOT / 'installation.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
        print(json.dumps({k: v for k, v in receipt.items() if k != 'patches'}, indent=2))
    except Exception:
        # Move unsuccessful new directories to this transaction's workspace, never delete them.
        failed = ROOT / 'failed-new-payloads'
        failed.mkdir(exist_ok=True)
        for new in reversed(created):
            if new.exists():
                direct_child(new, MODS)
                shutil.move(str(new), str(failed / new.name))
        for old, archived in reversed(moved):
            if archived.exists():
                shutil.move(str(archived), str(old))
        for path, original in reversed(patched):
            if original is None:
                if path.exists():
                    target = failed / 'runtime' / path.relative_to(RUNTIME)
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(path), str(target))
            else:
                path.write_bytes(original)
        for filename, original in profile_originals.items():
            Path(filename).write_bytes(original)
        raise


if __name__ == '__main__':
    main()

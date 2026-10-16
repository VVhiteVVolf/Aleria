"""Install only the verified new standalone mod into the closed current profile."""
from pathlib import Path
from datetime import datetime
import hashlib
import json
import shutil
import subprocess
import sys
import zipfile

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile
from plugin_reader import records, text

ROOT = Path(__file__).resolve().parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
PLAN = json.loads((ROOT / 'install-plan.json').read_text(encoding='utf8'))
PACKAGE = Path(PLAN['package'])
TARGET = INSTANCE / 'MODS/mods' / PLAN['mod_name']
CONTROL = ('modlist.txt', 'plugins.txt', 'loadorder.txt')


def digest(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def running(name):
    result = subprocess.run(['tasklist', '/FI', f'IMAGENAME eq {name}', '/NH'],
                            capture_output=True, text=True, check=True)
    return name.lower() in result.stdout.lower()


assert not running('SkyrimSE.exe') and not running('ModOrganizer.exe'), 'Close Skyrim and MO2 first'
assert TARGET.resolve().parent == (INSTANCE / 'MODS/mods').resolve()
state = selected_profile(INSTANCE)
assert state['profile'] == PLAN['profile'] and state['fingerprint'] == PLAN['fingerprint_before'], 'Profile changed; inspect again'
assert '1guarfarmor.esp' not in state['providers'] and PLAN['plugin'].lower() not in state['providers']
assert 'Spell Perk Item Distributor' in state['active_mods']
for relative, expected in PLAN['files'].items():
    assert digest(PACKAGE / relative) == expected, relative
if TARGET.exists():
    assert {p.relative_to(TARGET).as_posix() for p in TARGET.rglob('*') if p.is_file()} == set(PLAN['files'])
    assert all(digest(TARGET / relative) == expected for relative, expected in PLAN['files'].items()), 'Existing inactive package differs'

def inspect_master_order(snapshot):
    positions = {name.lower(): i for i, name in enumerate(snapshot['plugins'])}
    exceptions = []
    counts = {'full': 0, 'light': 0}
    for index, name in enumerate(snapshot['plugins']):
        header = next(records(snapshot['providers'][name.lower()]['path'], (b'TES4',)))
        counts['light' if header[1] & 0x200 else 'full'] += 1
        for tag, value in header[3]:
            if tag != b'MAST': continue
            master = text(value)
            assert master.lower() in positions, ('Missing master', name, master)
            if positions[master.lower()] >= index: exceptions.append((name, master))
    return counts, exceptions

before_counts, existing_order_exceptions = inspect_master_order(state)

profile = state['directory']
backup = ROOT / 'backup' / profile.name
backup.mkdir(parents=True, exist_ok=True)
for name in CONTROL:
    if (backup / name).exists():
        assert digest(backup / name) == digest(profile / name), 'Backup belongs to another profile state'
    else:
        shutil.copy2(profile / name, backup / name)

protected = {}
for other in (INSTANCE / 'MODS/profiles').iterdir():
    if other.is_dir() and other != profile:
        for name in CONTROL:
            path = other / name
            if path.is_file(): protected[str(path)] = digest(path)
# Preserve the previously configured SkyrimNet prompts/providers/Wheel guard.
for mod in ('SkyrimNet - Beta25 Test Runtime 20260927', 'SkyrimNet - Beta 25 Local Compatibility'):
    folder = INSTANCE / 'MODS/mods' / mod
    for path in folder.rglob('*'):
        if path.is_file() and path.suffix.lower() in ('.yaml', '.prompt', '.pex', '.psc', '.json'):
            protected[str(path)] = digest(path)

new_bytes = {}
for name in CONTROL:
    data = (profile / name).read_bytes()
    assert PLAN['plugin'].encode() not in data and PLAN['mod_name'].encode() not in data
    ending = b'\r\n' if b'\r\n' in data else b'\n'
    if name == 'modlist.txt':
        lines = data.splitlines(keepends=True)
        index = next((i for i, line in enumerate(lines) if line.startswith((b'+', b'-'))), len(lines))
        lines.insert(index, ('+' + PLAN['mod_name']).encode('utf8') + ending)
        new_bytes[name] = b''.join(lines)
    else:
        if data and not data.endswith(b'\n'): data += ending
        prefix = '*' if name == 'plugins.txt' else ''
        new_bytes[name] = data + (prefix + PLAN['plugin']).encode('ascii') + ending

try:
    if not TARGET.exists(): shutil.copytree(PACKAGE, TARGET)
    assert all(digest(TARGET / relative) == expected for relative, expected in PLAN['files'].items())
    for name, data in new_bytes.items(): (profile / name).write_bytes(data)
    after = selected_profile(INSTANCE)
    assert after['active_mods'] == [PLAN['mod_name']] + state['active_mods']
    assert after['plugins'] == state['plugins'] + [PLAN['plugin']]
    assert after['providers'][PLAN['plugin'].lower()]['mod'] == PLAN['mod_name']
    assert all(after['providers'][key] == value for key, value in state['providers'].items())
    counts, after_order_exceptions = inspect_master_order(after)
    assert after_order_exceptions == existing_order_exceptions, 'New master order problem introduced'
    assert counts == {'full': 252, 'light': 3786}, counts
    assert all(digest(path) == expected for path, expected in protected.items()), 'Protected file changed'
except Exception:
    for name in CONTROL: shutil.copy2(backup / name, profile / name)
    raise

receipt = {'status': 'INSTALLED_STATICALLY_VALIDATED_NOT_GAME_TESTED',
           'installed_at': datetime.now().astimezone().isoformat(), 'profile': after['profile'],
           'mod': PLAN['mod_name'], 'plugin': PLAN['plugin'], 'counts': counts,
           'full_slots_free': 254 - counts['full'], 'recipients': PLAN['assignments'],
           'old_mod_providers_unchanged': True, 'protected_files_verified': len(protected),
           'preexisting_master_order_exceptions_unchanged': existing_order_exceptions,
           'fingerprint': after['fingerprint'], 'game_tested': False}
(ROOT / 'installation.json').write_text(json.dumps(receipt, indent=2), encoding='utf8')

archive_path = ROOT / 'migration-hold-guard-huskarl-20261015.zip'
with zipfile.ZipFile(archive_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=4) as archive:
    for relative in PLAN['files']:
        archive.write(TARGET / relative, str(Path('instance/MODS/mods') / PLAN['mod_name'] / relative))
    for name in CONTROL:
        archive.write(profile / name, str(Path('instance/MODS/profiles') / profile.name / name))
    for name in ('installation.json', 'validation.json', 'conversion.json', 'install-plan.json'):
        archive.write(ROOT / name, name)
    archive.write(PLAN['original_archive'], 'source/' + Path(PLAN['original_archive']).name)
    for path in (ROOT / 'converter').glob('*'):
        if path.is_file() and path.suffix.lower() in ('.cs', '.csproj', '.config'):
            archive.write(path, 'conversion-source/' + path.name)
with zipfile.ZipFile(archive_path) as archive:
    assert archive.testzip() is None
    for relative, expected in PLAN['files'].items():
        entry = str(Path('instance/MODS/mods') / PLAN['mod_name'] / relative).replace('\\', '/')
        assert hashlib.sha256(archive.read(entry)).hexdigest() == expected
backup_receipt = {'archive': str(archive_path), 'sha256': digest(archive_path),
                  'bytes': archive_path.stat().st_size, 'archive_test_passed': True,
                  'all_installed_mod_files_sha256_verified': True,
                  'scope': 'New Huskarl mod and profile reference; not a complete Nolvus backup'}
(ROOT / 'migration-receipt.json').write_text(json.dumps(backup_receipt, indent=2), encoding='utf8')
print(json.dumps({'status': receipt['status'], 'counts': counts,
                  'recipients': len(PLAN['assignments']), 'backup': backup_receipt}, indent=2))

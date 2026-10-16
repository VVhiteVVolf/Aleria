"""Disable only the requested systems and their patches in the selected profile."""
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

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
MODS = {'Hot Key Skill', 'Twisted - ORomance', 'Twisted - ORomance Plus', 'Twisted - ORomance Plus Official Patch Hub'}
PLUGINS = {'hotkeyskill.esp', 'oromance.esp', 'oromanceplus.esp', 'oromanceplus_aio.esp',
           'oromanceplus_ovirginityreflowered_patch.esp', 'or_immersiverejections_patch.esp', 'sda_oromanceplus.esp'}

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def running(name):
    result = subprocess.run(['tasklist', '/FI', f'IMAGENAME eq {name}', '/NH'], capture_output=True, text=True, check=True)
    return name.lower() in result.stdout.lower()

if running('SkyrimSE.exe') or running('ModOrganizer.exe'):
    raise RuntimeError('Skyrim and MO2 must be closed')
before = selected_profile(INSTANCE)
expected = json.loads(Path(r'E:\Aleria\diagnostics\skyrim-plugin-audit-20261014/inventory.json').read_text())
if before['profile'] != expected['profile'] or before['fingerprint'] != expected['fingerprint']:
    raise RuntimeError('Profile changed since inspection; review before mutation')

active_removed = [name for name in before['plugins'] if name.lower() in PLUGINS]
for plugin in before['plugins']:
    if plugin.lower() in PLUGINS:
        continue
    provider = before['providers'][plugin.lower()]
    header = next(records(provider['path'], (b'TES4',)))
    masters = [text(value) for kind, value in header[3] if kind == b'MAST']
    if any(master.lower() in PLUGINS for master in masters):
        raise RuntimeError(f'Unplanned dependent plugin: {plugin}')

profile = before['directory']
backup = ROOT / 'backup' / before['profile']
backup.mkdir(parents=True, exist_ok=False)
control_files = ['modlist.txt', 'plugins.txt', 'loadorder.txt']
for filename in control_files:
    shutil.copy2(profile / filename, backup / filename)
protected = []
for directory in (INSTANCE / 'MODS/profiles').iterdir():
    if directory.is_dir() and directory != profile:
        protected.extend(directory / name for name in control_files if (directory / name).is_file())
for name, directory in before['sources']:
    if name in MODS:
        protected.extend(path for path in directory.rglob('*') if path.is_file())
    skn = directory / 'SKSE/Plugins/SkyrimNet'
    for part in ('config', 'overlay', 'external'):
        area = skn / part
        if area.is_dir():
            protected.extend(path for path in area.rglob('*') if path.is_file())
protected = list(dict.fromkeys(protected))
protected_hashes = {str(path): digest(path) for path in protected}

modfile = profile / 'modlist.txt'
pluginfile = profile / 'plugins.txt'
modlines = modfile.read_bytes().splitlines(keepends=True)
pluginlines = pluginfile.read_bytes().splitlines(keepends=True)
disabled_mods = []
for index, line in enumerate(modlines):
    value = line.decode('utf-8-sig').strip()
    if value.startswith('+') and value[1:] in MODS:
        disabled_mods.append(value[1:])
        modlines[index] = line.replace(b'+', b'-', 1)
for index, line in enumerate(pluginlines):
    value = line.decode('utf-8-sig').strip()
    if value.startswith('*') and value[1:].lower() in PLUGINS:
        pluginlines[index] = line.replace(b'*', b'', 1)
if set(disabled_mods) != MODS or len(active_removed) != 6:
    raise RuntimeError('Unexpected removal plan; nothing modified')

try:
    modfile.write_bytes(b''.join(modlines))
    pluginfile.write_bytes(b''.join(pluginlines))
    after = selected_profile(INSTANCE)
    if any(name.lower() in PLUGINS for name in after['plugins']):
        raise RuntimeError('Requested plugins are still active')
    if set(after['active_mods']) != set(before['active_mods']) - MODS:
        raise RuntimeError('Unrelated mod activation changed')
    if set(name.lower() for name in after['plugins']) != set(name.lower() for name in before['plugins']) - PLUGINS:
        raise RuntimeError('Unrelated plugin activation changed')
    counts = {'full': 0, 'light': 0}
    missing = []
    active = {name.lower() for name in after['plugins']}
    for plugin in after['plugins']:
        provider = after['providers'][plugin.lower()]
        _, flags, _, fields = next(records(provider['path'], (b'TES4',)))
        counts['light' if flags & 0x200 else 'full'] += 1
        missing.extend((plugin, text(value)) for kind, value in fields if kind == b'MAST' and text(value).lower() not in active)
    if missing or counts != {'full': 253, 'light': 3784}:
        raise RuntimeError(f'Validation failed: counts={counts}; missing={missing}')
    if not all(path.is_file() and digest(path) == protected_hashes[str(path)] for path in protected):
        raise RuntimeError('A protected file changed during the operation')
    if digest(profile / 'loadorder.txt') != before['fingerprint']['loadorder.txt']:
        raise RuntimeError('Unexpected load order change')
except Exception:
    for filename in control_files:
        shutil.copy2(backup / filename, profile / filename)
    raise

receipt = {'timestamp': datetime.now().astimezone().isoformat(), 'profile': before['profile'],
           'disabled_mods': disabled_mods, 'disabled_plugins': active_removed,
           'before': {'full': expected['full_plugins'], 'light': expected['light_plugins']},
           'after': counts, 'missing_masters': missing,
           'protected_files_unchanged': len(protected), 'backup': str(backup),
           'mod_files_deleted': False, 'save_files_modified': False,
           'before_fingerprint': before['fingerprint'], 'after_fingerprint': after['fingerprint']}
(ROOT / 'installation.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
with zipfile.ZipFile(ROOT / 'migration-profile-after.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for filename in control_files:
        archive.write(profile / filename, f'profiles/{before["profile"]}/{filename}')
    archive.write(ROOT / 'installation.json', 'installation.json')
print(json.dumps(receipt, indent=2))

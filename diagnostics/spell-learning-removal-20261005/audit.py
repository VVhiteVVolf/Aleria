from pathlib import Path
import json
import os
import re
import struct
import sys

sys.stdout.reconfigure(encoding='utf-8')
instance = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
workspace = Path(r'E:\Aleria\diagnostics\spell-learning-removal-20261005')
ini = (instance / 'MO2' / 'ModOrganizer.ini').read_text(encoding='utf-8-sig')
match = re.search(r'^selected_profile=@ByteArray\((.*)\)\s*$', ini, re.M)
if not match:
    raise RuntimeError('Aktuelles MO2-Profil konnte nicht eindeutig bestimmt werden.')
profile_name = match.group(1)
profile = instance / 'MODS' / 'profiles' / profile_name
mod_root = instance / 'MODS' / 'mods'
modlines = (profile / 'modlist.txt').read_text(encoding='utf-8-sig').splitlines()
enabled_mods = [line[1:] for line in modlines if line.startswith('+')]
plugins = [line[1:] for line in (profile / 'plugins.txt').read_text(encoding='utf-8-sig').splitlines() if line.startswith('*')]
target_mod = 'Immersive Spell Learning - DESTified'
target_plugin = 'DEST_ISL.esp'
providers = {}
missing_mods = []
sources = [('overwrite', instance / 'MODS' / 'overwrite')] + [(name, mod_root / name) for name in enabled_mods] + [('Stock game', instance / 'STOCK GAME' / 'Data')]
dll_providers = []
for name, directory in sources:
    if not directory.is_dir():
        missing_mods.append(name)
        continue
    if (directory / 'SKSE' / 'Plugins' / 'DontEatSpellTomes.dll').is_file():
        dll_providers.append(name)
    with os.scandir(directory) as entries:
        for entry in entries:
            if entry.is_file() and Path(entry.name).suffix.lower() in {'.esp', '.esm', '.esl'}:
                providers.setdefault(entry.name.lower(), {'mod': name, 'path': entry.path})

def masters(path):
    with open(path, 'rb') as file:
        header = file.read(24)
        if len(header) != 24 or header[:4] != b'TES4':
            raise RuntimeError('Ungültiger Plugin-Header: ' + path)
        size = struct.unpack_from('<I', header, 4)[0]
        data = file.read(size)
    output = []
    position = 0
    extended_size = None
    while position + 6 <= len(data):
        signature = data[position:position + 4]
        field_size = struct.unpack_from('<H', data, position + 4)[0]
        position += 6
        if signature == b'XXXX':
            extended_size = struct.unpack_from('<I', data, position)[0]
            position += field_size
            continue
        if extended_size is not None:
            field_size = extended_size
            extended_size = None
        field = data[position:position + field_size]
        if len(field) != field_size:
            raise RuntimeError('Unvollständiger Plugin-Header: ' + path)
        if signature == b'MAST':
            output.append(field.rstrip(b'\0').decode('utf-8', errors='replace'))
        position += field_size
    return output

dependents = []
missing_plugins = []
errors = []
for plugin in plugins:
    source = providers.get(plugin.lower())
    if not source:
        missing_plugins.append(plugin)
        continue
    try:
        required = masters(source['path'])
    except Exception as error:
        errors.append({'plugin': plugin, 'error': str(error)})
        continue
    if any(master.lower() == target_plugin.lower() for master in required):
        dependents.append({'plugin': plugin, 'provider': source['mod']})

report = {
    'profile': profile_name, 'profile_path': str(profile),
    'target_mod': target_mod, 'target_mod_enabled': target_mod in enabled_mods,
    'target_plugin': target_plugin, 'target_plugin_enabled': target_plugin.lower() in {plugin.lower() for plugin in plugins},
    'active_plugins_checked': len(plugins) - len(missing_plugins) - len(errors),
    'dependents': dependents, 'dll_providers': dll_providers,
    'missing_mods': missing_mods, 'missing_plugins': missing_plugins, 'errors': errors
}
workspace.mkdir(parents=True, exist_ok=True)
(workspace / 'audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))

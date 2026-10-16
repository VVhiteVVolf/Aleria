"""Read the selected profile's plugin headers and dependency graph."""
from pathlib import Path
from datetime import datetime
import json
import struct
import sys

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile
from plugin_reader import fields, text, records

ROOT = Path(__file__).parent
INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
state = selected_profile(INSTANCE)
inventory = []
full_index = light_index = 0
for plugin in state['plugins']:
    provider = state['providers'][plugin.casefold()]
    path = provider['path']
    with path.open('rb') as stream:
        header = stream.read(24)
        kind, size, flags, form = struct.unpack_from('<4sIII', header)
        if kind != b'TES4':
            raise ValueError(f'Invalid plugin header: {path}')
        values = list(fields(stream.read(size)))
    masters = [text(value) for key, value in values if key == b'MAST']
    hedr = next(value for key, value in values if key == b'HEDR')
    version, record_count, next_id = struct.unpack_from('<fII', hedr)
    light = bool(flags & 0x200)
    slot = f'FE:{light_index:03X}' if light else f'{full_index:02X}'
    if light:
        light_index += 1
    else:
        full_index += 1
    inventory.append({'plugin': plugin, 'mod': provider['mod'], 'path': str(path),
                      'light': light, 'master_flag': bool(flags & 1), 'slot': slot,
                      'record_count': record_count, 'next_id': next_id,
                      'bytes': path.stat().st_size, 'masters': masters,
                      'nexus_id': state['mods'][provider['mod']]['nexus_id'],
                      'mod_version': state['mods'][provider['mod']]['version']})

by_name = {row['plugin'].casefold(): row for row in inventory}
dependents = {name: [] for name in by_name}
missing = []
for row in inventory:
    for master in row['masters']:
        if master.casefold() in by_name:
            dependents[master.casefold()].append(row['plugin'])
        else:
            missing.append({'plugin': row['plugin'], 'master': master})

def closure(name):
    found = set()
    queue = list(dependents[name.casefold()])
    while queue:
        current = queue.pop()
        if current.casefold() not in found:
            found.add(current.casefold())
            queue.extend(dependents[current.casefold()])
    return [row['plugin'] for row in inventory if row['plugin'].casefold() in found]

for row in inventory:
    row['direct_dependents'] = dependents[row['plugin'].casefold()]
    row['dependent_closure'] = closure(row['plugin'])

report = {'timestamp': datetime.now().astimezone().isoformat(), 'profile': state['profile'],
          'profile_directory': str(state['directory']), 'fingerprint': state['fingerprint'],
          'active_mods': len(state['active_mods']), 'total_plugins': len(inventory),
          'full_plugins': full_index, 'light_plugins': light_index,
          'missing_masters': missing, 'plugins': inventory}
(ROOT / 'inventory.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'plugins'}, indent=2))
for row in inventory:
    if not row['light']:
        print(f'{row["slot"]} | {row["plugin"]} | {row["mod"]} | records={row["record_count"]} | dependents={len(row["dependent_closure"])}')

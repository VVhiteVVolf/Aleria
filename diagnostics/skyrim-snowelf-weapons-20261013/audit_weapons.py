"""Read active weapon records and resolve runtime IDs without changing Skyrim."""
from pathlib import Path
import json
import sys

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from profile_reader import selected_profile
from plugin_reader import records, text, identity

root = Path(__file__).parent
state = selected_profile(Path(r'E:\Nolvus\Instances\Nolvus Awakening'))
weapons = {}
indices = {}
full_index = 0
light_index = 0
errors = []
for index, plugin in enumerate(state['plugins']):
    provider = state['providers'][plugin.casefold()]
    masters = []
    try:
        for kind, flags, form, fields in records(provider['path'], (b'TES4', b'WEAP')):
            values = dict(fields)
            if kind == 'TES4':
                masters = [text(value) for key, value in fields if key == b'MAST']
                if flags & 0x200:
                    indices[plugin.casefold()] = ('light', light_index)
                    light_index += 1
                else:
                    indices[plugin.casefold()] = ('full', full_index)
                    full_index += 1
            else:
                full = values.get(b'FULL', b'')
                weapons[identity(form, masters, plugin)] = {
                    'edid': text(values.get(b'EDID', b'')),
                    'name': text(full) if not (len(full) == 4 and full[-1:] == b'\0') else '',
                    'record_flags': flags, 'winning_plugin': plugin, 'mod': provider['mod'],
                    'model': text(values.get(b'MODL', b'')),
                }
    except Exception as error:
        errors.append({'plugin': plugin, 'error': str(error)})
    if (index + 1) % 500 == 0:
        print(f'Read {index + 1}/{len(state["plugins"])} plugins', flush=True)

matches = []
for key, weapon in weapons.items():
    haystack = ' '.join([weapon['edid'], weapon['name'], weapon['model']]).lower()
    if not any(term in haystack for term in ('falmer', 'snowelf', 'snow elf', 'snow_elf', 'snowelven', 'ivory', 'auriel')):
        continue
    owner, local = key.split(':')
    mode, slot = indices[owner]
    form_id = f'FE{slot:03X}{int(local, 16):03X}' if mode == 'light' else f'{slot:02X}{int(local, 16):06X}'
    matches.append({'form_id': form_id, 'identity': key, **weapon})

report = {'profile': state['profile'], 'plugins_scanned': len(state['plugins']),
          'weapons': len(weapons), 'matches': matches, 'errors': errors}
(root / 'weapon-audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2), flush=True)

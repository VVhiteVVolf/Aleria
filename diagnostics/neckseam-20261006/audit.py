"""Read-only appearance trace for the reported NPCs and new outfit bodies."""
from pathlib import Path
import io
import json
import re
import struct
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parents[1] / 'skyrim-outfit-catalog/scripts'))
sys.path.insert(0, str(ROOT.parent / 'obody-repair-cleanup-20261006'))
from profile_reader import selected_profile
from plugin_reader import records, text, identity
from nif_links import header

INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')
TARGET = re.compile('narri|glathriel|isobel', re.I)


def record(kind, flags, form, fields, masters, plugin, provider):
    def ref(value):
        try:
            return identity(struct.unpack('<I', value)[0], masters, plugin)
        except ValueError:
            return 'unresolved:' + value.hex()
    entry = {'kind': kind, 'id': ref(struct.pack('<I', form)), 'plugin': plugin,
             'provider': provider, 'editor': '', 'fields': {}, 'flags': flags}
    for key, value in fields:
        name = key.decode()
        if key == b'EDID':
            entry['editor'] = text(value)
        if kind == 'NPC_' and key in (b'WNAM', b'RNAM', b'FTST', b'TPLT'):
            entry['fields'][name] = ref(value)
        elif kind == 'NPC_' and key in (b'NAM6', b'NAM7', b'QNAM'):
            entry['fields'][name] = list(struct.unpack('<' + 'f' * (len(value)//4), value))
        elif kind == 'ARMO' and key == b'MODL' and len(value) == 4:
            entry['fields'].setdefault(name, []).append(ref(value))
        elif kind == 'ARMA' and key in (b'NAM0', b'NAM1', b'RNAM'):
            entry['fields'][name] = ref(value)
        elif kind == 'RACE' and key == b'WNAM':
            entry['fields'].setdefault(name, []).append(ref(value))
        elif kind == 'ARMA' and key in (b'MOD2', b'MOD3', b'MOD4', b'MOD5'):
            entry['fields'][name] = text(value)
        elif kind == 'TXST' and name.startswith('TX0'):
            entry['fields'][name] = text(value)
    return entry


def model(path):
    parsed = header(path.read_bytes())
    textures, shaders = [], []
    for kind, data in parsed['blocks']:
        if kind == 'BSShaderTextureSet':
            stream = io.BytesIO(data)
            count = struct.unpack('<I', stream.read(4))[0]
            values = []
            for _ in range(count):
                size = struct.unpack('<I', stream.read(4))[0]
                values.append(text(stream.read(size)))
            textures.append(values)
        if kind == 'BSLightingShaderProperty':
            shaders.append({'length': len(data), 'hex': data.hex()})
    return {'path': str(path), 'textures': textures, 'shaders': shaders}


def main():
    profile = selected_profile(INSTANCE)
    effective, traces, npc_ids = {}, [], set()
    for index, plugin in enumerate(profile['plugins']):
        source = profile['providers'][plugin.casefold()]
        masters = []
        for kind, flags, form, values in records(source['path'], (b'TES4', b'NPC_', b'ARMO', b'ARMA', b'TXST', b'RACE')):
            if kind == 'TES4':
                masters = [text(v) for k, v in values if k == b'MAST']
                continue
            editor = next((text(v) for k, v in values if k == b'EDID'), '')
            key = identity(form, masters, plugin)
            if kind == 'NPC_' and key not in npc_ids and not TARGET.search(editor):
                continue
            entry = record(kind, flags, form, values, masters, plugin, source['mod'])
            effective[key] = entry
            if kind == 'NPC_':
                npc_ids.add(key)
                traces.append(entry)
        if index % 600 == 0:
            print('Plugins:', index + 1, '/', len(profile['plugins']), flush=True)
    selected, pending = {}, list(npc_ids)
    while pending:
        key = pending.pop()
        if key in selected or key not in effective:
            continue
        entry = effective[key]
        selected[key] = entry
        for value in entry['fields'].values():
            for ref in value if isinstance(value, list) else [value]:
                if isinstance(ref, str) and ref in effective and ref not in selected:
                    pending.append(ref)
    result = {'profile': profile['profile'], 'npc_trace': traces, 'effective_records': selected,
              'fingerprint': profile['fingerprint']}
    (ROOT / 'appearance-trace.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    for key in npc_ids:
        print(json.dumps(effective[key], ensure_ascii=False))
    print('Referenced records:', len(selected), flush=True)


if __name__ == '__main__':
    main()

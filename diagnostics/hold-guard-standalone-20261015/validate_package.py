"""Check the scoped conversion, all links, and supplied mesh/texture resources."""
from collections import Counter
import copy
import hashlib
import json
from pathlib import Path
import re
import struct
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
sys.path.insert(0, r'E:\Aleria\diagnostics\obody-repair-cleanup-20261006')
from plugin_reader import records, text
from nif_links import header as nif_header


def bsa_names(path):
    with path.open('rb') as stream:
        magic, version, offset, flags, folders, files, _, name_bytes, _ = struct.unpack('<4s8I', stream.read(36))
        assert magic == b'BSA\0' and version in (103, 104, 105) and flags & 3 == 3
        stream.seek(offset)
        counts = []
        for _ in range(folders):
            entry = struct.unpack('<QIIQ' if version == 105 else '<QII', stream.read(24 if version == 105 else 16))
            counts.append(entry[1])
        prefixes = []
        for count in counts:
            length = stream.read(1)[0]
            folder = stream.read(length).rstrip(b'\0').decode('utf8', errors='replace')
            prefixes.extend([folder] * count)
            stream.seek(count * 16, 1)
        names = stream.read(name_bytes).rstrip(b'\0').split(b'\0')
        assert len(names) == files == len(prefixes)
        return {(folder + '/' + name.decode('utf8', errors='replace')).replace('\\', '/').lower()
                for folder, name in zip(prefixes, names)}


source = json.loads((ROOT / 'source-plugin.json').read_text(encoding='utf8'))
converted = json.loads((ROOT / 'converted-plugin.json').read_text(encoding='utf8'))
conversion = json.loads((ROOT / 'conversion.json').read_text(encoding='utf8'))
state = json.loads((ROOT / 'profile-before.json').read_text(encoding='utf8'))
mapping = conversion['map']

def normalize(value, remap=False):
    if isinstance(value, dict):
        return {key: normalize(item, remap) for key, item in value.items()
                if key not in ('EditorID', 'Name', 'TitleString', 'IsCompressed')}
    if isinstance(value, list):
        return [normalize(item, remap) for item in value]
    if remap and isinstance(value, str):
        return mapping.get(value, value)
    return value

for section in ('Armors', 'ArmorAddons'):
    new = {entry['Key']: entry['Value'] for entry in converted[section]}
    for entry in source[section]:
        assert normalize(entry['Value'], True) == normalize(new[mapping[entry['Key']]]), entry['Key']

plugin = ROOT / 'HoldGuardHuskarlStandalone.esp'
kinds = (b'TES4', b'ARMO', b'ARMA', b'COBJ', b'OTFT')
rows = list(records(plugin, kinds))
masters = [text(v) for k, v in rows[0][3] if k == b'MAST']
assert masters == ['Skyrim.esm'] and rows[0][1] & 0x200
assert Counter(row[0] for row in rows) == {'TES4': 1, 'ARMO': 22, 'ARMA': 21, 'COBJ': 44, 'OTFT': 18}
assert all(r[2] >> 24 == 1 and 0x800 <= r[2] & 0xFFFFFF <= 0xFFF for r in rows[1:])
assert len(set(r[2] for r in rows[1:])) == 105
own = {entry['Key'] for section in ('Armors', 'ArmorAddons', 'ConstructibleObjects', 'Outfits') for entry in converted[section]}
base_path = Path(state['providers']['skyrim.esm']['path'])
# Record IDs are indexed without deserializing the entire master into memory.
base_ids = set()
with base_path.open('rb') as stream:
    end = base_path.stat().st_size
    while stream.tell() < end:
        raw = stream.read(24)
        assert len(raw) == 24
        kind, size, flags, form = struct.unpack_from('<4sIII', raw)
        if kind != b'GRUP':
            base_ids.add(form)
            stream.seek(size, 1)

links = set()
def check_links(value):
    if isinstance(value, dict):
        for item in value.values(): check_links(item)
    elif isinstance(value, list):
        for item in value: check_links(item)
    elif isinstance(value, str) and re.fullmatch(r'[0-9A-F]{6}:[^:]+\.(?:es[mp]|esl)', value, re.I):
        links.add(value)
        if value in own: return
        form, owner = value.split(':', 1)
        assert owner.lower() == 'skyrim.esm' and int(form, 16) in base_ids, value
check_links(converted)

upstream = ROOT / 'upstream/Data'
resources = {p.relative_to(upstream).as_posix().lower(): p for p in upstream.rglob('*') if p.is_file()}
requested = set()
def get_models(value):
    if isinstance(value, dict):
        if 'DataRelativePath' in value: requested.add(value['DataRelativePath'].replace('\\', '/').lower())
        for item in value.values(): get_models(item)
    elif isinstance(value, list):
        for item in value: get_models(item)
get_models(converted)
nifs = list(upstream.rglob('*.nif'))
for path in nifs:
    info = nif_header(path.read_bytes())
    for kind, data in info['blocks']:
        if kind != 'BSShaderTextureSet': continue
        position = 4
        for _ in range(struct.unpack_from('<I', data)[0]):
            size = struct.unpack_from('<I', data, position)[0]; position += 4
            texture = data[position:position + size].decode('utf8'); position += size
            if texture: requested.add(texture.replace('\\', '/').lower())

resolved = {}
pending = set(requested)
for relative in list(pending):
    if relative in resources:
        resolved[relative] = str(resources[relative]); pending.remove(relative)
for name, folder in state['sources']:
    for relative in list(pending):
        path = Path(folder) / relative
        if path.is_file(): resolved[relative] = str(path); pending.remove(relative)
stock = Path(r'E:\Nolvus\Instances\Nolvus Awakening\STOCK GAME\Data')
for archive in stock.glob('Skyrim - *.bsa'):
    if not pending: break
    names = bsa_names(archive)
    for relative in pending & names: resolved[relative] = str(archive)
    pending -= names
assert not pending, sorted(pending)

# No original files from any enabled mod may be overwritten by the package assets.
collisions = []
for name, folder in state['sources']:
    for relative in resources:
        if not relative.startswith(('meshes/', 'textures/')): continue
        path = Path(folder) / relative
        if path.exists(): collisions.append({'mod': name, 'path': str(path)})
assert not collisions, collisions
for entry in converted['ConstructibleObjects']:
    recipe = entry['Value']
    assert recipe['CreatedObject'] in own and recipe['CreatedObjectCount'] == 1
    assert recipe['Items']
    assert len(recipe['Conditions']) == (2 if recipe['EditorID'].startswith('Temper_') else 0)
for entry in converted['Outfits']:
    items = entry['Value']['Items']
    assert len(items) == (4 if entry['Value']['EditorID'].endswith('Shield') else 3)
    assert all(item in own or item == '013955:Skyrim.esm' for item in items)

result = {'status': 'VALIDATED', 'new_records': 105, 'light': True, 'masters': masters,
          'armor_items': 22, 'recipes': 44, 'outfits': 18,
          'armor_gameplay_and_addon_data_preserved': True, 'vanilla_overrides': 0,
          'all_form_links_resolved': len(links), 'mesh_files_parsed': len(nifs),
          'mesh_texture_references_resolved': len(resolved), 'resource_providers': resolved,
          'existing_asset_collisions': collisions, 'bodyslide_projects': 0,
          'obody_morph_support': False, 'game_tested': False,
          'plugin_sha256': hashlib.sha256(plugin.read_bytes()).hexdigest()}
(ROOT / 'validation.json').write_text(json.dumps(result, indent=2), encoding='utf8')
print(json.dumps({key: value for key, value in result.items() if key != 'resource_providers'}, indent=2))

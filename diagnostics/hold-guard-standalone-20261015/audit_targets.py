"""Read target NPCs and effective outfit references; never write game files."""
from pathlib import Path
import collections
import json
import struct
import sys

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from plugin_reader import records, text, identity

ROOT = Path(__file__).resolve().parent
state = json.loads((ROOT / 'profile-before.json').read_text(encoding='utf8'))
names = {'HousecarlWhiterun': 'Lydia', 'HousecarlSolitude': 'Jordis the Sword-Maiden',
         'HousecarlRiften': 'Iona', 'HousecarlMarkarth': 'Argis the Bulwark',
         'HousecarlWindhelm': 'Calder', 'BYOHHousecarlPale': 'Gregor',
         'BYOHHousecarlFalkreath': 'Rayya', 'BYOHHousecarlHjaalmarch': 'Valdimar',
         'Irileth': 'Irileth', 'BolgeirBearclaw': 'Bolgeir Bearclaw',
         'Gorm': 'Gorm', 'Faleen': 'Faleen', 'Unmid': 'Unmid Snow-Shod',
         'Jod': 'Jod', 'Helvard': 'Helvard', 'Galmar': 'Galmar Stone-Fist'}
targets = {}
for plugin in ['Skyrim.esm', 'HearthFires.esm']:
    path = state['providers'][plugin.lower()]['path']
    masters = []
    for kind, flags, form, fields in records(path, (b'TES4', b'NPC_')):
        if kind == 'TES4':
            masters = [text(v) for k, v in fields if k == b'MAST']
            continue
        title = next((text(v) for k, v in fields if k == b'FULL'), '')
        edid = next((text(v) for k, v in fields if k == b'EDID'), '')
        if edid in names:
            key = identity(form, masters, plugin)
            targets[key] = {'name': names[edid], 'editor_id': edid, 'identity': key}

outfits = {}
def item_identity(value, masters, plugin, key):
    try:
        return identity(value, masters, plugin)
    except ValueError:
        raise ValueError(f'Invalid outfit item {value:08X} in {plugin} {key}; masters={masters}')

for plugin in state['plugins']:
    path = state['providers'][plugin.lower()]['path']
    masters = []
    for kind, flags, form, fields in records(path, (b'TES4', b'NPC_', b'OTFT')):
        if kind == 'TES4':
            masters = [text(v) for k, v in fields if k == b'MAST']
            continue
        key = identity(form, masters, plugin)
        if kind == 'OTFT':
            outfits[key] = (plugin, masters, fields)
        elif key in targets:
            target = targets[key]
            target['winner'] = plugin
            target['outfit'] = next((identity(struct.unpack('<I', v)[0], masters, plugin)
                                     for k, v in fields if k == b'DOFT'), None)
for target in targets.values():
    outfit = outfits.get(target.get('outfit'))
    if outfit:
        plugin, masters, fields = outfit
        target['outfit_details'] = {'provider': plugin, 'items': [
            item_identity(value, masters, plugin, target['outfit'])
            for tag, blob in fields if tag == b'INAM'
            for value in struct.unpack('<' + 'I' * (len(blob) // 4), blob)
            if value and value != 0xFFFFFFFF]}
(ROOT / 'target-npcs.json').write_text(json.dumps(targets, indent=2), encoding='utf8')
print(json.dumps(list(targets.values()), indent=2), flush=True)

skyrim = state['providers']['skyrim.esm']['path']
refs = {}
for kind, flags, form, fields in records(skyrim, (b'KYWD', b'MISC', b'ARMO')):
    edid = next((text(v) for k, v in fields if k == b'EDID'), '')
    if edid in {'CraftingSmithingForge', 'CraftingSmithingArmorTable', 'IngotSteel',
                'Leather01', 'LeatherStrips', 'IngotIron', 'ArmorSteelShield'}:
        refs[edid] = form
(ROOT / 'crafting-refs.json').write_text(json.dumps(refs, indent=2), encoding='utf8')
print('Crafting references:', refs)

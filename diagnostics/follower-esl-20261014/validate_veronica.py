"""Validate only the audited Veronica conversion; retain original assets."""
from pathlib import Path
import hashlib
import json
import sys

sys.path.insert(0, r'E:\Aleria\skyrim-outfit-catalog\scripts')
from plugin_reader import records, text

ROOT = Path(__file__).parent
PACKAGE = ROOT / 'packages/Veronica - ESPFE 20261014'
MAP = json.loads((ROOT / 'veronica-formid-map.json').read_text())

def normalized(value, path=(), convert=False):
    if isinstance(value, list):
        return [normalized(x, path + (str(i),), convert) for i, x in enumerate(value)]
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if path == ('ModHeader', 'Stats') and key in ('NextFormID', 'NumRecords'):
                continue  # Writer recalculates these non-gameplay counters.
            if path == ('ModHeader',) and key == 'MasterReferences':
                # Update.esm is unused; the writer removes this unnecessary master.
                item = [x for x in item if x['Master'] != 'Update.esm']
            if key in ('MajorRecordFlagsRaw', 'SkyrimMajorRecordFlags', 'MajorFlags'):
                item &= ~0x40000  # Only physical compression changes.
            if key == 'IsCompressed':
                item = False
            if path == ('ModHeader',) and key == 'Flags':
                item &= ~0x200
            result[key] = normalized(item, path + (key,), convert)
        return result
    if convert and isinstance(value, str):
        for old, new in MAP.items():
            value = value.replace(old, new)  # Includes derived display/title properties.
    return value

source = json.loads((ROOT / 'veronica-source.json').read_text())
roundtrip = json.loads((ROOT / 'veronica-roundtrip.json').read_text())
converted = json.loads((ROOT / 'veronica-converted.json').read_text())
assert normalized(source) == normalized(roundtrip), 'Library roundtrip changed semantic data'
assert normalized(source, convert=True) == normalized(converted), 'Conversion changed semantic data'
assert converted['ModHeader']['Flags'] & 0x200

rows = list(records(PACKAGE / 'VeronicaFollower.esp',
                    tuple(x.encode() for x in ('TES4', 'TXST', 'HDPT', 'ARMO', 'NPC_', 'CELL', 'ACHR', 'PACK', 'ARMA', 'RELA', 'OTFT'))))
masters = [text(v) for k, v in rows[0][3] if k == b'MAST']
own = [r for r in rows[1:] if r[2] >> 24 == len(masters)]
assert len(rows) == 27 and len(own) == 25
assert all(0x800 <= r[2] & 0xffffff <= 0xfff for r in own)
assert len({r[2] for r in own}) == 25
assert not any(r[0] in ('CELL', 'NAVM') for r in own)

nif = PACKAGE / 'Meshes/actors/character/facegendata/facegeom/VeronicaFollower.esp/00000D62.NIF'
dds = PACKAGE / 'Textures/actors/Character/facegendata/facetint/VeronicaFollower.esp/00000D62.dds'
new_nif, new_dds = nif.with_name('00000800.NIF'), dds.with_name('00000800.dds')
old_path = b'textures\\actors\\character\\facegendata\\facetint\\veronicafollower.esp\\00000d62.dds'
new_path = old_path.replace(b'00000d62', b'00000800')
if nif.exists():
    blob = nif.read_bytes()
    assert blob.count(old_path) == 1 and len(old_path) == len(new_path)
    new_nif.write_bytes(blob.replace(old_path, new_path))
    nif.unlink()
    dds.rename(new_dds)
assert new_nif.exists() and new_dds.exists()
assert old_path not in new_nif.read_bytes() and new_path in new_nif.read_bytes()

original = Path(json.loads((ROOT / 'preparation.json').read_text())['packages'][0]['source'])
allowed_old = {'VeronicaFollower.esp', str(nif.relative_to(PACKAGE)), str(dds.relative_to(PACKAGE))}
for file in original.rglob('*'):
    if file.is_file() and str(file.relative_to(original)) not in allowed_old:
        assert (PACKAGE / file.relative_to(original)).read_bytes() == file.read_bytes(), f'Unrelated asset changed: {file}'
assert new_dds.read_bytes() == (original / dds.relative_to(PACKAGE)).read_bytes()
assert len([f for f in PACKAGE.rglob('*') if f.is_file()]) == len([f for f in original.rglob('*') if f.is_file()])
result = {'plugin': 'VeronicaFollower.esp', 'light': True, 'own_records': 25,
          'range': '000800–000818', 'masters': masters,
          'semantic_roundtrip_verified': True, 'semantic_conversion_verified': True,
          'facegen_files_and_embedded_path_updated': True, 'other_assets_unchanged': True,
          'eudora_excluded': True, 'in_game_test': False,
          'sha256': hashlib.sha256((PACKAGE / 'VeronicaFollower.esp').read_bytes()).hexdigest()}
(ROOT / 'validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result, indent=2))

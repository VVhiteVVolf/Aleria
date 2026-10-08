"""Emit reviewed family-source data and narrowly scoped counterpart patches.

Rebuild from Stammbäume/: run extract.py, person_inventory.py, resolve.py,
portrait_assets.py, then the feature directory's portrait_bindings.mjs with Node
and finally emit.py. Python dependencies: beautifulsoup4; Pillow for download.py.
Downloaded original bytes and receipts are already archived; regeneration does
not require network access. download.py accepts an explicit asset manifest only.
baseline.json is the reduced pre-import identity/field snapshot, not live data.
Review decisions.json and lineage_plans.py before changing semantic source data.
"""
from collections import defaultdict
from pathlib import Path
import json
import rules
import re
from source_config import family_id as source_family_id, house_id as source_house_id, family_kind

script = Path(IMPORT_DIRECTORY)
config = json.loads((script / 'import.json').read_text('utf-8'))
root = script.parents[1]
data_dir = root / 'assets/js/data'


def read(name):
    return json.loads((script / name).read_text(encoding='utf-8-sig'))


def js(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


def module(name, text):
    name = name.replace('dunfal-', config['slug'] + '-')
    text = text.replace('export const DUNFAL_', 'export const ' + config['slug'].upper() + '_').replace('createDunfalSourceFamily', 'create' + config['name'] + 'SourceFamily').replace('./dunfal-source-family-builder.js', './' + config['slug'] + '-source-family-builder.js').replace('scripts/dunfal-source-import/', 'scripts/' + config['slug'] + '-source-import/').replace('aus der Dunfal-Quelle vom 07.10.2026', 'aus der ' + config['name'] + '-Quelle vom ' + config['displayDate'])
    for decorator in config.get('familyDecorators', []):
        if name not in [f'house-{slug}-family.js' for slug in decorator['slugs']]:
            continue
        match = re.search(r'export const (\w+_FAMILY) = ([\s\S]*);\s*$', text)
        if not match:
            raise ValueError('Missing canonical family export: ' + name)
        text = text[:match.start()] + f'export const {match[1]} = {decorator["function"]}({match[2]});\n'
        text = f'import {{ {decorator["function"]} }} from \'./{decorator["module"]}\';\n' + text
    (data_dir / name).write_text(text, encoding='utf-8')


resolved = read('resolved.json')
notes = read('house_notes.json')
selected_assets = {(asset['personId'], asset['url']) for asset in read('portrait-assets.json')}
assets = [asset for asset in read('portrait-assets-receipt.json')
          if (asset['personId'], asset['url']) in selected_assets]
references = read('reference-assets-receipt.json')
bindings = read('portrait-bindings.json')
baseline = read('baseline.json')
assert all('error' not in a for a in assets + references), 'Unresolved asset downloads'
portraits = {pid: item['path'] for pid, item in bindings.items()}
portraits.update({a['personId']: a['path'] for a in assets if not a['referenceOnly']})
by_family = defaultdict(dict)
portrait_imports = []
for slug, source in resolved['sources'].items():
    family_id = source_family_id(config, slug)
    local_assets = [a for a in assets if a['familyId'] == family_id and not a['referenceOnly']]
    export = ('SEPT_' if family_kind(config, slug) == 'sept' else 'HOUSE_') + slug.upper().replace('-', '_') + '_PORTRAITS'
    filename = ('sept-' if family_kind(config, slug) == 'sept' else 'house-') + slug + '-portraits.js'
    # A newly populated family can already own portraits imported by other
    # trees. Keep those original leaf bindings when expanding its module.
    mapping = {item['key']: item['path'] for item in bindings.values() if item['module'] == filename}
    mapping.update({a['personId']: a['path'] for a in local_assets})
    module(filename, '// Lokale Originalbilder aus der Dunfal-Quelle vom 07.10.2026.\n'
                     f'export const {export} = Object.freeze({js(mapping)});\n')
    portrait_imports.append((export, filename))
    directory = root / f'assets/images/portraits/{family_id}'
    directory.mkdir(parents=True, exist_ok=True)
    # Preserve any independently archived portraits already in this directory.
    manifest = directory / 'portrait-sources.json'
    old_manifest = json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else {}
    if not isinstance(old_manifest, dict):
        old_manifest = {'previousSources': old_manifest}
    old_manifest.update({a['personId']: {k: v for k, v in a.items() if k not in ['personId', 'familyId', 'referenceOnly']}
                         for a in local_assets})
    manifest.write_text(js(old_manifest) + '\n', encoding='utf-8')

imports = {item['module']: item['exportName'] for item in bindings.values()}
shared = '\n'.join(f"import {{ {export} }} from './{filename}';" for filename, export in imports.items())
shared += '\n\nexport const DUNFAL_REUSED_PORTRAITS = Object.freeze({\n'
shared += ',\n'.join(f'  {json.dumps(pid)}: {item["exportName"]}[{json.dumps(item["key"])}]' for pid, item in bindings.items())
shared += '\n});\n'
module('dunfal-reused-portraits.js', shared)
portrait_imports.append((config['slug'].upper() + '_REUSED_PORTRAITS', config['slug'] + '-reused-portraits.js'))
module('dunfal-source-portraits.js', '\n'.join(f"import {{ {export} }} from './{filename}';" for export, filename in portrait_imports)
       + '\n\nexport const DUNFAL_SOURCE_PORTRAITS = Object.freeze({\n'
       + ',\n'.join('  ...' + export for export, _ in portrait_imports) + '\n});\n')

person_fields = ['id', 'worldPersonId', 'name', 'sex', 'birth', 'death', 'status', 'houseId', 'portraitPlaceholder', 'notes']
persons = {pid: {key: p[key] for key in person_fields} for pid, p in resolved['persons'].items()}
for difference in resolved['counterpartDifferences']:
    pid, field = difference['id'], difference['field']
    note = f'Gegenaktenabgleich {config["displayDate"]}: {field} nach {config["name"]}-Quelle {difference["ref"]}: {difference["previous"] or "unbekannt"} → {difference["source"] or "kein Todesjahr"}.'
    persons[pid]['notes'] = '\n'.join(filter(None, [persons[pid]['notes'], note]))

required_houses = {p['houseId'] for p in persons.values()}
for slug, source in resolved['sources'].items():
    required_houses.add(source_house_id(config, slug))
    for branch in source['away'] + source['cadets'] + source['wards']:
        required_houses.add(branch.get('houseId') or branch['targetFamilyId'].replace('haus-', 'house-', 1))
houses = [resolved['houses'].get(house_id, {'id': house_id,
           'name': 'Unbekanntes Haus' if house_id == 'house-unbekannt' else 'Clan ' + house_id.removeprefix('house-').capitalize(),
           'motto': '', 'emblem': '', 'status': 'active'}) for house_id in sorted(required_houses)]
module('dunfal-source-records.js', '// Quelleninventar und explizite Identitätsentscheidungen: scripts/dunfal-source-import/.\n'
       + f'export const DUNFAL_SOURCE_PERSONS = Object.freeze({js(persons)});\n\n'
       + f'export const DUNFAL_SOURCE_PARTNERSHIPS = Object.freeze({js(resolved["partnerships"])});\n\n'
       + f'export const DUNFAL_SOURCE_HOUSES = Object.freeze({js(houses)});\n')

families = []
for slug, source in resolved['sources'].items():
    meta = notes[slug]
    def mapped(coordinate):
        return resolved['mapping'][slug + ':' + coordinate.replace('.', ':')]
    source['currentHeadId'] = mapped(meta['head']) if meta['head'] else ''
    source['heirIds'] = [mapped(c) for c in meta['heirs'].split()]
    source['description'] = meta['description']
    source['titles'] = {pid: 'Historisches Oberhaupt' for pid in source['heads']}
    source['titles'].update({pid: f'Erbfolge: {index + 1}' for index, pid in enumerate(source['heirIds'])})
    source['titles'].update({mapped(c): title for c, title in meta['titles'].items()})
    if 'founderPairIndex' in meta:
        source['founderPartnershipId'] = source['partnershipIds'][meta['founderPairIndex']]
        source['founderId'] = mapped(meta['founder'])
    rules.decorate_source(slug, source, resolved, mapped)
    prefix = 'SEPT_' if family_kind(config, slug) == 'sept' else 'HOUSE_'
    filename = ('sept-' if family_kind(config, slug) == 'sept' else 'house-') + slug + '-family.js'
    export = prefix + slug.upper().replace('-', '_') + '_FAMILY'
    module(filename, "import { createDunfalSourceFamily } from './dunfal-source-family-builder.js';\n\n"
           + '// Elternpaare, Generationen und Sonderrollen nach Tabelle, Grafik und dokumentierten Korrekturen.\n'
           + f'const SOURCE = Object.freeze({js(source)});\n\n'
           + f'export const {export} = createDunfalSourceFamily({json.dumps(slug)}, SOURCE);\n')
    families.append((export, filename))
module('dunfal-source-families.js', '\n'.join(f"import {{ {export} }} from './{filename}';" for export, filename in families)
       + '\n\nexport const DUNFAL_SOURCE_FAMILIES = Object.freeze([\n'
       + ',\n'.join('  ' + export for export, _ in families) + '\n]);\n')

patches = {}
for record in baseline:
    family = record['family']
    patch = {'revision': int(family['extensions'].get('sourceRevision', 0)) + 1, 'collections': {}}
    person_patch = {}
    for old in family['persons']:
        pid = old['id']
        p = persons.get(pid)
        if not p or not resolved['persons'][pid]['existingId']:
            continue
        if config['slug'] == 'dunfal' and pid == 'emer-ailella' and record['id'] != 'haus-ciarog':
            continue
        fields = {field: p[field] for field in person_fields if field not in ['id', 'notes'] and old.get(field) != p[field] and (field != 'worldPersonId' or p[field])}
        if p['notes'] and fields:
            fields['notes'] = '\n'.join(filter(None, [old.get('notes'), p['notes']]))
        portrait = portraits.get(pid, '')
        if portrait and old.get('portrait') != portrait:
            fields['portrait'] = portrait
        if fields:
            person_patch[pid] = fields
    if person_patch:
        patch['collections']['persons'] = person_patch
    pair_patch = {}
    for old in family['partnerships']:
        pair = resolved['partnerships'].get(old['id'])
        if pair:
            fields = {key: value for key, value in pair.items() if key != 'id' and old.get(key) != value}
            if fields:
                pair_patch[old['id']] = fields
    if pair_patch:
        patch['collections']['partnerships'] = pair_patch
    new_houses = {p['houseId'] for p in person_patch.values() if 'houseId' in p}
    patch['additionalHouses'] = [h for h in houses if h['id'] in new_houses]
    rules.decorate_patch(record, patch)
    if patch['collections']:
        patches[record['id']] = patch
module('dunfal-source-counter-patches.js', '// Nur ausdrücklich abgeglichene Gegenfelder; bestehende lokale Genealogie bleibt erhalten.\n'
       + f'export const DUNFAL_SOURCE_COUNTER_PATCHES = Object.freeze({js(patches)});\n')

audit = root / config['inventory'].replace('-families-', '-families-audit-')
audit.write_text(js({'sourceCards': read('persons.json'), 'decisions': read('decisions.json'),
                     'sourceToPerson': resolved['mapping'], 'counterpartDifferences': resolved['counterpartDifferences'],
                     'counterpartPatches': patches, 'portraitAssets': assets, 'reusedPortraits': bindings,
                     'referenceAssets': references}) + '\n', encoding='utf-8')
print(js({'persons': len(persons), 'houses': len(houses), 'patchedFamilies': len(patches),
          'patchedPeople': sum(len(p['collections'].get('persons', {})) for p in patches.values()),
          'visiblePortraits': len(portraits)}))

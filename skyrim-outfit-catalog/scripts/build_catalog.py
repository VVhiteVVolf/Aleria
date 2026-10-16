"""Build an offline outfit catalog from the selected profile, read-only."""
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime
import argparse
import csv
import json
import re
import struct

from classification import recommend, slots, title
from localization import Names
from plugin_reader import identity, records, text
from profile_reader import selected_profile

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INSTANCE = Path(r'E:\Nolvus\Instances\Nolvus Awakening')


def scan(profile):
    effective = {'ARMO': {}, 'ARMA': {}, 'KYWD': {}}
    names = Names(profile)
    warnings = []
    for index, plugin in enumerate(profile['plugins']):
        masters, localized = [], False
        source = profile['providers'][plugin.casefold()]
        try:
            for kind, flags, form, values in records(source['path']):
                if kind == 'TES4':
                    masters = [text(value) for key, value in values if key == b'MAST']
                    localized = bool(flags & 0x80)
                    continue
                key = identity(form, masters, plugin)
                def reference(value):
                    try:
                        return identity(value, masters, plugin)
                    except ValueError:
                        warnings.append({'plugin': plugin, 'record': key, 'reference': format(value, '08X')})
                        return 'unresolved:' + plugin.casefold() + ':' + format(value, '08X')
                item = {'id': key, 'flags': flags, 'plugin': plugin, 'provider': source['mod'],
                        'editor': '', 'name': '', 'name_fallback': False, 'mask': 0,
                        'type': 'Unbekannt', 'addons': [], 'models': {}, 'keywords': []}
                for field, value in values:
                    if field == b'EDID':
                        item['editor'] = text(value)
                    elif field == b'FULL' and kind == 'ARMO':
                        item['name'], item['name_fallback'] = names.resolve(value, plugin, localized)
                    elif field in (b'BOD2', b'BODT'):
                        item['mask'] = struct.unpack_from('<I', value)[0]
                        offset = 4 if field == b'BOD2' else 8
                        if len(value) >= offset + 4:
                            armor_type = struct.unpack_from('<I', value, offset)[0]
                            item['type'] = {0: 'Leicht', 1: 'Schwer', 2: 'Kleidung'}.get(armor_type, 'Unbekannt')
                        if field == b'BODT' and len(value) >= 8 and value[4] & 0x10:
                            item['flags'] |= 4
                    elif field == b'MODL' and kind == 'ARMO' and len(value) == 4:
                        item['addons'].append(reference(struct.unpack('<I', value)[0]))
                    elif kind == 'ARMA' and field in (b'MOD2', b'MOD3'):
                        item['models'][field.decode()] = text(value)
                    elif field == b'KWDA':
                        item['keywords'] = [reference(ref[0]) for ref in struct.iter_unpack('<I', value)]
                effective[kind][key] = item
        except Exception as error:
            raise RuntimeError(f'Plugin scan failed: {plugin} ({source["path"]})') from error
        if index % 400 == 0:
            print(f'Plugins gelesen: {index + 1}/{len(profile["plugins"])}', flush=True)
    return effective, names.unresolved, warnings


def ignored(item):
    if item['flags'] & 0x20:
        return 'Gelöscht'
    if item['flags'] & 4:
        return 'Nicht spielbar'
    if not item['name'] and not item['name_fallback']:
        return 'Ohne Gegenstandsname'
    if not item['addons'] or not item['mask']:
        return 'Kein tragbares Modell / Slot'
    if re.search(r'(^|[\s_])skin(naked)?([\s_]|$)|^skin|naked|dummy|invisible|^nude', item['editor'], re.I):
        return 'Körper / technischer Helfer'
    return ''


def make_collections(profile, effective):
    groups = defaultdict(list)
    excluded = Counter()
    for item in effective['ARMO'].values():
        reason = ignored(item)
        if reason:
            excluded[reason] += 1
            continue
        owner, local_id = item['id'].rsplit(':', 1)
        source = profile['origins'][owner]
        models = [effective['ARMA'][key]['models'] for key in item['addons']
                  if key in effective['ARMA'] and not effective['ARMA'][key]['flags'] & 0x20]
        genders = [label for field, label in [('MOD2', 'Männer'), ('MOD3', 'Frauen')]
                   if any(model.get(field) for model in models)]
        keywords = [effective['KYWD'][key]['editor'] for key in item['keywords'] if key in effective['KYWD']]
        # Classification is per item. A small named armor pack can supply context;
        # broad game/quest collections must not give every item the same role.
        groups[owner].append({
            'id': item['id'], 'local_id': local_id, 'name': item['name'] or item['editor'],
            'name_fallback': item['name_fallback'], 'editor': item['editor'],
            'type': item['type'], 'slots': slots(item['mask']), 'torso': bool(item['mask'] & 4),
            'genders': genders, 'keywords': keywords, 'winning_plugin': item['plugin'],
            'winning_mod': item['provider'], 'origin_mod': source['mod'],
        })
    collections = []
    for owner, items in groups.items():
        source = profile['origins'][owner]
        mod = source['mod']
        name = title(mod, source['path'].name)
        context = name if mod != 'Skyrim / Creation Club' and len(items) < 100 else ''
        for item in items:
            item['classes'], item['guilds'] = recommend(item['name'], item['editor'], item.pop('keywords'), item['type'], context)
        info = profile['mods'][mod]
        collections.append({
            'id': owner, 'name': name, 'mod': mod, 'plugin': source['path'].name,
            'url': f'https://www.nexusmods.com/skyrimspecialedition/mods/{info["nexus_id"]}' if info['nexus_id'] else '',
            'version': info['version'], 'new': any(n.startswith('Local - ') and n.endswith('20261006')
                                                   for n in [mod, profile['providers'][owner]['mod']]),
            'base': mod == 'Skyrim / Creation Club',
            'items': sorted(items, key=lambda i: (not i['torso'], i['name'].casefold(), i['local_id'])),
        })
    return sorted(collections, key=lambda c: (c['base'], c['name'].casefold(), c['id'])), dict(excluded)


def visual_packs(profile, collections):
    """List explicit active clothing/armor converters and replacers separately."""
    item_sources = {c['mod'] for c in collections}
    result = []
    for name, directory in profile['sources']:
        if name in item_sources or name not in profile['active_mods']:
            continue
        if not re.search(r'armor|armour|outfit|clothes|clothing|robes|dress|gauntlet|boots', name, re.I):
            continue
        if not re.search(r'3ba|himbo|bodyslide|refit|replacer|redone|textures|\bcbbe\b|no rim', name, re.I):
            continue
        if re.search(r'NPC|behavior|distribution|bodypaint|preset|hair|head|blood|arousal|helmets.*toggle', name, re.I):
            continue
        info = profile['mods'][name]
        result.append({'name': title(name, ''), 'mod': name,
                       'url': f'https://www.nexusmods.com/skyrimspecialedition/mods/{info["nexus_id"]}' if info['nexus_id'] else '',
                       'kind': 'Konvertierung / BodySlide' if re.search(r'3ba|himbo|bodyslide|refit|cbbe', name, re.I) else 'Optik / Replacer',
                       'new': name.startswith('Local - ') and name.endswith('20261006')})
    return sorted(result, key=lambda pack: pack['name'].casefold())


def export(profile, collections, exclusions, unresolved, warnings, instance):
    output = ROOT / 'data'
    output.mkdir(exist_ok=True)
    item_count = sum(len(c['items']) for c in collections)
    data = {'meta': {'profile': profile['profile'], 'instance': str(instance),
                     'generated': datetime.now().astimezone().isoformat(timespec='seconds'),
                     'plugins': len(profile['plugins']), 'mods': len(profile['active_mods']),
                     'collections': len(collections), 'items': item_count,
                     'unresolved_names': unresolved, 'excluded': exclusions,
                     'profile_fingerprint': profile['fingerprint'], 'unresolved_reference_count': len(warnings)},
            'collections': collections, 'visual_packs': visual_packs(profile, collections)}
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    (output / 'catalog.json').write_text(payload, encoding='utf-8')
    (output / 'scan-warnings.json').write_text(json.dumps(warnings, ensure_ascii=False, indent=2), encoding='utf-8')
    (output / 'catalog-data.js').write_text(
        'document.dispatchEvent(new CustomEvent("outfit-catalog:data", {detail:' + payload + '}));\n', encoding='utf-8')
    with (output / 'outfits.csv').open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.writer(stream, delimiter=';')
        writer.writerow(['Paket', 'Gegenstand', 'Typ', 'Klassenstil', 'Gildenstil', 'Modelleinträge',
                         'Slots', 'Ursprungsplugin', 'Lokale ID', 'EditorID', 'Letzter Record-Patch', 'MO2-Mod', 'Nexus'])
        for collection in collections:
            for item in collection['items']:
                writer.writerow([collection['name'], item['name'], item['type'], ' | '.join(item['classes']),
                                 ' | '.join(item['guilds']), ' | '.join(item['genders']), ' | '.join(item['slots']),
                                 collection['plugin'], item['local_id'], item['editor'], item['winning_plugin'],
                                 collection['mod'], collection['url']])
    print(json.dumps(data['meta'], ensure_ascii=False, indent=2), flush=True)
    print('Optik- und BodySlide-Pakete:', len(data['visual_packs']), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--instance', type=Path, default=DEFAULT_INSTANCE)
    args = parser.parse_args()
    profile = selected_profile(args.instance)
    print('Aktives Profil:', profile['profile'], flush=True)
    effective, unresolved, warnings = scan(profile)
    collections, exclusions = make_collections(profile, effective)
    current = selected_profile(args.instance)
    if current['fingerprint'] != profile['fingerprint']:
        raise RuntimeError('Profile changed during scan; rerun after saving MO2.')
    export(profile, collections, exclusions, unresolved, warnings, args.instance)


if __name__ == '__main__':
    main()

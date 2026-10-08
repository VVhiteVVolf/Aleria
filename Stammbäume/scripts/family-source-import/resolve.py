"""Resolve the reviewed source plans against explicit identity decisions.

Writes a review artifact only. Runtime modules are emitted in a separate step.
"""
from collections import defaultdict
from pathlib import Path
import json
import re
import unicodedata
from lineage_plans import PLANS
import rules
from source_config import house_id as source_house_id

script = Path(IMPORT_DIRECTORY)
config = json.loads((script / 'import.json').read_text('utf-8'))


def normalize(value):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFKD', value.lower()).encode('ascii', 'ignore').decode())


def ref(slug, coordinate):
    return slug + ':' + coordinate.replace('.', ':')


def read(name):
    return json.loads((script / name).read_text(encoding='utf-8-sig'))


decisions = read('decisions.json')
baseline = read('baseline.json')
raw = {p['ref']: {**p, **decisions['corrections'].get(p['ref'], {})} for p in read('persons.json')}
existing = {}
houses = {}
house_families = {}
existing_pairs = {}
for record in baseline:
    family = record['family']
    house_families[family['lineage']['houseId']] = record['id']
    for house in family['houses']:
        if house['id'] not in houses or house.get('emblem'):
            houses[house['id']] = {k: v for k, v in house.items() if k != 'extensions'}
    for person in family['persons']:
        # The explicit decisions retain the established IDs, including old aliases.
        if person['id'] not in existing or person.get('portrait'):
            existing[person['id']] = person
    for pair in family['partnerships']:
        existing_pairs[(pair['type'], tuple(sorted(pair['participantIds'])))] = pair

own = set()
for slug, plan in PLANS.items():
    own.add(ref(slug, plan['pairs'][0][0]))
    for pair in plan['pairs']:
        own.update(ref(slug, child) for child in pair[2].split())


def house_for(card):
    if card.get('houseId'):
        return card['houseId']
    if card['ref'] in decisions['existing']:
        original = existing[decisions['existing'][card['ref']]]
        return rules.existing_house(card, original)
    if card['ref'] in own:
        return source_house_id(config, card['slug'])
    words = card['name'].split()
    if len(words) > 1 and 'aus' not in words and not card['name'].startswith('Unbekannte '):
        suffix = normalize(words[-1])
        return decisions['houseAliases'].get(suffix, 'house-' + suffix)
    return 'house-unbekannt'


for card in raw.values():
    card['houseId'] = house_for(card)
own_index = defaultdict(list)
for key in own:
    p = raw[key]
    own_index[(p['houseId'], normalize(p['name'].split()[0]))].append(key)

aliases = dict(decisions['aliases'])
for key, p in raw.items():
    # Explicitly distinct undated founders must not collapse into a later
    # namesake merely because only one dated candidate exists in this batch.
    if key in own or key in aliases or key in decisions.get('distinct', []) or p['houseId'] == 'house-unbekannt':
        continue
    named = own_index[(p['houseId'], normalize(p['name'].split()[0]))]
    candidates = [k for k in named if raw[k]['birth'] == p['birth']]
    if not candidates and p['birth'] == '????':
        candidates = named
    if len(candidates) == 1:
        aliases[key] = candidates[0]


def canonical(key):
    seen = set()
    while key in aliases:
        if key in seen:
            raise ValueError('Alias cycle: ' + key)
        seen.add(key)
        key = aliases[key]
    return key


groups = defaultdict(list)
for key in raw:
    groups[canonical(key)].append(key)
persons = {}
mapping = {}
conflicts = []
used_ids = set()
for key, members in groups.items():
    p = raw[key]
    old_ids = set(decisions['existing'][k] for k in members if k in decisions['existing'])
    if len(old_ids) > 1:
        raise ValueError(f'Conflicting identities {members}: {old_ids}')
    old = existing[next(iter(old_ids))] if old_ids else None
    house_id = p['houseId']
    suffix = house_id.removeprefix('house-')
    first = normalize(p['name'].split()[0]) or 'unbekannt'
    if old:
        person_id = old['id']
    elif house_id == 'house-unbekannt':
        person_id = f'{first}-unknown-{p["slug"]}-{p["row"]}-{p["column"]}'
    else:
        person_id = f'{first}-{p["birth"] if p["birth"].isdigit() else "founder"}-{suffix}'
    person_id = p.get('id', person_id)
    if person_id in used_ids:
        raise ValueError('Duplicate generated ID: ' + person_id)
    used_ids.add(person_id)
    notes = list(dict.fromkeys(raw[k]['note'] for k in members if raw[k].get('note')))
    name = old['name'] if old else p['name']
    if not old and key in own and len(name.split()) == 1:
        name += ' ' + config.get('displayNames', {}).get(p['slug'], p['slug'].capitalize())
    name = p.get('canonicalName') or rules.person_name(name, person_id)
    sex = old['sex'] if old and old['sex'] != 'unknown' else p['sex']
    status = p['status'] if p['birth'] != '????' or p['death'] else (old['status'] if old else 'unknown')
    record = { 'id': person_id, 'worldPersonId': p.get('worldPersonId') or (old.get('worldPersonId', '') if old else ''),
               'name': name, 'sex': sex, 'birth': p['birth'], 'death': p['death'], 'status': status,
               'houseId': house_id, 'portraitPlaceholder': 'auto', 'notes': '\n'.join(notes),
               'sourceRefs': members, 'existingId': old['id'] if old else '',
               'existingPortrait': old.get('portrait', '') if old else '',
               'imageCandidates': list(dict.fromkeys(raw[k]['image'] for k in members if raw[k]['image'])) }
    if old:
        for field in ['name', 'birth', 'death', 'status', 'houseId', 'worldPersonId']:
            if old.get(field) != record[field]:
                conflicts.append({'id': person_id, 'field': field, 'previous': old.get(field), 'source': record[field], 'ref': key})
    # A source number below 16 describes the child age, not an adult portrait.
    age_end = int(p['death']) if p['status'] == 'dead' and p['death'].isdigit() else 1740
    if p['birth'].isdigit() and 0 <= age_end - int(p['birth']) < 16:
        record['portraitPlaceholder'] = 'child'
    persons[person_id] = record
    for member in members:
        mapping[member] = person_id


def person_id(slug, coordinate):
    return mapping[ref(slug, coordinate)]


partnerships = {}
sources = {}
for slug, plan in PLANS.items():
    person_ids = list(dict.fromkeys(mapping[key] for key, p in raw.items() if p['slug'] == slug))
    source = {'personIds': person_ids, 'partnershipIds': [], 'descendants': [], 'away': [], 'cadets': [],
              'wards': [], 'foster': [], 'heads': [person_id(slug, c) for c in plan['heads'].split()],
              'titles': {}, 'personRoles': {}, 'personExtensions': {}, 'sourceNote': plan['note']}
    rules.prepare_source(slug, source, person_id)
    for pair in plan['pairs']:
        a, b = [person_id(slug, c) for c in pair[:2]]
        children = [person_id(slug, c) for c in pair[2].split()]
        options = pair[3] if len(pair) > 3 else {}
        kind = options.get('type', 'marriage')
        old = existing_pairs.get((kind, tuple(sorted([a, b]))))
        if not old and options.get('reusePairId'):
            old = next(p for p in existing_pairs.values() if p['id'] == options['reusePairId'])
            assert set(old['participantIds']) == {a, b}, 'Pair identity mismatch'
        pair_id = old['id'] if old else kind + '-' + '--'.join(sorted([a, b]))
        if pair_id not in partnerships:
            # Graphic-only sources may provide no new evidence about the
            # existing partnership status, even when both people have daggers.
            status = (old['status'] if old and config.get('preserveExistingPartnershipStatus')
                      else 'ended' if any(persons[pid]['status'] == 'dead' for pid in [a, b]) else 'active')
            partnerships[pair_id] = {**({k: v for k, v in old.items() if k != 'extensions'} if old else {}),
                                    'id': pair_id, 'participantIds': old['participantIds'] if old else [a, b], 'type': kind,
                                    'status': status}
        source['partnershipIds'].append(pair_id)
        if children:
            children = rules.split_children(slug, source, pair_id, children, person_id)
            group = {'partnershipId': pair_id, 'childIds': children}
            if 'gap' in options:
                group['timeJumpId'] = f'gap-{config["slug"]}-{slug}-{options["gap"]}'
            if kind in ['affair', 'forced'] or options.get('legitimacy') == 'illegitimate':
                group['legitimacy'] = 'illegitimate'
                source['personRoles'].update({child: 'bastard' for child in children})
            source['descendants'].append(group)
        if kind in ['affair', 'forced']:
            source['personRoles'][b] = kind
        if 'cadet' in options:
            branch = {'partnershipId': pair_id, 'targetFamilyId': options['cadet']}
            if options.get('cadetHouseId'):
                branch['houseId'] = options['cadetHouseId']
            source['cadets'].append(branch)
        elif not children and kind == 'marriage':
            # Explicit home member marries out to the counterpart house. Unknown
            # spouses in the same lineage are not invented outgoing branches.
            home_key = ref(slug, pair[0])
            target_house = persons[b]['houseId']
            own_house = source_house_id(config, slug)
            if home_key in own and target_house not in [own_house, 'house-unbekannt']:
                source['away'].append({'partnershipId': pair_id,
                                       'targetFamilyId': house_families.get(target_house, target_house.replace('house-', 'haus-', 1)),
                                       'houseId': target_house})
    for child, guardian in plan.get('foster', []):
        child_id, guardian_id = person_id(slug, child), person_id(slug, guardian)
        source['foster'].append({'childId': child_id, 'parentId': guardian_id})
        source['personRoles'][child_id] = 'ward'
    for child, target_family, house_id in plan.get('wards', []):
        source['wards'].append({'personId': person_id(slug, child), 'targetFamilyId': target_family, 'houseId': house_id,
                                'notes': 'Als Mündel fortgegeben; biologische Abstammung und Pflegebeziehung bleiben getrennt.'})
    sources[slug] = source

output = {'persons': persons, 'partnerships': partnerships, 'sources': sources, 'mapping': mapping,
          'houses': houses, 'houseFamilies': house_families, 'counterpartDifferences': conflicts}
(script / 'resolved.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'persons': len(persons), 'sourceCards': len(raw), 'partnerships': len(partnerships),
                  'sources': {slug: len(source['personIds']) for slug, source in sources.items()},
                  'counterpartDifferences': conflicts}, ensure_ascii=False, indent=2))

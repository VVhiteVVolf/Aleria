"""Mathgham source semantics and explicitly authorized Banlaoch chronology."""
from pathlib import Path
import json

def existing_house(card, old):
    return old['houseId']

def person_name(name, person_id):
    return name

def prepare_source(slug, source, person_id):
    pass

def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    if slug == 'ness':
        source['sourceNote'] += ' Die Erbfolgezeile nennt den amtierenden Malcolm nochmals; die Hausbio zeigt nur die übrigen ausdrücklich aufgeführten Nachfolger. Die Amtsliste umfasst auch die Seitenlinien Graham und Sinclair.'
    if slug in ['diuid', 'ness']:
        coordinates = ['188.0', '197.0', '197.1'] if slug == 'diuid' else ['148.3', '153.3', '153.4']
        core, wife, affair = [mapped(c) for c in coordinates]
        source['personExtensions'][core] = {
            'chartCenterBetweenPartnerPersonIds': [wife, affair],
            'chartPartnerGroupPersonOrder': [wife, core, affair],
            'chartKeepPartnerGroupTogether': True
        }
        source['partnershipExtensions'] = {}
        for partner in [wife, affair]:
            pair = next(p for p in resolved['partnerships'].values()
                        if set(p['participantIds']) == {core, partner})
            source['partnershipExtensions'][pair['id']] = {
                'chartAlignPartnerOverChildrenPersonId': partner,
                'chartReserveLeafChildLane': True,
                'chartArrangeLeafChildrenEvenly': True
            }
        # Keep the terminal sibling beside the complete continuing partner block.
        parent_coordinates = ['174.4', '179.4'] if slug == 'diuid' else ['138.3', '143.3']
        parent_ids = {mapped(c) for c in parent_coordinates}
        parent_pair = next(p for p in resolved['partnerships'].values() if set(p['participantIds']) == parent_ids)
        source['partnershipExtensions'][parent_pair['id']] = {
            'chartAlignParentPairOverChildPersonId': core,
            'chartPackLeafSiblingBranchesBesideAlignedChild': True
        }
    if slug == 'banlaoch':
        source['warriorReference'] = ''
        source['unknownDataNote'] = 'Ausschließlich fehlende Banlaoch-Jahre wurden mit ausdrücklicher Nutzerfreigabe ergänzt. Gründer vor dem Zeitsprung bleiben undatiert. Unbekannte Geschlechter und Herkunftshäuser bleiben offen.'
        chronology = json.loads((Path(__file__).parent / 'chronology.json').read_text('utf-8'))
        for coordinate, entry in chronology['assignments'].items():
            if entry['kind'] == 'authorized-reconstruction':
                source['personExtensions'][mapped(coordinate)] = {
                    'sourceChronology': {'kind': entry['kind'], 'referenceYear': 1740,
                                        'assignedFields': list(entry['values']),
                                        'note': 'Jahre mit ausdrücklicher Nutzerfreigabe ergänzt; kein Datum der undatierten Grafik.'}
                }

def decorate_patch(record, patch):
    for fields in patch['collections'].get('persons', {}).values():
        fields.pop('notes', None)
    if record['id'] == 'haus-frostauge':
        house = next(h for h in patch['additionalHouses'] if h['id'] == 'house-diuid')
        patch['collections']['cadetBranches'] = {
            'married-away-ragnfrid-frostauge-diud': {
                'name': house['name'], 'subtitle': 'Wegverheiratet an ' + house['name'],
                'houseId': house['id'], 'targetFamilyId': 'haus-diuid', 'emblem': house['emblem']
            }
        }

"""Dunfal-specific decisions; shared import stages contain no clan lore."""
def existing_house(card, old):
    return {'finnbar-mac-ailella':'house-ailella','grainne-chuulain':'house-chulainn'}.get(old['id'],old['houseId'])
def person_name(name, person_id):
    return 'Gráinne Chulainn' if person_id == 'grainne-chuulain' else name
def prepare_source(slug, source, person_id):
    if slug == 'ferbend': source['personRoles'][person_id(slug,'94.0')] = 'core'
def split_children(slug, source, pair_id, children, person_id):
    if slug != 'chulainn': return children
    adopted = [p for p in children if p in [person_id(slug,'128.2'),person_id(slug,'128.3')]]
    if adopted:
        source['descendants'].append({'partnershipId':pair_id,'childIds':adopted,'type':'adoptive','certainty':'confirmed','notes':'Adoption vom Nutzer am 07.10.2026 bestätigt.'})
        source['personRoles'].update({p:'adopted' for p in adopted})
    return [p for p in children if p not in adopted]

def decorate_source(slug, source, resolved, mapped):
    if slug == 'birn':
        # Xina continues the shared branch; Oran retains his own ancestry card.
        pair = next(pair for pair in resolved['partnerships'].values()
                    if set(pair['participantIds']) == {mapped('129.2'), mapped('133.0')})
        source['personExtensions'][mapped('129.2')] = {'chartRepeatForPartnershipIds': [pair['id']]}
        source['personExtensions'][mapped('133.0')] = {'chartPartnerMirrorForPartnershipIds': [pair['id']]}
        source['sourceNote'] += ' Der Nutzer bestätigt Oran–Xina; Banans abweichende Partnerüberschrift ist ein Vorlagenfehler.'
    if slug == 'riangabra':
        # Interlocked marriages form a chain, not two competing centred stars.
        order = [mapped(c) for c in ['153.1', '148.1', '153.2', '153.3']]
        source['personExtensions'][order[1]] = {
            'chartPartnerGroupPersonOrder': order,
            'chartCenterBetweenPartnerPersonIds': [order[0], order[2]],
            'chartKeepPartnerGroupTogether': True
        }
        source['partnershipExtensions'] = {}
        for first, second, partner in [(order[0], order[1], order[0]), (order[2], order[3], order[3])]:
            pair = next(p for p in resolved['partnerships'].values() if set(p['participantIds']) == {first, second})
            source['partnershipExtensions'][pair['id']] = {
                'chartAlignPartnerOverChildrenPersonId': partner,
                'chartReserveLeafChildLane': True,
                'chartArrangeLeafChildrenEvenly': True
            }
        middle = next(p for p in resolved['partnerships'].values() if set(p['participantIds']) == {order[1], order[2]})
        source['partnershipExtensions'][middle['id']] = {
            'chartAlignPartnerOverChildrenPersonId': order[2],
            'chartReserveLeafChildLane': True, 'chartArrangeLeafChildrenEvenly': True
        }
        # Browser-reviewed four-person chain: Loeg shares Glaisne's marriage lane.
        # A second centred star would pull the shared marriage in two directions.
        source['personExtensions'][order[2]] = {'chartMultiPartnerLayoutReviewed': True}

def decorate_patch(record, patch):
    if record['id'] == 'haus-ciarog':
        patch['collections'].setdefault('persons', {}).setdefault('shan-ciarog', {})['familyRole'] = 'ward-away'
        patch['wardAway'] = {'personId': 'shan-ciarog', 'targetFamilyId': 'haus-anbhair', 'houseId': 'house-anbhair'}
        patch['identityCorrection'] = {'personId': 'emer-ailella',
            'from': 'person--haus-ailella--emer-ailella', 'to': 'person--haus-ailella--emer-1675-ailella'}

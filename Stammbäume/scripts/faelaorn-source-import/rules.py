"""Faelaorn-specific decisions; no guessed dates, relationships or portraits."""

def existing_house(card, old):
    return {'mhor-1705-an-bhaird': 'house-bhaird'}.get(old['id'], old['houseId'])

def person_name(name, person_id):
    return name

def prepare_source(slug, source, person_id):
    pass

def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    if slug in ['stwatchn', 'dundas']:
        # Only a genealogy diagram was supplied, not a warrior illustration.
        source['warriorReference'] = ''
    if slug == 'bhaird':
        core, wife, affair = [mapped(c) for c in ['171.2', '180.0', '180.1']]
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
                'chartAlignPartnerOverChildrenPersonId': partner
            }
        # Keep Brigid's terminal marriage/house branch outside the complete
        # continuing Carolan branch, including Ciarag's two child groups.
        parents = {mapped('147.4'), mapped('152.4')}
        pair = next(p for p in resolved['partnerships'].values()
                    if set(p['participantIds']) == parents)
        source['partnershipExtensions'][pair['id']] = {
            'chartAlignParentPairOverChildPersonId': mapped('157.3'),
            'chartPackLeafSiblingBranchesBesideAlignedChild': True
        }

def decorate_patch(record, patch):
    # The detailed source explanation lives in the audit and new home record;
    # correcting dates or filling a portrait never replaces local research notes.
    for fields in patch['collections'].get('persons', {}).values():
        fields.pop('notes', None)

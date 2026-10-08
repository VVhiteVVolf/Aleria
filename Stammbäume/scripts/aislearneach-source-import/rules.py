"""Reviewed Aislearneach source rules; identities live in decisions.json."""

def existing_house(card, old):
    return 'house-fiachiontach' if old['id'] == 'ultan-tir-fiachiontach' else old['houseId']

def person_name(name, person_id):
    return name

def prepare_source(slug, source, person_id):
    pass

def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    if slug == 'morna':
        # Keep Kelch once between the continuing marriage and the terminal
        # affair. The existing router reserves a separate lane for Keir.
        core, wife, companion = [mapped(c) for c in ['132.2', '137.2', '137.3']]
        source['personExtensions'][core] = {
            'chartCenterBetweenPartnerPersonIds': [wife, companion],
            'chartPartnerGroupPersonOrder': [wife, core, companion],
            'chartKeepPartnerGroupTogether': True
        }
        source['partnershipExtensions'] = {}
        for partner in [wife, companion]:
            pair = next(p for p in resolved['partnerships'].values()
                        if set(p['participantIds']) == {core, partner})
            source['partnershipExtensions'][pair['id']] = {
                'chartAlignPartnerOverChildrenPersonId': partner
            }

def decorate_patch(record, patch):
    # These old house labels referred to the now sourced clans. Only existing
    # cross-house links change; their marriages and descent remain untouched.
    aliases = {
        'house-duibhne': ('house-ui-faill-duibhne', 'haus-ui-faill-duibhne'),
        'house-ghaisgh': ('house-gaisgh', 'haus-gaisgh'),
    }
    branches = {}
    for branch in record['family'].get('cadetBranches', []):
        target = aliases.get(branch['houseId'])
        if target:
            branches[branch['id']] = {'houseId': target[0], 'targetFamilyId': target[1]}
    if branches:
        patch['collections']['cadetBranches'] = branches

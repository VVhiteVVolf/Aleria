"""Only reviewed Blaithneach aliases, never heuristics based on a shared name."""
def existing_house(card, old):
    return {'vencha-mac-magach':'house-magach','alastar-mac-eala':'house-eala','donnagh-heaghra':'house-haeghra'}.get(old['id'],old['houseId'])
def person_name(name, person_id):
    return name
def prepare_source(slug, source, person_id):
    pass
def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    if slug == 'eala':
        # Two compact pair appearances keep both child groups below their own
        # parents. One canonical father, one canonical affair; no cloned person.
        core, companion = [mapped(c) for c in ['135.3', '140.4']]
        pair = next(p for p in resolved['partnerships'].values() if set(p['participantIds']) == {core, companion})
        source['personExtensions'][core] = {
            'chartRepeatForPartnershipIds': [pair['id']],
            'chartMultiPartnerLayoutReviewed': True
        }
        source['personExtensions'][companion] = {'chartPartnerMirrorForPartnershipIds': [pair['id']]}
    if slug == 'haeghra':
        core, former, husband = [mapped(c) for c in ['154.1', '163.1', '163.2']]
        source['personExtensions'][core] = {
            'chartCenterBetweenPartnerPersonIds': [former, husband],
            'chartPartnerGroupPersonOrder': [former, core, husband],
            'chartKeepPartnerGroupTogether': True
        }
def decorate_patch(record, patch):
    pass

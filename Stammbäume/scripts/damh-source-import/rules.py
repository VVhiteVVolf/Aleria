"""Damh-specific presentation of diagram-derived relationships."""
def existing_house(card, old):
    return old['houseId']

def person_name(name, person_id):
    return name

def prepare_source(slug, source, person_id):
    # Grey descendants continue Wrayne's branch; only the first connector
    # proves an affair. Do not change later marriages into affairs.
    if slug == 'elid':
        for c in ['50.3','60.3','60.4','70.2','70.3','70.4']:
            source['personRoles'][person_id(slug,c)] = 'bastard'

def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    source['warriorReference'] = ''
    configurations = {
        'agnew':[('60.0','61.0','61.1')],
        'dobhar':[('20.2','21.2','21.3')],
        'elid':[('30.2','31.2','31.3')],
        'oglivy':[('80.3','81.3','81.4')]
    }
    for coordinates in configurations.get(slug,[]):
        core,left,right=map(mapped,coordinates)
        source['personExtensions'][core]={
            'chartCenterBetweenPartnerPersonIds':[left,right],
            'chartPartnerGroupPersonOrder':[left,core,right],
            'chartKeepPartnerGroupTogether':True
        }
        for partner in [left,right]:
            pair=next(p for p in resolved['partnerships'].values() if set(p['participantIds'])=={core,partner})
            layout={'chartAlignPartnerOverChildrenPersonId':partner}
            if slug != 'elid':
                layout.update(chartReserveLeafChildLane=True,chartArrangeLeafChildrenEvenly=True)
            source.setdefault('partnershipExtensions',{})[pair['id']]=layout

def decorate_patch(record, patch):
    for fields in patch['collections'].get('persons',{}).values():
        fields.pop('notes',None)

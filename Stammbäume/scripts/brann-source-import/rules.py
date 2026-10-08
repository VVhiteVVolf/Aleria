"""Brann-specific spelling reconciliation and multi-partner presentation."""
def existing_house(card, old):
    return 'house-cerneige' if old['houseId']=='house-carnegie' else old['houseId']

def person_name(name, person_id):
    return name

def prepare_source(slug, source, person_id):
    pass

def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    source['warriorReference']=''
    if slug in ['dubglais','airdmhor']:source['unknownDataNote']='Nur die sechs undatierten jüngsten Dubglais-Kinder erhalten ausdrücklich genehmigte redaktionelle Geburtsjahre; übrige fehlende Daten bleiben offen.'
    groups={'wemyss':[('60.4',['61.3','61.4'],True)],'dubglais':[('80.0',['81.0','81.1'],False)]}
    for c,partner_coordinates,leaf in groups.get(slug,[]):
        core=mapped(c);partners=list(map(mapped,partner_coordinates))
        order=[partners[0],core,*partners[1:]]
        source['personExtensions'][core]={'chartCenterBetweenPartnerPersonIds':partners,'chartKeepPartnerGroupTogether':True}
        if len(partners)==2:source['personExtensions'][core]['chartPartnerGroupPersonOrder']=order
        for partner in partners:
            pair=next(p for p in resolved['partnerships'].values() if set(p['participantIds'])=={core,partner})
            layout={'chartAlignPartnerOverChildrenPersonId':partner}
            if leaf:layout.update(chartReserveLeafChildLane=True,chartArrangeLeafChildrenEvenly=True)
            else:layout['chartReserveDescendantBranchLane']=True
            source.setdefault('partnershipExtensions',{})[pair['id']]=layout
    if slug=='dubglais':
        core=mapped('90.4');partners=[]
        for coordinate in ['91.4','91.5','91.6','91.7']:
            partner=mapped(coordinate);partners.append(partner)
            pair=next(p for p in resolved['partnerships'].values() if set(p['participantIds'])=={core,partner})
            source.setdefault('partnershipExtensions',{})[pair['id']]={
                'chartAlignPartnerOverChildrenPersonId':partner,
                'chartReserveLeafChildLane':True,'chartArrangeLeafChildrenEvenly':True,
                # One owner per child lane: subsequent pair-midpoint alignment
                # must not undo the explicit partner/children anchor.
                'chartAlignChildGroupBelowParentPair':False,
                'chartAlignParentPairOverChildPersonId':''
            }
        source['personExtensions'][core]={'chartCenterBetweenPartnerPersonIds':partners,'chartKeepPartnerGroupTogether':True}

def decorate_patch(record, patch):
    for fields in patch['collections'].get('persons',{}).values():
        fields.pop('notes',None)
    branches={}
    for branch in record['family'].get('cadetBranches',[]):
        fields={}
        if branch.get('houseId')=='house-carnegie':fields['houseId']='house-cerneige'
        if branch.get('targetFamilyId')=='haus-carnegie':fields['targetFamilyId']='haus-cerneige'
        if fields:branches[branch['id']]=fields
    if branches:patch['collections']['cadetBranches']=branches

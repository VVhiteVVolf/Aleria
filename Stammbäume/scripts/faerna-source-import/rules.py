"""Faerna-specific layout for Trianach's two distinct partnerships."""
def existing_house(card, old):
    return old['houseId']

def person_name(name, person_id):
    return name

def prepare_source(slug, source, person_id):
    pass

def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    if slug != 'boyd':return
    core,wife,affair=[mapped(c) for c in ['158.0','163.0','163.1']]
    source['personExtensions'][core]={
      'chartCenterBetweenPartnerPersonIds':[wife,affair],
      'chartPartnerGroupPersonOrder':[wife,core,affair],
      'chartKeepPartnerGroupTogether':True
    }
    source['partnershipExtensions']={}
    for partner in [wife,affair]:
        pair=next(p for p in resolved['partnerships'].values() if set(p['participantIds'])=={core,partner})
        source['partnershipExtensions'][pair['id']]={
          'chartAlignPartnerOverChildrenPersonId':partner,
          'chartReserveLeafChildLane':True,'chartArrangeLeafChildrenEvenly':True
        }
    pair=next(p for p in resolved['partnerships'].values() if set(p['participantIds'])=={mapped('148.0'),mapped('153.0')})
    source['partnershipExtensions'][pair['id']]={'chartAlignParentPairOverChildPersonId':core,'chartPackLeafSiblingBranchesBesideAlignedChild':True}

def decorate_patch(record, patch):
    # Source commentary belongs in the new source record/audit. Existing local
    # biographies and notes are not replaced by a counterpart correction.
    for fields in patch['collections'].get('persons',{}).values():
        fields.pop('notes',None)

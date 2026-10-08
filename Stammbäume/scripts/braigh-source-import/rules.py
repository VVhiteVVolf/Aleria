"""Braigh-specific source semantics and additive counterpart ward references."""
def existing_house(card, old):
    return old['houseId']

def person_name(name, person_id):
    return name

def prepare_source(slug, source, person_id):
    pass

def split_children(slug, source, pair_id, children, person_id):
    return children

def decorate_source(slug, source, resolved, mapped):
    groups={
      'culloch':(['195.3','204.2','204.3'],['177.1','186.1']),
      'borthwick':(['148.3','157.2','157.3'],['138.2','143.2'])
    }
    if slug not in groups:return
    coordinates,parents=groups[slug]
    core,wife,affair=[mapped(c) for c in coordinates]
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
    pair=next(p for p in resolved['partnerships'].values() if set(p['participantIds'])=={mapped(c) for c in parents})
    source['partnershipExtensions'][pair['id']]={'chartAlignParentPairOverChildPersonId':core,'chartPackLeafSiblingBranchesBesideAlignedChild':True}

def decorate_patch(record, patch):
    for fields in patch['collections'].get('persons',{}).values():
        fields.pop('notes',None)
    wards={
      'haus-lockart':[('ronnat-1723-lockart','culloch','Mac Culloch')],
      'haus-haig':[('gobaith-1722-haig','culloch','Mac Culloch'),('fiadh-1727-haig','borthwick','Tir An Borthwick')]
    }
    if record['id'] not in wards:return
    patch['wardLinks']=[]
    for pid,slug,name in wards[record['id']]:
        patch['collections'].setdefault('persons',{}).setdefault(pid,{})['familyRole']='ward-away'
        house={'id':'house-'+slug,'name':name,'motto':'','emblem':'assets/images/houses/Faelaorn/clan-'+slug+'.png','status':'active'}
        if not any(h['id']==house['id'] for h in patch['additionalHouses']):patch['additionalHouses'].append(house)
        patch['wardLinks'].append({'personId':pid,'familyId':'haus-'+slug,'houseId':house['id'],'name':name,'emblem':house['emblem']})

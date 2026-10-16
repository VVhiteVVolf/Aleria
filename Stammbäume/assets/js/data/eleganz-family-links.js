import { createFamilyPerson, createParentages, createCadetHouseBranch } from './family-record-builders.js';
import { ELEGANZ_EMBLEMS, ELEGANZ_MARRIAGES } from '../../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-family-people.mjs';
import { eleganzFamilyPerson, eleganzMarriage, eleganzPid } from './eleganz-family-records.js';
import { withMarriedAwayContinuation } from './married-away-continuation.js';

const relatedHouse = (slug, name) => ({ id: `house-${slug}`, name: `Haus ${name}`, emblem: ELEGANZ_EMBLEMS[slug], status: 'active' });

export function withEleganzCoedduLink(source) {
  const family = structuredClone(source);
  const maelwen = family.persons.find(p => p.id === 'maelwen-coeddu');
  if (!maelwen) throw new Error('Die bestehende Maelwen Coeddu fehlt.');
  Object.assign(maelwen, { title: eleganzFamilyPerson('maelwen').title, notes: eleganzFamilyPerson('maelwen').notes, portrait: eleganzFamilyPerson('maelwen').portrait,
    extensions: { ...maelwen.extensions, registryManagedFields: ['title','notes','portrait'] } });
  family.houses.push(relatedHouse('raves','Raves'));
  family.persons.push(eleganzFamilyPerson('tiberian'),eleganzFamilyPerson('serafina'));
  family.partnerships.push(eleganzMarriage('tiberian','haus-raves'));
  family.parentages.push(...createParentages([eleganzPid('serafina')], ELEGANZ_MARRIAGES.tiberian.people.map(eleganzPid), ELEGANZ_MARRIAGES.tiberian.id));
  family.extensions.sourceRevision = 4;
  return Object.freeze(withMarriedAwayContinuation(family, { id: 'married-away-maelwen-raves', name: 'Haus Raves', parentPartnershipId: ELEGANZ_MARRIAGES.tiberian.id,
    childIds: [eleganzPid('serafina')],
    houseId: 'house-raves', targetFamilyId: 'haus-raves', emblem: ELEGANZ_EMBLEMS.raves, crestFrame: 'iron', notes: 'Maelwen heiratete Tiberian Raves. Die vollständige Raves-Linie steht in ihrer eigenen Akte.' }));
}

export function withEleganzMaerllysLink(source) {
  const family = structuredClone(source);
  const bridge = 'unbekannter-bruder-gwenora-maerllys';
  const firstGap = 'gap-maerllys-to-gwenora';
  const founders = family.partnerships.find(m => m.id === family.lineage.founderPartnershipId).participantIds;
  const laterGap = family.timeJumps[0];
  family.houses.push(relatedHouse('veltrane','Veltrane'),relatedHouse('raves','Raves'));
  family.persons.push(eleganzFamilyPerson('gwenora',{familyRole:'core'}),eleganzFamilyPerson('matteo',{familyRole:'married'}),
    createFamilyPerson({ id: bridge, name: 'Unbekannter Bruder', sex: 'male', birth: '', death: '????', houseId: 'house-maerllys',
      notes: 'Gwenoras Bruder gehört zur älteren Schneiderfamilie. Die genaue Generationenfolge bis Cadfan und Owain ist nicht überliefert.' }));
  family.partnerships.push(eleganzMarriage('founders','haus-raves'));
  family.parentages = family.parentages.map(p => !laterGap.childIds.includes(p.childId) || p.extensions?.timeJumpId !== laterGap.id ? p : ({
    ...p, parentIds: [bridge], partnershipId: '', certainty: 'unknown',
    notes: 'Die Maerllys-Hauptlinie führt über Gwenoras unbenannten Bruder und nicht einzeln überlieferte Generationen zu Cadfan und Owain.',
    extensions: { ...p.extensions, registryManagedFields: ['parentIds','partnershipId','certainty','notes'] }
  }));
  family.parentages.push(...createParentages([eleganzPid('gwenora'),bridge],founders,family.lineage.founderPartnershipId,
    { type:'claimed',certainty:'unknown',notes:'Überlieferung über nicht einzeln bekannte Generationen.',extensions:{timeJumpId:firstGap} }));
  family.timeJumps = [
    { id:firstGap,parentPartnershipId:family.lineage.founderPartnershipId,parentPersonId:'',childIds:[eleganzPid('gwenora'),bridge],years:0,fromYear:'',toYear:'1638',label:'Älterer Schneiderzweig um Gwenora',notes:'Die Namen der frühen Generationen sind verloren.',extensions:{preparedPlaceholder:false} },
    { ...laterGap,parentPartnershipId:'',parentPersonId:bridge,label:'Nicht einzeln überlieferte Maerllys-Generationen bis Cadfan und Owain',
      notes:'Die spätere Maerllys-Linie folgt seriell hinter Gwenoras unbenanntem Bruder. Die Raves-Nachkommen bleiben in ihrer eigenen Akte.' }
  ];
  family.cadetBranches.push(createCadetHouseBranch({ id:'raves-branch-maerllys',name:'Haus Raves',parentPartnershipId:ELEGANZ_MARRIAGES.founders.id,
    houseId:'house-raves',targetFamilyId:'haus-raves',emblem:ELEGANZ_EMBLEMS.raves,crestFrame:'iron',founded:'1662',
    notes:'Gwenora und Matteo begründeten den Raves-Zweig. Dessen Nachkommen werden ausschließlich dort gezeigt.' }));
  family.document.description = 'Gwynthorer Schneiderfamilie, deren Schere und Garnrolle seit Generationen für gute Arbeit stehen. Gwenora Maerllys begründete mit Matteo Veltrane die Raves-Linie; die jüngere Hauptlinie führt bis zu Nia und ihren Geschwistern.';
  family.extensions.sourceRevision = 7;
  family.extensions.registryManagedDocumentFields = [...new Set([...(family.extensions.registryManagedDocumentFields || []),'description'])];
  return Object.freeze(family);
}

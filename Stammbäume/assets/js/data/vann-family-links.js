import { createMarriedAwayBranch, createParentages } from './family-record-builders.js';
import { VANN_MARRIAGES, VANN_EMBLEM, vannPerson } from '../../../../AleriaAlmanach/modules/letzte-rast/rast-people.mjs';
import { vannFamilyPerson, vannFamilyMarriage } from './vann-family-records.js';

const links={
  'haus-maerllys':{key:'elowen',marriage:'marriage-edern-elowen-vann',husband:'edern'},
  'haus-pendrwn':{key:'enid',marriage:'marriage-aneirin-enid-vann',husband:'aneirin'},
  'haus-raves':{key:'orestian',marriage:'marriage-orestian-eirlys-vann',husband:'orestian',destination:true}
};
/** Bounded editorial marriage addition; only the three chosen houses change. */
export function withVannFamilyLink(source) {
  const link=links[source.document.id];
  if(!link) return source;
  const family=structuredClone(source);
  const definition=VANN_MARRIAGES.find(m=>m.id===link.marriage);
  const original=family.persons.find(p=>p.id===vannPerson(link.key).id);
  if(!original || original.worldPersonId!==vannPerson(link.key).worldPersonId) throw new Error(`Bestehende Identität fehlt: ${link.key}`);
  if(family.partnerships.some(m=>m.participantIds.includes(original.id))) throw new Error(`Bereits verheiratet: ${original.name}`);
  const projected=vannFamilyPerson(link.key);
  if(!link.destination) Object.assign(original,{title:projected.title,notes:`${original.name} heiratete ${vannPerson(link.husband).name} im Jahr ${definition.start} und lebt und arbeitet seither in der Letzten Rast.`,portrait:projected.portrait,
    extensions:{...original.extensions,registryManagedFields:[...new Set([...(original.extensions.registryManagedFields||[]),'title','notes','portrait'])]}});
  family.houses.push({id:'house-vann',name:'Haus Vann',emblem:VANN_EMBLEM,status:'active'});
  const other=definition.keys.find(key=>key!==link.key);
  family.persons.push({...vannFamilyPerson(other),familyRole:'married'});
  family.partnerships.push(vannFamilyMarriage(definition,'haus-vann'));
  if(link.destination) {
    for(const key of definition.children) family.persons.push(vannFamilyPerson(key));
    family.parentages.push(...createParentages(definition.children.map(key=>vannPerson(key).id),definition.keys.map(key=>vannPerson(key).id),definition.id));
  } else {
    family.cadetBranches.push(createMarriedAwayBranch({id:`married-away-${link.key}-vann`,name:'Haus Vann',parentPartnershipId:definition.id,houseId:'house-vann',targetFamilyId:'haus-vann',emblem:VANN_EMBLEM,crestFrame:'iron',
      notes:'Nachkommen dieser Ehe werden ausschließlich in der Vann-Akte fortgeführt.'}));
  }
  family.extensions={...family.extensions,sourceRevision:Number(family.extensions.sourceRevision||0)+1,
    sourceNote:`${family.extensions.sourceNote||''} Ergänzung 16.10.2026: ${vannPerson(other).name} und ${original.name} heirateten ${definition.start}. ${link.destination?'Ihre Kinder Cassian und Elena werden bei Raves geführt.':'Die Fortsetzung dieser Ehe steht ausschließlich im Haus Vann.'}`};
  return Object.freeze(family);
}

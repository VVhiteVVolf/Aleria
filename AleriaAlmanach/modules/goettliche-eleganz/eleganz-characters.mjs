import { ELEGANZ_PEOPLE } from './eleganz-family-people.mjs';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup, retiredFamilySources } from '../character-genealogy/character-group-import-plan.mjs';
const families=FAMILY_REGISTRY.filter(r=>['haus-raves','haus-veltrane','haus-maerllys','haus-coeddu'].includes(r.id));
const candidates=families.flatMap(createFamilyCandidates);
export function planEleganzCharacters(existingCharacters,config,now=new Date().toISOString()) {
  const members=ELEGANZ_PEOPLE.map(person=>{
    const links=candidates.filter(c=>c.worldPersonId===person.worldPersonId);
    const primary=links.find(c=>c.familyId===`haus-${person.house}`) || links.find(c=>c.familyId==='haus-raves');
    return {key:person.key,candidates:links,primaryCandidate:primary,subgroup:primary.familyTitle.replace(/^Haus /,''),
      retiredSources:retiredFamilySources(families.map(record=>record.family),person.worldPersonId),
      profile:{name:person.name,title:person.role,role:person.role,bio:person.bio,portrait:person.portrait,fraktion:'Göttliche Eleganz',
        currentLocation:person.death?'':person.destination || 'Gwynthor · Göttliche Eleganz',origin:person.house==='veltrane'?'Tirnara · Kaiserreich Argentum':'Gwynthor',
        relevance:person.key==='eleonora'?'supporting':'minor'}};
  });
  return planFamilyCharacterGroup({members,existingCharacters,config,group:'Göttliche Eleganz',now});
}

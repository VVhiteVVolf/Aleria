import { getRegisteredFamily } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyViewLink } from '../../../Stammbäume/assets/js/services/family-links.js';

// Build-time references: live family records stay authoritative and are never edited.
export function familyReference(id) {
  const family=getRegisteredFamily(id)?.family;
  if(!family)throw new Error(`Aldrimars Familienakte fehlt: ${id}`);
  return family;
}

export function personReference(familyId,personId) {
  const person=familyReference(familyId).persons.find(p=>p.id===personId);
  if(!person)throw new Error(`Aldrimars Stammbaumperson fehlt: ${familyId}/${personId}`);
  return {
    personName:person.name,birth:person.birth,death:person.death,
    portrait:'/Stammbäume/'+person.portrait,
    href:'/Stammbäume/'+createFamilyViewLink(familyId,personId),
  };
}

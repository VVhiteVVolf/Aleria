import { NIXE_FAMILY_PEOPLE, NIXE_ART } from './nixe-family-people.mjs';
import { nixeNamedStaff } from './nixe-hierarchy.mjs';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';

const record = FAMILY_REGISTRY.find(record => record.id === 'haus-sonnenfels');
const candidates = createFamilyCandidates(record);
const identity = person => ({ worldPersonId: `person--lachende-nixe--${person.key}`, displayName: person.name,
  title: person.role, sex: person.sex || 'male', status: 'alive', birth: person.birth || '', death: '',
  houseId: '', houseName: '', tags: [], relationships: { parents: [], partners: [], children: [] }, folderPath: [] });

export function planNixeCharacters(source, existingCharacters, config, now = new Date().toISOString()) {
  const family = NIXE_FAMILY_PEOPLE.map(person => ({ key: person.key,
    candidates: candidates.filter(candidate => candidate.worldPersonId === person.worldPersonId),
    subgroup: person.house === 'falkenhayn' ? 'Falkenhayn' : 'Sonnenfels',
    profile: { name: person.name, title: person.role, role: person.role, bio: person.bio, portrait: person.portrait,
      fraktion: person.location.includes('Gwynthor') ? 'Die Lachende Nixe' : 'Haus Sonnenfels',
      currentLocation: person.death ? '' : person.location, origin: 'Weisenfluh',
      relevance: person.key === 'albrecht' ? 'supporting' : 'minor' } }));
  const staff = [...nixeNamedStaff(source), { key: 'lorcan', name: 'Lorcan Scáthaire',
    role: 'Engster Vertrauter · rechte Hand', portrait: `${NIXE_ART}/references/lorcan.png`,
    bio: 'Lorcan spricht selten vor allen. Er hält Albrecht den Rücken frei, trägt vertrauliche Nachrichten und kennt die Gespräche, die besser im Hinterzimmer bleiben.' }]
    .map(person => ({ key: person.key, candidates: [], identityCandidate: identity(person),
      subgroup: person.key === 'lorcan' ? 'Hausleitung' : 'Gesellschaft & Musik',
      profile: { name: person.name, title: person.role, role: person.role, bio: person.bio,
        portrait: person.portrait, fraktion: 'Die Lachende Nixe', currentLocation: 'Gwynthor · Die Lachende Nixe',
        origin: person.key === 'thjodhild' ? 'Aldrimar' : person.key === 'adeltrud' ? 'Weisenfluh' : '', relevance: 'minor' } }));
  return planFamilyCharacterGroup({ members: [...family, ...staff], existingCharacters, config, group: 'Die Lachende Nixe', now });
}

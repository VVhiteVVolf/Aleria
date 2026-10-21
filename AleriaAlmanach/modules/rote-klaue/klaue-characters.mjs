import { KLAUE_LIVING } from './klaue-people.mjs';
import { HOUSE_VALERUS_FAMILY } from '../../../Stammbäume/assets/js/data/house-valerus-family.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';
/** Offline import plan; existing profiles retain their portraits and live data. */
export function planKlaueCharacters(existingCharacters = [], config = {}, now = '2026-10-21T00:00:00Z') {
  const candidates = createFamilyCandidates({ id: 'haus-valerus', title: 'Haus Valerus', family: HOUSE_VALERUS_FAMILY,
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] });
  const members = KLAUE_LIVING.map(p => ({ key: p.key, subgroup: p.familyRole ? 'Haus Valerus' : /Legionär/.test(p.role) ? 'Rote Kompanie' : 'Angestellte',
    candidates: candidates.filter(c => c.worldPersonId === p.worldPersonId),
    identityCandidate: { worldPersonId: p.worldPersonId, displayName: p.name, title: p.role, sex: p.sex, status: 'alive', birth: p.birth, death: '', houseId: '', houseName: '', tags: [],
      relationships: { parents: [], partners: [], children: [] }, folderPath: [] },
    profile: { name: p.name, title: p.role, role: p.role, bio: p.bio, portrait: p.portrait, currentLocation: 'Die rote Klaue · Gwynthor', origin: p.culture,
      fraktion: /Legionär/.test(p.role) ? 'Rote Kompanie' : ['lucan', 'camilla'].includes(p.key) ? 'Klingende Münze' : 'Die rote Klaue', relevance: p.familyRole ? 'supporting' : 'minor' }
  }));
  return planFamilyCharacterGroup({ members, existingCharacters, config, group: 'Die rote Klaue', now });
}

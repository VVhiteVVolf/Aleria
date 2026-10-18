import { CNEACAIL_FAMILY_PEOPLE } from '../cneacail-family/cneacail-people.mjs';
import { KRONE_STAFF } from './krone-people.mjs';
import { SEPT_CNEACAIL_FAMILY } from '../../../Stammbäume/assets/js/data/sept-cneacail-family.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';
/** Offline publication plan; named relatives are kept separate from the tavern staff. */
export function planKroneCharacters(existingCharacters = [], config = {}, now = '2026-10-18T00:00:00Z') {
  const candidates = createFamilyCandidates({ id: 'sept-cneacail', title: 'Sept Cneacail', family: SEPT_CNEACAIL_FAMILY, folderPath: ['Ceitheach', 'Tir na Dorcha', 'Glaennmor', 'Bun na h-Aibhne'] });
  const members = [...CNEACAIL_FAMILY_PEOPLE, ...KRONE_STAFF].map(p => ({ key: p.key, subgroup: p.key === 'finlay' || KRONE_STAFF.includes(p) ? 'Klingende Krone · Personal' : 'Sept Cneacail · Familie', candidates: candidates.filter(c => c.worldPersonId === p.worldPersonId),
    identityCandidate: { worldPersonId: p.worldPersonId, displayName: p.name, title: p.role, sex: p.sex, status: p.death ? 'dead' : 'alive', birth: p.birth || String(1740 - p.age), death: p.death || '', houseId: '', houseName: '', tags: [], relationships: { parents: [], partners: [], children: [] }, folderPath: [] },
    profile: { name: p.name, title: p.role, role: p.role, bio: p.bio, portrait: p.portrait, fraktion: p.key === 'finlay' || ['lucien', 'maelle'].includes(p.key) ? 'Klingende Münze' : p.key === 'alasdair' ? 'Zum Letzten Heller' : KRONE_STAFF.includes(p) ? 'Zur Klingenden Krone' : 'Sept Cneacail', currentLocation: ['arran', 'nessa', 'eithne', 'catriona'].includes(p.key) ? '' : 'Gwynthor', origin: p.origin, relevance: p.key === 'finlay' ? 'supporting' : 'minor' } }));
  return planFamilyCharacterGroup({ members, existingCharacters, config, group: 'Klingende Krone und Sept Cneacail', now });
}

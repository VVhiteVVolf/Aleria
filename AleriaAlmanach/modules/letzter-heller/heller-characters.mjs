import { HELLER_PEOPLE } from './heller-people.mjs';
import { SEPT_CNEACAIL_FAMILY } from '../../../Stammbäume/assets/js/data/sept-cneacail-family.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';
/** Offline plan only; existing online identities, prose and resources remain owned by the shared planner. */
export function planHellerCharacters(existingCharacters = [], config = {}, now = '2026-10-18T00:00:00Z') {
  const candidates = createFamilyCandidates({ id: 'sept-cneacail', title: 'Sept Cneacail', family: SEPT_CNEACAIL_FAMILY, folderPath: ['Ceitheach', 'Tir na Dorcha', 'Glaennmor', 'Bun na h-Aibhne'] });
  const members = HELLER_PEOPLE.map(p => ({ key: p.key, subgroup: ['arran', 'finlay'].includes(p.key) ? 'Sept Cneacail · Angehörige' : p.role.startsWith('Dirne') ? 'Dirnen' : 'Hausstand', candidates: candidates.filter(c => c.worldPersonId === p.worldPersonId),
    identityCandidate: { worldPersonId: p.worldPersonId, displayName: p.name, title: p.role, sex: p.sex, status: p.death ? 'dead' : 'alive', birth: p.birth || String(1740 - p.age), death: p.death || '', houseId: '', houseName: '', tags: [], relationships: { parents: [], partners: [], children: [] }, folderPath: [] },
    profile: { name: p.name, title: p.role, role: p.role, bio: p.bio, portrait: p.portrait, fraktion: p.key === 'finlay' ? 'Klingende Münze' : p.key === 'arran' ? 'Sept Cneacail · Verstorben' : 'Zum Letzten Heller', currentLocation: p.death ? '' : 'Gwynthor', origin: p.origin, relevance: p.key === 'alasdair' ? 'supporting' : 'minor' } }));
  return planFamilyCharacterGroup({ members, existingCharacters, config, group: 'Zum Letzten Heller', now });
}

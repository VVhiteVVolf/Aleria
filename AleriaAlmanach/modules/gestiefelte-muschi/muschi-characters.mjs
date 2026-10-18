import { MUSCHI_PEOPLE } from './muschi-people.mjs';
import { HOUSE_DESELE_FAMILY } from '../../../Stammbäume/assets/js/data/brevanor-desele-bielle-records.js';
import { createFamilyCandidates } from '../character-genealogy/genealogy-mapping.js';
import { planFamilyCharacterGroup } from '../character-genealogy/character-group-import-plan.mjs';
const identity = p => ({ worldPersonId: p.worldPersonId, displayName: p.name, title: p.role, sex: p.sex, status: 'alive', birth: p.birth || String(1740 - p.age), death: '', houseId: '', houseName: '', tags: [], relationships: { parents: [], partners: [], children: [] }, folderPath: [] });
const group = p => p.key === 'daric' ? 'Sicherheit' : p.key === 'rheunwaith' ? 'Ausschank' : p.retained || p.key === 'helviane' ? 'Führung & Logistik' : 'Gesellschaft & Unterhaltung';
/** Offline import plan. A later publisher can supply live profiles; the shared
 * planner preserves their IDs, portraits, prose, equipment and live resources. */
export function planMuschiCharacters(existingCharacters = [], config = {}, now = '2026-10-18T00:00:00Z') {
  const candidates = createFamilyCandidates({ id: 'haus-desele', title: 'Haus Desele', family: HOUSE_DESELE_FAMILY, folderPath: ['Brevanor'] });
  const members = MUSCHI_PEOPLE.map(p => ({ key: p.key, subgroup: group(p), candidates: candidates.filter(c => c.worldPersonId === p.worldPersonId), identityCandidate: identity(p),
    profile: { name: p.name, title: p.role, role: p.role, bio: p.bio, portrait: p.portrait, fraktion: 'Die Gestiefelte Muschi', currentLocation: 'Gwynthor · Die Gestiefelte Muschi', origin: p.origin, relevance: p.key === 'helviane' ? 'supporting' : 'minor' } }));
  return planFamilyCharacterGroup({ members, existingCharacters, config, group: 'Die Gestiefelte Muschi', now });
}

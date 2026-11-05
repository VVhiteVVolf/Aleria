import { createFamilyPersonCandidate, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { ARGALL_CAPTAIN_HOME, ARGALL_CAPTAIN_PEOPLE } from './household.mjs';

export const ARGALL_CAPTAIN_FEATURE = 'fleischsammler-argall';
export const ARGALL_CAPTAIN_AUTHORED_AT = '2026-11-02T00:00:00.000Z';

export function buildArgallHouseholdExports(familyRecord) {
  return Object.entries(ARGALL_CAPTAIN_PEOPLE).map(([role, spec]) => {
    const person = familyRecord.family.persons.find(person => person.id === spec.id);
    if (!person || person.worldPersonId !== spec.worldPersonId) throw Error(`Stammbaumfigur fehlt: ${spec.name}`);
    const candidate = createFamilyPersonCandidate(familyRecord, person);
    const assignedTab = ['captain', 'squire'].includes(role) ? 'Gwynthor' : 'Aberon';
    return {
      type: 'aleria-character', version: 1, exportedAt: ARGALL_CAPTAIN_AUTHORED_AT,
      mergeStrategy: 'replace-exported-fields', assignedTab,
      sourcePath: `Charakter Archiv Exporte/Fleischsammler Argall/${spec.id}.json`,
      character: {
        ...buildImportedCharacter(candidate, null, ARGALL_CAPTAIN_AUTHORED_AT),
        id: spec.worldPersonId, name: spec.name, race: 'Mensch', age: spec.age,
        currentLocation: assignedTab === 'Gwynthor' ? `${ARGALL_CAPTAIN_HOME.name} · Gwynthor` : 'Aberon',
        bio: spec.biography,
        biography: structuredClone(person.extensions.biographyModule)
      }
    };
  });
}

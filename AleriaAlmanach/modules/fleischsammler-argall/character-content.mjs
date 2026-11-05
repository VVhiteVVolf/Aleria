import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { ARGALL_CAPTAIN_HOME, ARGALL_CAPTAIN_PEOPLE } from './household.mjs';

export const ARGALL_CAPTAIN_FEATURE = 'fleischsammler-argall';
export const ARGALL_CAPTAIN_AUTHORED_AT = '2026-11-02T00:00:00.000Z';

// The same image identities feed exports and import classification. Other
// relatives keep their existing candidates; the source family is never edited.
export function buildArgallHouseholdCandidates(familyRecord) {
  const persons = familyRecord.family.persons.map(person => {
    const spec = Object.values(ARGALL_CAPTAIN_PEOPLE).find(spec => spec.id === person.id);
    return spec ? { ...person, portrait: spec.portrait } : person;
  });
  return createFamilyCandidates({ ...familyRecord, family: { ...familyRecord.family, persons } });
}

export function buildArgallHouseholdExports(familyRecord) {
  const candidates = buildArgallHouseholdCandidates(familyRecord);
  return Object.entries(ARGALL_CAPTAIN_PEOPLE).map(([role, spec]) => {
    const person = familyRecord.family.persons.find(person => person.id === spec.id);
    if (!person || person.worldPersonId !== spec.worldPersonId) throw Error(`Stammbaumfigur fehlt: ${spec.name}`);
    // Family display paths are relative to the tree host. Character exports
    // keep the authored image identity, including its genealogy fingerprint.
    const candidate = candidates.find(candidate => candidate.personId === spec.id);
    const biography = structuredClone(person.extensions.biographyModule);
    biography.biography.portrait = spec.portrait;
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
        biography
      }
    };
  });
}

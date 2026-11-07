import { LAND_FAMILIEN_ROSTER } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';
import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { getCharacterWorldPersonId } from '../character-genealogy/person-identity.js';
import { buildLandfamilienPersonBiography } from './landfamilien-person-biographies.mjs';

export const LANDFAMILIEN_CHARACTER_FEATURE = 'gwynthor-landfamilien';
export const LANDFAMILIEN_CHARACTERS_AUTHORED_AT = '2026-11-07T00:00:00.000Z';

function ownerRecord(records, spec) {
  const record = records.find(record => record.id === spec.familyId);
  if (!record) throw new Error(`Familienquelle fehlt: ${spec.familyId}`);
  return record;
}

export function buildLandfamilienCharacterCandidates(records) {
  return LAND_FAMILIEN_ROSTER.families.flatMap(spec => {
    // Each source has the real cross-family engagement projections. For primary
    // character classification only its owning household contributes candidates.
    const ownedIds = new Set(spec.persons.map(person => person.id));
    return createFamilyCandidates(ownerRecord(records, spec)).filter(candidate => ownedIds.has(candidate.personId));
  });
}

export function resolveLandfamilienRuntimeCharacter(candidate, characters) {
  const matches = characters.filter(character => character.id === candidate.worldPersonId
    || getCharacterWorldPersonId(character) === candidate.worldPersonId
    || character.genealogy?.sources?.some(source => source.familyId === candidate.familyId && source.personId === candidate.personId));
  const distinct = [...new Map(matches.map(character => [character.id, character])).values()];
  if (distinct.length > 1) throw new Error(`Mehrere Laufzeitakten derselben Weltperson: ${candidate.worldPersonId}`);
  const current = distinct[0] || null;
  if (current && getCharacterWorldPersonId(current) && getCharacterWorldPersonId(current) !== candidate.worldPersonId) {
    throw new Error(`Widersprüchliche bestehende Weltperson: ${current.id}`);
  }
  return current;
}

export function buildLandfamilienCharacterExports(records, existingCharacters = []) {
  const candidates = buildLandfamilienCharacterCandidates(records);
  return LAND_FAMILIEN_ROSTER.families.flatMap(spec => {
    const family = ownerRecord(records, spec).family;
    return spec.persons.map(person => {
      const source = family.persons.find(source => source.id === person.id);
      const candidate = candidates.find(candidate => candidate.familyId === spec.familyId && candidate.personId === person.id);
      if (!source?.worldPersonId || !candidate || candidate.worldPersonId !== source.worldPersonId || candidate.status !== person.status) {
        throw new Error(`Stammbaumidentität fehlt: ${person.id}`);
      }
      const existing = resolveLandfamilienRuntimeCharacter(candidate, existingCharacters);
      const { bio, biography } = buildLandfamilienPersonBiography(person, spec, candidate);
      return {
        type: 'aleria-character', version: 1, exportedAt: LANDFAMILIEN_CHARACTERS_AUTHORED_AT,
        mergeStrategy: 'replace-exported-fields', assignedTab: 'Gwynthor',
        sourcePath: `Charakter Archiv Exporte/Gwynthorer Landfamilien/${spec.slug}/${person.id}.json`,
        character: {
          ...buildImportedCharacter(candidate, null, LANDFAMILIEN_CHARACTERS_AUTHORED_AT),
          id: existing?.id || source.worldPersonId, name: person.name, title: person.role, role: person.role,
          race: 'Mensch', age: person.age, currentLocation: `${spec.placeName} · Bannkreis Gwynthor`,
          origin: 'Rheunwaith · Cenyr', portrait: person.portrait, bio, biography, archived: false
        }
      };
    });
  });
}

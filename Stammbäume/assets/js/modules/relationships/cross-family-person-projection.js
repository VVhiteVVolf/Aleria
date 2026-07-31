import {
  cloneValue,
  createRecordId,
  createWorldPersonId,
  normalizeFamily
} from '../../domain/family-schema.js';
import {
  buildImportedPersonValues,
  findExistingImport
} from '../../services/relation-actions.js';

function normalizedLinkPart(value) {
  return String(value || '')
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function withCanonicalWorldPersonIds(familyInput) {
  const family = cloneValue(normalizeFamily(familyInput));
  family.persons.forEach(person => {
    if (!person.worldPersonId) person.worldPersonId = createWorldPersonId(family.document.id, person.id);
  });
  return normalizeFamily(family);
}

export function stableCrossFamilyLinkId(kind, firstFamily, firstPerson, secondFamily, secondPerson) {
  return [
    kind,
    firstFamily.document.id,
    firstPerson.worldPersonId || firstPerson.id,
    secondFamily.document.id,
    secondPerson.worldPersonId || secondPerson.id
  ].map(normalizedLinkPart).filter(Boolean).join('-').slice(0, 170);
}

export function ensureProjectedHouse(targetFamily, sourceFamily, sourcePerson) {
  const sourceHouse = sourceFamily.houses.find(house => house.id === sourcePerson.houseId);
  if (!sourceHouse || targetFamily.houses.some(house => house.id === sourceHouse.id)) return null;
  const house = cloneValue(sourceHouse);
  targetFamily.houses.push(house);
  return house;
}

export function ensureProjectedPerson(
  targetFamily,
  sourceFamily,
  sourcePerson,
  { familyRole = 'married', updateExistingRole = false } = {}
) {
  ensureProjectedHouse(targetFamily, sourceFamily, sourcePerson);
  const existing = findExistingImport(targetFamily, sourcePerson);
  if (existing) {
    if (updateExistingRole) existing.familyRole = familyRole;
    return existing;
  }
  const imported = buildImportedPersonValues(sourceFamily, sourcePerson, {
    targetFamily,
    familyRole
  });
  const { house: _house, ...personValues } = imported;
  const person = {
    ...personValues,
    id: personValues.id || createRecordId('person', targetFamily.persons.map(item => item.id)),
    extensions: { ...(personValues.extensions || {}) }
  };
  targetFamily.persons.push(person);
  return person;
}

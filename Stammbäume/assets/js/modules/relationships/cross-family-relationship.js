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
import {
  applyExclusivePartnershipChange,
  planExclusivePartnershipChange
} from './exclusive-partnership-policy.js';

function ensureHouse(targetFamily, sourceFamily, sourcePerson) {
  const sourceHouse = sourceFamily.houses.find(house => house.id === sourcePerson.houseId);
  if (!sourceHouse || targetFamily.houses.some(house => house.id === sourceHouse.id)) return;
  targetFamily.houses.push(cloneValue(sourceHouse));
}

function ensurePerson(targetFamily, sourceFamily, sourcePerson) {
  const existing = findExistingImport(targetFamily, sourcePerson);
  if (existing) return existing.id;
  const imported = buildImportedPersonValues(sourceFamily, sourcePerson, {
    targetFamily,
    familyRole: 'married'
  });
  const { house, ...personValues } = imported;
  if (house) ensureHouse(targetFamily, sourceFamily, sourcePerson);
  targetFamily.persons.push({
    ...personValues,
    id: personValues.id || createRecordId('person', targetFamily.persons.map(person => person.id)),
    extensions: { ...(personValues.extensions || {}) }
  });
  return personValues.id;
}

function stableLinkId(firstFamily, firstPerson, secondFamily, secondPerson) {
  return ['linked', firstFamily.document.id, firstPerson.worldPersonId || firstPerson.id, secondFamily.document.id, secondPerson.worldPersonId || secondPerson.id]
    .join('-')
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 150);
}

function withCanonicalWorldPersonIds(familyInput) {
  const family = cloneValue(normalizeFamily(familyInput));
  family.persons.forEach(person => {
    if (!person.worldPersonId) person.worldPersonId = createWorldPersonId(family.document.id, person.id);
  });
  return normalizeFamily(family);
}

function projectPartnership(targetInput, sourceInput, targetPersonId, sourcePersonId, values, linkId) {
  const target = cloneValue(normalizeFamily(targetInput));
  const source = normalizeFamily(sourceInput);
  const sourcePerson = source.persons.find(person => person.id === sourcePersonId);
  if (!sourcePerson) throw new Error('Die Person der anderen Familienakte wurde nicht gefunden.');
  const importedSourcePersonId = ensurePerson(target, source, sourcePerson);
  return applyExclusivePartnershipChange(target, {
    participantIds: [targetPersonId, importedSourcePersonId],
    type: values.type,
    status: values.status || 'active',
    certainty: values.certainty || 'confirmed',
    visibility: values.visibility || 'public',
    extensions: {
      crossFamilyRelationship: {
        linkId,
        counterpartFamilyId: source.document.id
      }
    }
  });
}

export function createMirroredPartnershipChange({
  currentFamily: currentInput,
  counterpartFamily: counterpartInput,
  currentPersonId,
  counterpartPersonId,
  type,
  status = 'active',
  certainty = 'confirmed',
  visibility = 'public'
}) {
  const currentFamily = withCanonicalWorldPersonIds(currentInput);
  const counterpartFamily = withCanonicalWorldPersonIds(counterpartInput);
  if (currentFamily.document.id === counterpartFamily.document.id) {
    throw new Error('Für Personen derselben Familienakte ist keine Registerspiegelung nötig.');
  }
  const currentPerson = currentFamily.persons.find(person => person.id === currentPersonId);
  const counterpartPerson = counterpartFamily.persons.find(person => person.id === counterpartPersonId);
  if (!currentPerson || !counterpartPerson) throw new Error('Mindestens eine Person der Verbindung wurde nicht gefunden.');
  const linkId = stableLinkId(currentFamily, currentPerson, counterpartFamily, counterpartPerson);
  const currentProjection = projectPartnership(
    currentFamily,
    counterpartFamily,
    currentPersonId,
    counterpartPersonId,
    { type, status, certainty, visibility },
    linkId
  );
  const counterpartProjection = projectPartnership(
    counterpartFamily,
    currentFamily,
    counterpartPersonId,
    currentPersonId,
    { type, status, certainty, visibility },
    linkId
  );
  return Object.freeze({
    linkId,
    currentFamily: currentProjection.family,
    counterpartFamily: counterpartProjection.family,
    currentPlan: currentProjection.plan,
    counterpartPlan: counterpartProjection.plan
  });
}

function mirroredPartnershipByLink(family, linkId) {
  const matches = family.partnerships.filter(partnership => (
    partnership.extensions?.crossFamilyRelationship?.linkId === linkId
  ));
  if (matches.length !== 1) {
    throw new Error('Die gespiegelte Verbindung ist in einer Familienakte nicht eindeutig vorhanden.');
  }
  return matches[0];
}

function patchMirroredPartnership(familyInput, linkId, values) {
  const family = cloneValue(normalizeFamily(familyInput));
  const partnership = mirroredPartnershipByLink(family, linkId);
  Object.assign(partnership, {
    ...values,
    id: partnership.id,
    participantIds: partnership.participantIds,
    extensions: {
      ...(partnership.extensions || {}),
      ...(values.extensions || {}),
      crossFamilyRelationship: partnership.extensions.crossFamilyRelationship
    }
  });
  return normalizeFamily(family);
}

export function updateMirroredPartnershipChange({
  currentFamily: currentInput,
  counterpartFamily: counterpartInput,
  partnershipId,
  values
}) {
  const currentFamily = normalizeFamily(currentInput);
  const counterpartFamily = normalizeFamily(counterpartInput);
  const currentPartnership = currentFamily.partnerships.find(item => item.id === partnershipId);
  const relationship = currentPartnership?.extensions?.crossFamilyRelationship;
  if (!relationship?.linkId || !relationship.counterpartFamilyId) {
    throw new Error('Diese Verbindung ist nicht als registerübergreifende Beziehung markiert.');
  }
  if (relationship.counterpartFamilyId !== counterpartFamily.document.id) {
    throw new Error('Die verknüpfte Familienakte passt nicht zur gespiegelten Verbindung.');
  }
  if (values.type && values.type !== currentPartnership.type && ['active', 'secret'].includes(values.status || currentPartnership.status)) {
    [currentFamily, counterpartFamily].forEach(family => {
      const partnership = mirroredPartnershipByLink(family, relationship.linkId);
      planExclusivePartnershipChange(family, {
        participantIds: partnership.participantIds,
        type: values.type
      });
    });
  }
  return Object.freeze({
    linkId: relationship.linkId,
    currentFamily: patchMirroredPartnership(currentFamily, relationship.linkId, values),
    counterpartFamily: patchMirroredPartnership(counterpartFamily, relationship.linkId, values)
  });
}

import {
  cloneValue,
  createRecordId,
  normalizeFamily
} from '../../domain/family-schema.js';
import {
  applyExclusivePartnershipChange,
  isExclusiveActivePartnership,
  planExclusivePartnershipChange
} from './exclusive-partnership-policy.js';
import {
  ensureProjectedHouse,
  ensureProjectedPerson,
  stableCrossFamilyLinkId,
  withCanonicalWorldPersonIds
} from './cross-family-person-projection.js';

function primaryHouse(family) {
  return family.houses.find(house => house.id === family.lineage.houseId) || null;
}

function addMarriedAwayBranch(familyInput, partnershipId, targetFamily, linkId) {
  const family = cloneValue(normalizeFamily(familyInput));
  const targetHouse = primaryHouse(targetFamily);
  if (!targetHouse) throw new Error('Das Zielhaus der Wegverheiratung wurde nicht gefunden.');
  ensureProjectedHouse(family, targetFamily, { houseId: targetHouse.id });
  const existing = family.cadetBranches.find(branch => (
    branch.linkType === 'married-away'
    && branch.parentPartnershipId === partnershipId
    && branch.targetFamilyId === targetFamily.document.id
  ));
  const values = {
    id: existing?.id || createRecordId('married-away', family.cadetBranches.map(branch => branch.id)),
    name: targetFamily.document.title,
    subtitle: 'Wegverheiratete Linie',
    linkType: 'married-away',
    parentPartnershipId: partnershipId,
    parentPersonId: '',
    houseId: targetHouse.id,
    emblem: targetHouse.emblem || '',
    emblemScale: 0.86,
    crestFrame: targetFamily.lineage.crestFrame || 'silver',
    frameScale: 1,
    founded: '',
    targetFamilyId: targetFamily.document.id,
    notes: `Wegverheiratet an ${targetFamily.document.title}.`,
    extensions: {
      ...(existing?.extensions || {}),
      crossFamilyRelationship: {
        linkId,
        counterpartFamilyId: targetFamily.document.id
      }
    }
  };
  if (existing) Object.assign(existing, values);
  else family.cadetBranches.push(values);
  return normalizeFamily(family);
}

function applyMirroredPartnershipChange(familyInput, values) {
  if (isExclusiveActivePartnership(values)) return applyExclusivePartnershipChange(familyInput, values);
  const family = cloneValue(normalizeFamily(familyInput));
  const participantIds = [...new Set(values.participantIds || [])];
  const existing = family.partnerships.find(partnership => (
    partnership.type === values.type
    && partnership.participantIds.length === participantIds.length
    && participantIds.every(personId => partnership.participantIds.includes(personId))
    && ['active', 'secret'].includes(partnership.status || 'active')
  ));
  if (existing) {
    existing.extensions = { ...(existing.extensions || {}), ...(values.extensions || {}) };
    return Object.freeze({
      family: normalizeFamily(family),
      plan: Object.freeze({ mode: 'idempotent', partnershipId: existing.id })
    });
  }
  const partnershipId = values.id || createRecordId('partnership', family.partnerships.map(item => item.id));
  family.partnerships.push({
    id: partnershipId,
    participantIds,
    type: values.type,
    status: values.status || 'active',
    start: values.start || '',
    end: values.end || '',
    certainty: values.certainty || 'confirmed',
    visibility: values.visibility || 'public',
    notes: values.notes || '',
    extensions: { ...(values.extensions || {}) }
  });
  return Object.freeze({
    family: normalizeFamily(family),
    plan: Object.freeze({ mode: 'create', partnershipId })
  });
}

function projectPartnership(targetInput, sourceInput, targetPersonId, sourcePersonId, values, linkId) {
  const target = cloneValue(normalizeFamily(targetInput));
  const source = normalizeFamily(sourceInput);
  const sourcePerson = source.persons.find(person => person.id === sourcePersonId);
  if (!sourcePerson) throw new Error('Die Person der anderen Familienakte wurde nicht gefunden.');
  const importedSourcePerson = ensureProjectedPerson(target, source, sourcePerson, {
    familyRole: values.type === 'affair' ? 'affair' : 'married'
  });
  return applyMirroredPartnershipChange(target, {
    participantIds: [targetPersonId, importedSourcePerson.id],
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
  visibility = 'public',
  leavingFamilyId = ''
}) {
  const currentFamily = withCanonicalWorldPersonIds(currentInput);
  const counterpartFamily = withCanonicalWorldPersonIds(counterpartInput);
  if (currentFamily.document.id === counterpartFamily.document.id) {
    throw new Error('Für Personen derselben Familienakte ist keine Registerspiegelung nötig.');
  }
  const currentPerson = currentFamily.persons.find(person => person.id === currentPersonId);
  const counterpartPerson = counterpartFamily.persons.find(person => person.id === counterpartPersonId);
  if (!currentPerson || !counterpartPerson) throw new Error('Mindestens eine Person der Verbindung wurde nicht gefunden.');
  const linkId = stableCrossFamilyLinkId('relationship', currentFamily, currentPerson, counterpartFamily, counterpartPerson);
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
  let nextCurrentFamily = currentProjection.family;
  let nextCounterpartFamily = counterpartProjection.family;
  if (type === 'marriage' && leavingFamilyId === currentFamily.document.id) {
    nextCurrentFamily = addMarriedAwayBranch(nextCurrentFamily, currentProjection.plan.partnershipId, counterpartFamily, linkId);
  } else if (type === 'marriage' && leavingFamilyId === counterpartFamily.document.id) {
    nextCounterpartFamily = addMarriedAwayBranch(nextCounterpartFamily, counterpartProjection.plan.partnershipId, currentFamily, linkId);
  }
  return Object.freeze({
    linkId,
    currentFamily: nextCurrentFamily,
    counterpartFamily: nextCounterpartFamily,
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

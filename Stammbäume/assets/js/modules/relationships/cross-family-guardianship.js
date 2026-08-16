import { cloneValue, createRecordId, normalizeFamily } from '../../domain/family-schema.js';
import {
  ensureProjectedHouse,
  ensureProjectedPerson,
  stableCrossFamilyLinkId,
  withCanonicalWorldPersonIds
} from './cross-family-person-projection.js';
import { isExclusiveActivePartnership } from './exclusive-partnership-policy.js';
import { isPersonUnconnected } from './family-record-removal.js';

function primaryHouse(family) {
  return family.houses.find(house => house.id === family.lineage.houseId) || null;
}

function activeSpouseId(family, guardianId) {
  return family.partnerships.find(partnership => (
    partnership.participantIds.includes(guardianId)
    && isExclusiveActivePartnership(partnership)
    && ['marriage', 'union'].includes(partnership.type)
  ))?.participantIds.find(personId => personId !== guardianId) || '';
}

function guardianshipDetails(linkId, wardFamily, ward, guardianFamily, guardian) {
  return Object.freeze({
    linkId,
    wardFamilyId: wardFamily.document.id,
    guardianFamilyId: guardianFamily.document.id,
    wardWorldPersonId: ward.worldPersonId,
    guardianWorldPersonId: guardian.worldPersonId
  });
}

function projectWardHome(familyInput, guardianFamily, wardId, details) {
  const family = cloneValue(normalizeFamily(familyInput));
  const ward = family.persons.find(person => person.id === wardId);
  const targetHouse = primaryHouse(guardianFamily);
  if (!ward || !targetHouse) throw new Error('Mündel oder Zielhaus wurde nicht gefunden.');
  ensureProjectedHouse(family, guardianFamily, { houseId: targetHouse.id });
  const note = `Als Mündel an ${guardianFamily.document.title} gegeben.`;
  ward.familyRole = 'ward-away';
  ward.tags = [...new Set([...(ward.tags || []), 'Fortgegebenes Mündel'])];
  ward.notes = ward.notes && !ward.notes.includes(note) ? `${ward.notes} ${note}` : (ward.notes || note);
  ward.extensions = {
    ...(ward.extensions || {}),
    crossFamilyGuardianship: details
  };

  const existing = family.cadetBranches.find(branch => (
    branch.extensions?.crossFamilyGuardianship?.linkId === details.linkId
    || (branch.linkType === 'ward-away' && branch.parentPersonId === wardId)
  ));
  const values = {
    id: existing?.id || createRecordId('ward-away', family.cadetBranches.map(branch => branch.id)),
    name: guardianFamily.document.title,
    subtitle: 'Als Mündel vermittelt',
    linkType: 'ward-away',
    parentPartnershipId: '',
    parentPersonId: wardId,
    houseId: targetHouse.id,
    emblem: targetHouse.emblem || '',
    emblemScale: 0.86,
    crestFrame: guardianFamily.lineage.crestFrame || 'silver',
    frameScale: 1,
    founded: '',
    targetFamilyId: guardianFamily.document.id,
    notes: note,
    extensions: {
      ...(existing?.extensions || {}),
      crossFamilyGuardianship: details
    }
  };
  if (existing) Object.assign(existing, values);
  else family.cadetBranches.push(values);
  return normalizeFamily(family);
}

function projectGuardianHome(familyInput, wardFamily, guardianId, wardId, details) {
  const family = cloneValue(normalizeFamily(familyInput));
  const ward = wardFamily.persons.find(person => person.id === wardId);
  if (!ward || !family.persons.some(person => person.id === guardianId)) {
    throw new Error('Mündel oder aufnehmende Person wurde nicht gefunden.');
  }
  const importedWard = ensureProjectedPerson(family, wardFamily, ward, {
    familyRole: 'ward',
    updateExistingRole: true
  });
  importedWard.extensions = {
    ...(importedWard.extensions || {}),
    crossFamilyGuardianship: details
  };
  const spouseId = activeSpouseId(family, guardianId);
  const parentIds = [guardianId, spouseId].filter(Boolean).filter(personId => personId !== importedWard.id);
  const partnershipId = family.partnerships.find(partnership => (
    parentIds.length === partnership.participantIds.length
    && parentIds.every(personId => partnership.participantIds.includes(personId))
  ))?.id || '';
  const existing = family.parentages.find(parentage => (
    parentage.extensions?.crossFamilyGuardianship?.linkId === details.linkId
  ));
  const values = {
    id: existing?.id || createRecordId('parentage', family.parentages.map(parentage => parentage.id)),
    childId: importedWard.id,
    parentIds,
    partnershipId,
    type: 'foster',
    legitimacy: 'unknown',
    certainty: 'confirmed',
    visibility: 'public',
    notes: `Als Mündel aus ${wardFamily.document.title} aufgenommen.`,
    extensions: {
      ...(existing?.extensions || {}),
      crossFamilyGuardianship: details
    }
  };
  if (existing) Object.assign(existing, values);
  else family.parentages.push(values);
  return normalizeFamily(family);
}

export function createMirroredGuardianshipChange({
  currentFamily: currentInput,
  counterpartFamily: counterpartInput,
  currentPersonId,
  counterpartPersonId,
  currentRole
}) {
  const currentFamily = withCanonicalWorldPersonIds(currentInput);
  const counterpartFamily = withCanonicalWorldPersonIds(counterpartInput);
  if (currentFamily.document.id === counterpartFamily.document.id) {
    throw new Error('Für Personen derselben Familienakte ist keine Registerspiegelung nötig.');
  }
  if (!['guardian', 'ward'].includes(currentRole)) throw new Error('Die Richtung der Vormundschaft ist ungültig.');
  const guardianFamily = currentRole === 'guardian' ? currentFamily : counterpartFamily;
  const wardFamily = currentRole === 'ward' ? currentFamily : counterpartFamily;
  const guardianId = currentRole === 'guardian' ? currentPersonId : counterpartPersonId;
  const wardId = currentRole === 'ward' ? currentPersonId : counterpartPersonId;
  const guardian = guardianFamily.persons.find(person => person.id === guardianId);
  const ward = wardFamily.persons.find(person => person.id === wardId);
  if (!guardian || !ward) throw new Error('Mündel oder aufnehmende Person wurde nicht gefunden.');
  const linkId = stableCrossFamilyLinkId('guardianship', wardFamily, ward, guardianFamily, guardian);
  const details = guardianshipDetails(linkId, wardFamily, ward, guardianFamily, guardian);
  const nextWardFamily = projectWardHome(wardFamily, guardianFamily, wardId, details);
  const nextGuardianFamily = projectGuardianHome(guardianFamily, wardFamily, guardianId, wardId, details);
  return Object.freeze({
    linkId,
    currentFamily: currentRole === 'guardian' ? nextGuardianFamily : nextWardFamily,
    counterpartFamily: currentRole === 'guardian' ? nextWardFamily : nextGuardianFamily
  });
}

function appendTombstones(family, collection, ids) {
  if (!ids.length) return;
  const current = family.extensions?.registryTombstones || {};
  family.extensions = {
    ...(family.extensions || {}),
    registryTombstones: {
      ...current,
      [collection]: [...new Set([...(current[collection] || []), ...ids])]
    }
  };
}

function removeGuardianshipFromFamily(familyInput, linkId) {
  const family = cloneValue(normalizeFamily(familyInput));
  const removedBranchIds = family.cadetBranches
    .filter(branch => branch.extensions?.crossFamilyGuardianship?.linkId === linkId)
    .map(branch => branch.id);
  const removedParentages = family.parentages
    .filter(parentage => parentage.extensions?.crossFamilyGuardianship?.linkId === linkId);
  const removedParentageIds = removedParentages.map(parentage => parentage.id);
  const projectedWardIds = removedParentages.map(parentage => parentage.childId);
  family.cadetBranches = family.cadetBranches
    .filter(branch => !removedBranchIds.includes(branch.id));
  family.parentages = family.parentages
    .filter(parentage => !removedParentageIds.includes(parentage.id));

  family.persons.forEach(person => {
    if (person.extensions?.crossFamilyGuardianship?.linkId !== linkId) return;
    const extensions = { ...(person.extensions || {}) };
    delete extensions.crossFamilyGuardianship;
    person.extensions = extensions;
    if (person.familyRole === 'ward-away') person.familyRole = 'core';
    person.tags = (person.tags || []).filter(tag => tag !== 'Fortgegebenes Mündel');
    person.notes = String(person.notes || '')
      .replace(/\s*Als Mündel an [^.]+ gegeben\./gu, '')
      .trim();
  });

  const removedPersonIds = projectedWardIds.filter(personId => {
    const person = family.persons.find(item => item.id === personId);
    return person?.familyRole === 'ward' && isPersonUnconnected(family, personId);
  });
  family.persons = family.persons.filter(person => !removedPersonIds.includes(person.id));
  if (removedPersonIds.includes(family.view.focusPersonId)) family.view.focusPersonId = family.persons[0]?.id || '';
  appendTombstones(family, 'cadetBranches', removedBranchIds);
  appendTombstones(family, 'parentages', removedParentageIds);
  appendTombstones(family, 'persons', removedPersonIds);
  return normalizeFamily(family);
}

function guardianshipLink(family, { parentageId = '', personId = '', linkId = '' }) {
  if (linkId) {
    return family.parentages.find(parentage => parentage.extensions?.crossFamilyGuardianship?.linkId === linkId)
      ?.extensions?.crossFamilyGuardianship
      || family.persons.find(person => person.extensions?.crossFamilyGuardianship?.linkId === linkId)
        ?.extensions?.crossFamilyGuardianship
      || null;
  }
  if (parentageId) {
    return family.parentages.find(parentage => parentage.id === parentageId)
      ?.extensions?.crossFamilyGuardianship || null;
  }
  return family.persons.find(person => person.id === personId)
    ?.extensions?.crossFamilyGuardianship || null;
}

export function removeMirroredGuardianshipChange({
  currentFamily: currentInput,
  counterpartFamily: counterpartInput,
  parentageId = '',
  personId = '',
  linkId = ''
}) {
  const currentFamily = normalizeFamily(currentInput);
  const counterpartFamily = normalizeFamily(counterpartInput);
  const relationship = guardianshipLink(currentFamily, { parentageId, personId, linkId });
  if (!relationship?.linkId) {
    throw new Error('Diese Mündelverknüpfung ist nicht als registerübergreifend markiert.');
  }
  const counterpartHasLink = counterpartFamily.cadetBranches.some(branch => (
    branch.extensions?.crossFamilyGuardianship?.linkId === relationship.linkId
  )) || counterpartFamily.parentages.some(parentage => (
    parentage.extensions?.crossFamilyGuardianship?.linkId === relationship.linkId
  ));
  if (!counterpartHasLink) throw new Error('Die gespiegelte Mündelverknüpfung fehlt in der Gegenakte.');
  return Object.freeze({
    linkId: relationship.linkId,
    currentFamily: removeGuardianshipFromFamily(currentFamily, relationship.linkId),
    counterpartFamily: removeGuardianshipFromFamily(counterpartFamily, relationship.linkId)
  });
}

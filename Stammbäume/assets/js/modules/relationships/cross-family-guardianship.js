import { cloneValue, createRecordId, normalizeFamily } from '../../domain/family-schema.js';
import {
  ensureProjectedHouse,
  ensureProjectedPerson,
  stableCrossFamilyLinkId,
  withCanonicalWorldPersonIds
} from './cross-family-person-projection.js';
import { isExclusiveActivePartnership } from './exclusive-partnership-policy.js';

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

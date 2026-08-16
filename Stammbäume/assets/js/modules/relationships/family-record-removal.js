import { cloneValue, normalizeFamily } from '../../domain/family-schema.js';

const REGISTRY_COLLECTIONS = Object.freeze([
  'persons',
  'partnerships',
  'parentages',
  'cadetBranches',
  'timeJumps'
]);

function appendRegistryTombstones(family, removals) {
  const current = family.extensions?.registryTombstones || {};
  const registryTombstones = { ...current };
  REGISTRY_COLLECTIONS.forEach(collection => {
    const removedIds = removals[collection] || [];
    if (!removedIds.length) return;
    registryTombstones[collection] = [...new Set([
      ...(current[collection] || []),
      ...removedIds
    ])];
  });
  family.extensions = {
    ...(family.extensions || {}),
    registryTombstones
  };
}

function restoreParentageBeforeTimeJump(parentage) {
  const previous = parentage.extensions?.timeJumpPrevious;
  if (!previous) return null;
  return {
    ...parentage,
    parentIds: [...previous.parentIds],
    partnershipId: previous.partnershipId,
    type: previous.type,
    legitimacy: previous.legitimacy,
    certainty: previous.certainty,
    visibility: previous.visibility,
    notes: previous.notes,
    extensions: cloneValue(previous.extensions || {})
  };
}

function removeTimeJumps(family, timeJumpIds) {
  if (!timeJumpIds.size) return;
  family.timeJumps = family.timeJumps.filter(timeJump => !timeJumpIds.has(timeJump.id));
  family.parentages = family.parentages.flatMap(parentage => {
    if (!timeJumpIds.has(parentage.extensions?.timeJumpId)) return [parentage];
    const restored = restoreParentageBeforeTimeJump(parentage);
    if (restored) return [restored];
    return parentage.extensions?.timeJumpCreated === true ? [] : [{
      ...parentage,
      extensions: Object.fromEntries(Object.entries(parentage.extensions || {}).filter(([key]) => (
        !['timeJumpId', 'timeJumpCreated', 'timeJumpPrevious'].includes(key)
      )))
    }];
  });
}

export function isPersonUnconnected(family, personId) {
  return !family.partnerships.some(partnership => partnership.participantIds.includes(personId))
    && !family.parentages.some(parentage => (
      parentage.childId === personId || parentage.parentIds.includes(personId)
    ))
    && !family.cadetBranches.some(branch => branch.parentPersonId === personId)
    && !family.timeJumps.some(timeJump => (
      timeJump.parentPersonId === personId || timeJump.childIds.includes(personId)
    ))
    && !family.lineage.originHouse.childIds.includes(personId);
}

export function removePartnershipRecord(familyInput, partnershipId, options = {}) {
  const family = cloneValue(normalizeFamily(familyInput));
  const partnership = family.partnerships.find(item => item.id === partnershipId);
  if (!partnership) throw new Error('Die Verbindung wurde nicht gefunden.');

  const removedBranchIds = family.cadetBranches
    .filter(branch => branch.parentPartnershipId === partnershipId)
    .map(branch => branch.id);
  const removedTimeJumpIds = new Set(family.timeJumps
    .filter(timeJump => timeJump.parentPartnershipId === partnershipId)
    .map(timeJump => timeJump.id));

  family.partnerships = family.partnerships.filter(item => item.id !== partnershipId);
  family.parentages.forEach(parentage => {
    if (parentage.partnershipId === partnershipId) parentage.partnershipId = '';
  });
  family.cadetBranches = family.cadetBranches.filter(branch => branch.parentPartnershipId !== partnershipId);
  family.timeJumps.forEach(timeJump => {
    timeJump.sharedParentPartnershipIds = timeJump.sharedParentPartnershipIds
      .filter(id => id !== partnershipId);
  });
  removeTimeJumps(family, removedTimeJumpIds);
  family.parentages.forEach(parentage => {
    if (parentage.partnershipId === partnershipId) parentage.partnershipId = '';
  });
  if (family.lineage.founderPartnershipId === partnershipId) family.lineage.founderPartnershipId = '';

  const removablePersonIds = new Set(options.removeUnconnectedPersonIds || []);
  const removedPersonIds = family.persons
    .filter(person => removablePersonIds.has(person.id) && isPersonUnconnected(family, person.id))
    .map(person => person.id);
  if (removedPersonIds.length) {
    const removed = new Set(removedPersonIds);
    family.persons = family.persons.filter(person => !removed.has(person.id));
    if (removed.has(family.view.focusPersonId)) family.view.focusPersonId = family.persons[0]?.id || '';
  }

  appendRegistryTombstones(family, {
    persons: removedPersonIds,
    partnerships: [partnershipId],
    cadetBranches: removedBranchIds,
    timeJumps: [...removedTimeJumpIds]
  });
  return normalizeFamily(family);
}

export function removeParentageRecord(familyInput, parentageId, options = {}) {
  const family = cloneValue(normalizeFamily(familyInput));
  const parentage = family.parentages.find(item => item.id === parentageId);
  if (!parentage) throw new Error('Die Eltern-Kind-Verknüpfung wurde nicht gefunden.');
  const childId = parentage.childId;
  family.parentages = family.parentages.filter(item => item.id !== parentageId);
  family.timeJumps.forEach(timeJump => {
    if (parentage.extensions?.timeJumpId === timeJump.id && timeJump.childIds.includes(childId)) {
      timeJump.childIds = timeJump.childIds.filter(id => id !== childId);
    }
  });

  let removedPersonIds = [];
  if (options.removeUnconnectedChild === true && isPersonUnconnected(family, childId)) {
    family.persons = family.persons.filter(person => person.id !== childId);
    family.timeJumps.forEach(timeJump => {
      timeJump.childIds = timeJump.childIds.filter(id => id !== childId);
    });
    if (family.view.focusPersonId === childId) family.view.focusPersonId = family.persons[0]?.id || '';
    removedPersonIds = [childId];
  }

  appendRegistryTombstones(family, {
    persons: removedPersonIds,
    parentages: [parentageId]
  });
  return normalizeFamily(family);
}

export function removePersonRecord(familyInput, personId) {
  let family = cloneValue(normalizeFamily(familyInput));
  if (!family.persons.some(person => person.id === personId)) {
    throw new Error('Die Person wurde nicht gefunden.');
  }

  const partnershipIds = family.partnerships
    .filter(partnership => partnership.participantIds.includes(personId))
    .map(partnership => partnership.id);
  const removedPartnershipIds = [...partnershipIds];
  partnershipIds.forEach(partnershipId => {
    family = cloneValue(removePartnershipRecord(family, partnershipId));
  });

  const parentageIds = family.parentages
    .filter(parentage => parentage.childId === personId || parentage.parentIds.includes(personId))
    .map(parentage => parentage.id);
  family.parentages = family.parentages
    .filter(parentage => parentage.childId !== personId)
    .map(parentage => ({
      ...parentage,
      parentIds: parentage.parentIds.filter(id => id !== personId)
    }))
    .filter(parentage => parentage.parentIds.length > 0);
  const survivingParentageIds = new Set(family.parentages.map(parentage => parentage.id));
  const removedParentageIds = parentageIds.filter(id => !survivingParentageIds.has(id));

  const removedBranchIds = family.cadetBranches
    .filter(branch => branch.parentPersonId === personId)
    .map(branch => branch.id);
  family.cadetBranches = family.cadetBranches.filter(branch => branch.parentPersonId !== personId);
  const removedTimeJumpIds = new Set(family.timeJumps
    .filter(timeJump => timeJump.parentPersonId === personId)
    .map(timeJump => timeJump.id));
  removeTimeJumps(family, removedTimeJumpIds);
  family.timeJumps.forEach(timeJump => {
    timeJump.childIds = timeJump.childIds.filter(id => id !== personId);
  });
  family.lineage.originHouse.childIds = family.lineage.originHouse.childIds.filter(id => id !== personId);
  family.persons = family.persons.filter(person => person.id !== personId);
  if (family.view.focusPersonId === personId) family.view.focusPersonId = family.persons[0]?.id || '';

  appendRegistryTombstones(family, {
    persons: [personId],
    partnerships: removedPartnershipIds,
    parentages: removedParentageIds,
    cadetBranches: removedBranchIds,
    timeJumps: [...removedTimeJumpIds]
  });
  return normalizeFamily(family);
}

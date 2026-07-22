import { cloneValue, createRecordId, normalizeFamily } from '../../domain/family-schema.js';

const EXCLUSIVE_TYPES = new Set(['marriage', 'engagement', 'union']);
const ACTIVE_STATUSES = new Set(['active', 'secret']);

export function isExclusiveActivePartnership(partnership) {
  return EXCLUSIVE_TYPES.has(partnership?.type) && ACTIVE_STATUSES.has(partnership?.status || 'active');
}

export function isReplaceableRelationshipPlaceholder(person) {
  return person?.extensions?.relationshipPlaceholder?.replaceable === true;
}

function safeToRemovePerson(family, personId, partnershipIdsToRemove) {
  const remainingPartnership = family.partnerships.some(partnership => (
    !partnershipIdsToRemove.has(partnership.id) && partnership.participantIds.includes(personId)
  ));
  if (remainingPartnership) return false;
  if (family.parentages.some(parentage => parentage.childId === personId || parentage.parentIds.includes(personId))) return false;
  if (family.timeJumps.some(timeJump => timeJump.parentPersonId === personId || timeJump.childIds.includes(personId))) return false;
  if (family.lineage.originHouse.childIds.includes(personId)) return false;
  return family.view.focusPersonId !== personId;
}

function partnershipReferenceScore(family, partnershipId) {
  return Number(family.lineage.founderPartnershipId === partnershipId) * 100
    + family.timeJumps.filter(item => item.parentPartnershipId === partnershipId).length * 10
    + family.cadetBranches.filter(item => item.parentPartnershipId === partnershipId).length * 5
    + family.parentages.filter(item => item.partnershipId === partnershipId).length;
}

function addRegistryTombstones(family, partnershipIds, personIds) {
  if (!partnershipIds.size && !personIds.size) return;
  const tombstones = family.extensions?.registryTombstones || {};
  family.extensions = {
    ...(family.extensions || {}),
    registryTombstones: {
      ...tombstones,
      partnerships: [...new Set([...(tombstones.partnerships || []), ...partnershipIds])],
      persons: [...new Set([...(tombstones.persons || []), ...personIds])]
    }
  };
}

export function planExclusivePartnershipChange(familyInput, values) {
  const family = normalizeFamily(familyInput);
  const participantIds = [...new Set(values.participantIds || [])].filter(Boolean);
  if (participantIds.length !== 2) throw new Error('Eine Ehe oder Verlobung benötigt genau zwei Personen.');
  if (!EXCLUSIVE_TYPES.has(values.type)) throw new Error('Diese Regel gilt nur für exklusive Partnerschaften.');
  participantIds.forEach(personId => {
    if (!family.persons.some(person => person.id === personId)) throw new Error('Eine Person der Verbindung wurde nicht gefunden.');
  });

  const samePair = family.partnerships.find(partnership => (
    isExclusiveActivePartnership(partnership)
    && participantIds.every(personId => partnership.participantIds.includes(personId))
  ));
  if (samePair?.type === values.type) {
    return Object.freeze({ mode: 'idempotent', partnershipId: samePair.id, removePartnershipIds: Object.freeze([]), removePersonIds: Object.freeze([]) });
  }
  if (samePair?.type === 'engagement' && values.type === 'marriage') {
    const competing = family.partnerships.filter(partnership => (
      partnership.id !== samePair.id
      && isExclusiveActivePartnership(partnership)
      && partnership.participantIds.some(personId => participantIds.includes(personId))
    ));
    if (competing.length) {
      throw new Error('Das Verlöbnis kann nicht zur Ehe werden, solange für eine beteiligte Person noch eine andere aktive Ehe, Verlobung oder Verbindung besteht.');
    }
    return Object.freeze({ mode: 'upgrade', partnershipId: samePair.id, removePartnershipIds: Object.freeze([]), removePersonIds: Object.freeze([]) });
  }
  if (samePair) throw new Error('Diese bestehende aktive Verbindung kann nicht still in die gewählte Art umgewandelt werden.');

  const removePartnershipIds = new Set();
  const placeholderPersonIds = new Set();
  participantIds.forEach(personId => {
    family.partnerships
      .filter(partnership => isExclusiveActivePartnership(partnership) && partnership.participantIds.includes(personId))
      .forEach(partnership => {
        const otherIds = partnership.participantIds.filter(id => id !== personId);
        const placeholders = otherIds.map(id => family.persons.find(person => person.id === id));
        if (!placeholders.length || placeholders.some(person => !isReplaceableRelationshipPlaceholder(person))) {
          const partnerNames = otherIds.map(id => family.persons.find(person => person.id === id)?.name || id).join(', ');
          throw new Error(`Es besteht bereits eine aktive Verbindung mit ${partnerNames}. Bitte diese Verbindung zuerst gezielt bearbeiten oder lösen.`);
        }
        removePartnershipIds.add(partnership.id);
        placeholders.forEach(person => {
          if (person) placeholderPersonIds.add(person.id);
        });
      });
  });
  const removePersonIds = new Set(
    [...placeholderPersonIds].filter(personId => safeToRemovePerson(family, personId, removePartnershipIds))
  );

  return Object.freeze({
    mode: removePartnershipIds.size ? 'replace-placeholder' : 'create',
    partnershipId: '',
    removePartnershipIds: Object.freeze([...removePartnershipIds]),
    removePersonIds: Object.freeze([...removePersonIds])
  });
}

export function applyExclusivePartnershipChange(familyInput, values) {
  const family = cloneValue(normalizeFamily(familyInput));
  const plan = planExclusivePartnershipChange(family, values);
  if (plan.mode === 'idempotent') {
    const partnership = family.partnerships.find(item => item.id === plan.partnershipId);
    partnership.certainty = values.certainty || partnership.certainty;
    partnership.visibility = values.visibility || partnership.visibility;
    partnership.extensions = { ...partnership.extensions, ...(values.extensions || {}) };
    return Object.freeze({ family: normalizeFamily(family), plan });
  }

  if (plan.mode === 'upgrade') {
    const partnership = family.partnerships.find(item => item.id === plan.partnershipId);
    partnership.type = 'marriage';
    partnership.status = values.status || 'active';
    partnership.start = values.start || partnership.start || '';
    partnership.end = '';
    partnership.certainty = values.certainty || partnership.certainty;
    partnership.visibility = values.visibility || partnership.visibility;
    partnership.extensions = { ...partnership.extensions, ...(values.extensions || {}) };
    return Object.freeze({ family: normalizeFamily(family), plan });
  }

  const removedPartnershipIds = new Set(plan.removePartnershipIds);
  if (removedPartnershipIds.size) {
    const replacedPartnerships = family.partnerships.filter(item => removedPartnershipIds.has(item.id));
    const retainedPartnership = [...replacedPartnerships].sort((first, second) => (
      partnershipReferenceScore(family, second.id) - partnershipReferenceScore(family, first.id)
      || first.id.localeCompare(second.id, 'de')
    ))[0];
    const retainedPartnershipId = retainedPartnership.id;
    const placeholderReplacements = new Map();
    replacedPartnerships.forEach(partnership => {
      const replacementId = values.participantIds.find(personId => !partnership.participantIds.includes(personId));
      if (!replacementId) return;
      partnership.participantIds.forEach(personId => {
        const person = family.persons.find(item => item.id === personId);
        if (isReplaceableRelationshipPlaceholder(person)) placeholderReplacements.set(personId, replacementId);
      });
    });

    const discardedPartnershipIds = new Set([...removedPartnershipIds].filter(id => id !== retainedPartnershipId));
    family.partnerships = family.partnerships.filter(item => !discardedPartnershipIds.has(item.id));
    Object.assign(retainedPartnership, {
      participantIds: [...new Set(values.participantIds)],
      type: values.type,
      status: values.status || 'active',
      start: values.start || '',
      end: values.end || '',
      certainty: values.certainty || 'confirmed',
      visibility: values.visibility || 'public',
      notes: values.notes || '',
      extensions: { ...(values.extensions || {}) }
    });
    if (removedPartnershipIds.has(family.lineage.founderPartnershipId)) {
      family.lineage.founderPartnershipId = retainedPartnershipId;
    }
    family.cadetBranches.forEach(branch => {
      if (removedPartnershipIds.has(branch.parentPartnershipId)) branch.parentPartnershipId = retainedPartnershipId;
    });
    family.timeJumps.forEach(timeJump => {
      if (removedPartnershipIds.has(timeJump.parentPartnershipId)) timeJump.parentPartnershipId = retainedPartnershipId;
    });
    family.parentages.forEach(parentage => {
      if (!removedPartnershipIds.has(parentage.partnershipId)) return;
      parentage.partnershipId = retainedPartnershipId;
      parentage.parentIds = [...new Set(parentage.parentIds.map(personId => placeholderReplacements.get(personId) || personId))];
    });

    const removedPersonIds = new Set(
      [...placeholderReplacements.keys()].filter(personId => safeToRemovePerson(family, personId, new Set()))
    );
    family.persons = family.persons.filter(person => !removedPersonIds.has(person.id));
    addRegistryTombstones(family, discardedPartnershipIds, removedPersonIds);
    return Object.freeze({
      family: normalizeFamily(family),
      plan: Object.freeze({
        ...plan,
        partnershipId: retainedPartnershipId,
        removePartnershipIds: Object.freeze([...discardedPartnershipIds]),
        removePersonIds: Object.freeze([...removedPersonIds])
      })
    });
  }

  const id = values.id || createRecordId('partnership', family.partnerships.map(item => item.id));
  family.partnerships.push({
    id,
    participantIds: [...new Set(values.participantIds)],
    type: values.type,
    status: values.status || 'active',
    start: values.start || '',
    end: values.end || '',
    certainty: values.certainty || 'confirmed',
    visibility: values.visibility || 'public',
    notes: values.notes || '',
    extensions: { ...(values.extensions || {}) }
  });
  return Object.freeze({ family: normalizeFamily(family), plan: Object.freeze({ ...plan, partnershipId: id }) });
}

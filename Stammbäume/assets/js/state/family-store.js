import {
  assertValidFamily,
  cloneValue,
  createRecordId,
  createWorldPersonId,
  normalizeFamily
} from '../domain/family-schema.js';
import { DEFAULT_CREST_FRAME } from '../config/chart-frames.js';
import {
  applyExclusivePartnershipChange,
  isExclusiveActivePartnership
} from '../modules/relationships/exclusive-partnership-policy.js';
import {
  removeParentageRecord,
  removePartnershipRecord,
  removePersonRecord
} from '../modules/relationships/family-record-removal.js';
import { assertNoDuplicateHouseBranch } from '../modules/houses/house-branch-deduplication.js';
import { refreshAutomaticSingleChildAlignment } from '../modules/relationships/single-child-alignment-policy.js';
import { refreshMultiplePartnershipAlignment } from '../modules/relationships/multiple-partnership-alignment-policy.js';
import { personHasMirroredConnections } from '../modules/relationships/relationship-action-policy.js';

const RELATED_PERSON_KINDS = new Set(['partnership', 'child', 'parent', 'time-jump-child', 'lineage-gap-child']);

function createSnapshot(family) {
  return cloneValue(family);
}

function refreshRelationshipLayout(family, partnershipIds = null) {
  refreshAutomaticSingleChildAlignment(family, partnershipIds);
  refreshMultiplePartnershipAlignment(family);
}

function appendRegistryTombstone(family, collection, id) {
  if (!id) return;
  const current = family.extensions?.registryTombstones || {};
  family.extensions = {
    ...(family.extensions || {}),
    registryTombstones: {
      ...current,
      [collection]: [...new Set([...(current[collection] || []), id])]
    }
  };
}

function createPersonRecord(values, id, familyId) {
  return {
    id,
    worldPersonId: values.worldPersonId || createWorldPersonId(familyId, id),
    name: values.name,
    title: values.title,
    sex: values.sex,
    status: values.status,
    birth: values.birth,
    death: values.death,
    portrait: values.portrait,
    portraitPlaceholder: values.portraitPlaceholder,
    houseId: values.houseId,
    familyRole: values.familyRole,
    lineageRole: values.lineageRole,
    tags: values.tags || [],
    notes: values.notes,
    extensions: cloneValue(values.extensions || {})
  };
}

function findPartnershipId(partnerships, participantIds) {
  const ids = [...new Set(participantIds)].filter(Boolean);
  return partnerships.find(partnership => (
    ids.length === partnership.participantIds.length
    && ids.every(personId => partnership.participantIds.includes(personId))
  ))?.id || '';
}

function hasMatchingParentage(family, values) {
  const parentIds = [...new Set(values.parentIds || [])];
  return family.parentages.some(parentage => (
    parentage.childId === values.childId
    && parentage.type === values.type
    && parentIds.length === parentage.parentIds.length
    && parentIds.every(personId => parentage.parentIds.includes(personId))
  ));
}

function resolveTimeJumpAnchor(draft, values) {
  const partnership = values.parentPartnershipId
    ? draft.partnerships.find(item => item.id === values.parentPartnershipId)
    : null;
  if (values.parentPartnershipId && !partnership) {
    throw new Error('Das Paar vor dem Zeitsprung wurde nicht gefunden.');
  }
  const person = !partnership && values.parentPersonId
    ? draft.persons.find(item => item.id === values.parentPersonId)
    : null;
  if (!partnership && !person) {
    throw new Error('Bitte eine Person oder ein Paar vor dem Zeitsprung wählen.');
  }
  return {
    parentIds: partnership ? partnership.participantIds.slice(0, 2) : [person.id],
    parentPartnershipId: partnership?.id || '',
    parentPersonId: partnership ? '' : person.id
  };
}

function applyTimeJumpParentage(parentage, timeJumpId, anchor, options = {}) {
  const existingExtensions = cloneValue(parentage.extensions || {});
  if (!existingExtensions.timeJumpId && options.created !== true) {
    existingExtensions.timeJumpPrevious = {
      parentIds: [...parentage.parentIds],
      partnershipId: parentage.partnershipId,
      type: parentage.type,
      legitimacy: parentage.legitimacy,
      certainty: parentage.certainty,
      visibility: parentage.visibility,
      notes: parentage.notes,
      extensions: cloneValue(parentage.extensions || {})
    };
  }
  parentage.parentIds = [...anchor.parentIds];
  parentage.partnershipId = anchor.parentPartnershipId;
  parentage.type = 'claimed';
  parentage.legitimacy = 'unknown';
  parentage.certainty = 'probable';
  parentage.visibility = 'public';
  parentage.notes = 'Nach einem Zeitsprung wieder belegte Linie.';
  parentage.extensions = {
    ...existingExtensions,
    timeJumpId,
    ...(options.created === true ? { timeJumpCreated: true } : {})
  };
}

function restoreParentageBeforeTimeJump(parentage) {
  const previous = parentage.extensions?.timeJumpPrevious;
  if (!previous) return null;
  Object.assign(parentage, {
    parentIds: [...previous.parentIds],
    partnershipId: previous.partnershipId,
    type: previous.type,
    legitimacy: previous.legitimacy,
    certainty: previous.certainty,
    visibility: previous.visibility,
    notes: previous.notes,
    extensions: cloneValue(previous.extensions || {})
  });
  return parentage;
}

function synchronizeTimeJumpParentages(draft, timeJumpId, childIds, anchor) {
  const selectedChildIds = new Set(childIds);
  draft.parentages = draft.parentages.flatMap(parentage => {
    if (parentage.extensions?.timeJumpId !== timeJumpId || selectedChildIds.has(parentage.childId)) {
      return [parentage];
    }
    const restored = restoreParentageBeforeTimeJump(parentage);
    return restored ? [restored] : [];
  });

  selectedChildIds.forEach(childId => {
    let parentage = draft.parentages.find(item => item.extensions?.timeJumpId === timeJumpId && item.childId === childId);
    if (!parentage) {
      parentage = draft.parentages.find(item => (
        item.childId === childId
        && item.partnershipId === anchor.parentPartnershipId
        && anchor.parentIds.every(parentId => item.parentIds.includes(parentId))
      ));
    }
    if (parentage) {
      applyTimeJumpParentage(parentage, timeJumpId, anchor);
      return;
    }
    parentage = {
      id: createRecordId('parentage', draft.parentages.map(item => item.id)),
      childId,
      parentIds: [],
      partnershipId: '',
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      visibility: 'public',
      notes: '',
      extensions: {}
    };
    applyTimeJumpParentage(parentage, timeJumpId, anchor, { created: true });
    draft.parentages.push(parentage);
  });
}

export function createFamilyStore(initialFamily, options = {}) {
  const maximumHistory = Number.isInteger(options.maximumHistory) ? Math.max(1, options.maximumHistory) : 60;
  let family = assertValidFamily(initialFamily).family;
  let selectedPersonId = family.view.focusPersonId || family.persons[0]?.id || '';
  let history = [];
  let future = [];
  const subscribers = new Set();

  function emit(type, details = {}, affectsFamily = false) {
    const event = Object.freeze({ type, details: Object.freeze({ ...details }), affectsFamily });
    subscribers.forEach(subscriber => subscriber(getState(), event));
  }

  function getState() {
    return Object.freeze({
      family: createSnapshot(family),
      selectedPersonId,
      canUndo: history.length > 0,
      canRedo: future.length > 0
    });
  }

  function subscribe(subscriber) {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  }

  function commit(type, mutator, details = {}) {
    const previous = createSnapshot(family);
    const draft = createSnapshot(family);
    mutator(draft);
    const next = assertValidFamily(draft).family;
    history.push(previous);
    if (history.length > maximumHistory) history.shift();
    future = [];
    family = next;
    if (selectedPersonId && !family.persons.some(person => person.id === selectedPersonId)) {
      selectedPersonId = family.view.focusPersonId || family.persons[0]?.id || '';
    }
    emit(type, details, true);
    return getState();
  }

  function replaceFamily(nextFamily, details = {}) {
    return commit('family-replaced', draft => {
      const normalized = normalizeFamily(nextFamily);
      Object.keys(draft).forEach(key => delete draft[key]);
      Object.assign(draft, normalized);
    }, details);
  }

  // Registerübergreifende Transaktionen bilden eine gemeinsame Persistenzgrenze.
  // Ein lokales Undo dürfte sonst nur diese Akte zurückdrehen und die gespiegelte
  // Gegenakte inkonsistent zurücklassen; deshalb beginnt danach bewusst eine neue
  // lokale Historie.
  function synchronizeFamily(nextFamily, details = {}) {
    family = assertValidFamily(nextFamily).family;
    history = [];
    future = [];
    if (!family.persons.some(person => person.id === selectedPersonId)) {
      selectedPersonId = family.view.focusPersonId || family.persons[0]?.id || '';
    }
    emit('family-synchronized', details, true);
    return getState();
  }

  function selectPerson(personId) {
    if (personId && !family.persons.some(person => person.id === personId)) return false;
    selectedPersonId = personId || '';
    emit('selection-changed', { personId: selectedPersonId }, false);
    return true;
  }

  function addPerson(values) {
    const id = values.id || createRecordId('person', family.persons.map(person => person.id));
    commit('person-added', draft => {
      draft.persons.push(createPersonRecord(values, id, draft.document.id));
      if (!draft.view.focusPersonId) draft.view.focusPersonId = id;
    }, { personId: id });
    selectedPersonId = id;
    emit('selection-changed', { personId: id }, false);
    return id;
  }

  function addRelatedPerson(referencePersonId, personValues, relationValues) {
    if (!family.persons.some(person => person.id === referencePersonId)) {
      throw new Error('Die ausgewählte Bezugsperson wurde nicht gefunden.');
    }
    if (!RELATED_PERSON_KINDS.has(relationValues.relationKind)) {
      throw new Error('Diese Art der Verbindung wird nicht unterstützt.');
    }
    const personId = personValues.id || createRecordId('person', family.persons.map(person => person.id));
    const relationKind = relationValues.relationKind;
    commit('related-person-added', draft => {
      draft.persons.push(createPersonRecord(personValues, personId, draft.document.id));

      if (relationKind === 'partnership') {
        const values = {
          id: createRecordId('partnership', draft.partnerships.map(item => item.id)),
          participantIds: [referencePersonId, personId],
          type: relationValues.partnershipType,
          status: relationValues.partnershipStatus,
          certainty: relationValues.certainty,
          visibility: relationValues.visibility
        };
        if (isExclusiveActivePartnership(values)) {
          const result = applyExclusivePartnershipChange(draft, values);
          Object.keys(draft).forEach(key => delete draft[key]);
          Object.assign(draft, result.family);
        } else {
          draft.partnerships.push({
            ...values,
            start: '',
            end: '',
            notes: '',
            extensions: {}
          });
        }
        refreshRelationshipLayout(draft);
        return;
      }

      let childId = personId;
      let parentIds = [referencePersonId, relationValues.secondParentId].filter(Boolean);
      let partnershipId = findPartnershipId(draft.partnerships, parentIds);
      let parentageType = relationValues.parentageType;

      if (relationKind === 'parent') {
        childId = referencePersonId;
        parentIds = [personId, relationValues.secondParentId].filter(Boolean);
        partnershipId = findPartnershipId(draft.partnerships, parentIds);
        const existingParentages = draft.parentages.filter(parentage => parentage.childId === referencePersonId);
        const expandableParentage = existingParentages.find(parentage => parentage.parentIds.length < 2);
        if (existingParentages.length && !expandableParentage) {
          throw new Error('Für diese Person sind bereits zwei Eltern eingetragen. Weitere Alternativen bitte über „Beziehung verknüpfen“ erfassen.');
        }
        if (expandableParentage) {
          const nextParentIds = relationValues.secondParentId
            ? [personId, relationValues.secondParentId]
            : [...expandableParentage.parentIds, personId];
          expandableParentage.parentIds = [...new Set(nextParentIds)].slice(0, 2);
          expandableParentage.partnershipId = findPartnershipId(draft.partnerships, expandableParentage.parentIds);
          return;
        }
      }

      if (relationKind === 'time-jump-child') {
        const timeJump = draft.timeJumps.find(item => item.id === relationValues.timeJumpId);
        if (!timeJump) throw new Error('Der Zeitsprungknoten wurde nicht gefunden.');
        const anchor = resolveTimeJumpAnchor(draft, timeJump);
        if (!anchor.parentIds.includes(referencePersonId)) {
          throw new Error('Der Zeitsprungknoten gehört nicht zur ausgewählten Person.');
        }
        parentIds = anchor.parentIds;
        partnershipId = anchor.parentPartnershipId;
        parentageType = 'claimed';
        timeJump.childIds.push(personId);
      }

      if (relationKind === 'lineage-gap-child') {
        const founderPartnership = draft.partnerships.find(item => item.id === draft.lineage.founderPartnershipId);
        if (!draft.lineage.timeGap.enabled || !founderPartnership) {
          throw new Error('Der Zeitsprung unter dem Stammwappen wurde nicht gefunden.');
        }
        if (!founderPartnership.participantIds.includes(referencePersonId)) {
          throw new Error('Der Haus-Zeitsprung gehört nicht zur ausgewählten Person.');
        }
        parentIds = [...founderPartnership.participantIds];
        partnershipId = founderPartnership.id;
        parentageType = 'claimed';
      }

      const followsTimeBarrier = ['time-jump-child', 'lineage-gap-child'].includes(relationKind);

      draft.parentages.push({
        id: createRecordId('parentage', draft.parentages.map(item => item.id)),
        childId,
        parentIds: [...new Set(parentIds)],
        partnershipId,
        type: parentageType,
        legitimacy: relationValues.legitimacy,
        certainty: relationValues.certainty,
        visibility: relationValues.visibility,
        notes: followsTimeBarrier ? 'Nach einem Zeitsprung wieder belegte Linie.' : '',
        extensions: relationKind === 'time-jump-child'
          ? { timeJumpId: relationValues.timeJumpId, timeJumpCreated: true }
          : relationKind === 'lineage-gap-child'
            ? { lineageTimeGap: true }
            : {}
      });
      if (partnershipId) refreshRelationshipLayout(draft, [partnershipId]);
    }, { personId, referencePersonId, relationKind });
    selectedPersonId = personId;
    emit('selection-changed', { personId }, false);
    return personId;
  }

  function updatePerson(personId, values) {
    return commit('person-updated', draft => {
      const index = draft.persons.findIndex(person => person.id === personId);
      if (index < 0) throw new Error('Die Person wurde nicht gefunden.');
      draft.persons[index] = { ...draft.persons[index], ...values, id: personId };
    }, { personId });
  }

  function legitimizePerson(personId) {
    if (!family.persons.some(person => person.id === personId)) {
      throw new Error('Die Person wurde nicht gefunden.');
    }
    const targetIds = family.parentages
      .filter(parentage => (
        parentage.childId === personId
        && !['legitimate', 'legitimized'].includes(parentage.legitimacy)
      ))
      .map(parentage => parentage.id);
    if (!targetIds.length) {
      throw new Error('Für diese Person ist keine uneheliche Abstammung eingetragen.');
    }
    const targets = new Set(targetIds);
    return commit('person-legitimized', draft => {
      draft.parentages.forEach(parentage => {
        if (targets.has(parentage.id)) parentage.legitimacy = 'legitimized';
      });
    }, { personId, parentageIds: targetIds });
  }

  function setPersonExtension(personId, extensionId, value) {
    const key = String(extensionId || '').trim();
    if (!key) throw new Error('Die Erweiterungs-ID darf nicht leer sein.');
    return commit('person-extension-updated', draft => {
      const person = draft.persons.find(item => item.id === personId);
      if (!person) throw new Error('Die Person wurde nicht gefunden.');
      person.extensions = person.extensions && typeof person.extensions === 'object'
        ? { ...person.extensions }
        : {};
      if (value === null || value === undefined) delete person.extensions[key];
      else person.extensions[key] = cloneValue(value);
    }, { personId, extensionId: key, removed: value === null || value === undefined });
  }

  function setFamilyExtension(extensionId, value) {
    const key = String(extensionId || '').trim();
    if (!key) throw new Error('Die Erweiterungs-ID darf nicht leer sein.');
    return commit('family-extension-updated', draft => {
      draft.extensions = draft.extensions && typeof draft.extensions === 'object'
        ? { ...draft.extensions }
        : {};
      if (value === null || value === undefined) delete draft.extensions[key];
      else draft.extensions[key] = cloneValue(value);
    }, { extensionId: key, removed: value === null || value === undefined });
  }

  function deletePerson(personId) {
    if (personHasMirroredConnections(family, personId)) {
      throw new Error('Zuerst die gespiegelten Ehen, Affären oder Mündelverknüpfungen entfernen. So bleibt die Gegenakte konsistent.');
    }
    return commit('person-deleted', draft => {
      const nextFamily = removePersonRecord(draft, personId);
      Object.keys(draft).forEach(key => delete draft[key]);
      Object.assign(draft, nextFamily);
      refreshRelationshipLayout(draft);
    }, { personId });
  }

  function addPartnership(values) {
    if (isExclusiveActivePartnership(values)) return setExclusivePartnership(values);
    const participantIds = [...new Set(values.participantIds || [])];
    const existing = family.partnerships.find(partnership => (
      partnership.participantIds.length === participantIds.length
      && participantIds.every(personId => partnership.participantIds.includes(personId))
      && partnership.type === values.type
    ));
    if (existing) throw new Error('Diese Partnerschaft ist bereits eingetragen.');
    const id = values.id || createRecordId('partnership', family.partnerships.map(item => item.id));
    commit('partnership-added', draft => {
      draft.partnerships.push({
        id,
        participantIds,
        type: values.type,
        status: values.status,
        start: values.start || '',
        end: values.end || '',
        certainty: values.certainty,
        visibility: values.visibility,
        notes: values.notes || '',
        extensions: {}
      });
      refreshRelationshipLayout(draft);
    }, { partnershipId: id });
    return id;
  }

  function setExclusivePartnership(values) {
    let resultPlan = null;
    commit('exclusive-partnership-set', draft => {
      const result = applyExclusivePartnershipChange(draft, values);
      resultPlan = result.plan;
      Object.keys(draft).forEach(key => delete draft[key]);
      Object.assign(draft, result.family);
      refreshRelationshipLayout(draft);
    }, { participantIds: [...new Set(values.participantIds || [])], type: values.type });
    return resultPlan;
  }

  function updatePartnership(partnershipId, values) {
    return commit('partnership-updated', draft => {
      const partnership = draft.partnerships.find(item => item.id === partnershipId);
      if (!partnership) throw new Error('Die Verbindung wurde nicht gefunden.');
      const allowed = ['type', 'status', 'start', 'end', 'certainty', 'visibility', 'notes'];
      allowed.forEach(key => {
        if (Object.hasOwn(values, key)) partnership[key] = values[key];
      });
      refreshRelationshipLayout(draft);
    }, { partnershipId });
  }

  function deletePartnership(partnershipId, options = {}) {
    return commit('partnership-deleted', draft => {
      const nextFamily = removePartnershipRecord(draft, partnershipId, options);
      Object.keys(draft).forEach(key => delete draft[key]);
      Object.assign(draft, nextFamily);
      refreshRelationshipLayout(draft);
    }, { partnershipId });
  }

  function updateParentage(parentageId, values) {
    return commit('parentage-updated', draft => {
      const parentage = draft.parentages.find(item => item.id === parentageId);
      if (!parentage) throw new Error('Die Abstammung wurde nicht gefunden.');
      const allowed = ['type', 'legitimacy', 'certainty', 'visibility', 'notes'];
      allowed.forEach(key => {
        if (Object.hasOwn(values, key)) parentage[key] = values[key];
      });
      refreshRelationshipLayout(draft);
    }, { parentageId });
  }

  function deleteParentage(parentageId, options = {}) {
    return commit('parentage-deleted', draft => {
      const nextFamily = removeParentageRecord(draft, parentageId, options);
      Object.keys(draft).forEach(key => delete draft[key]);
      Object.assign(draft, nextFamily);
      refreshRelationshipLayout(draft);
    }, { parentageId });
  }

  function ensureHouse(values) {
    const houseId = String(values?.id || '').trim();
    if (!houseId || family.houses.some(house => house.id === houseId)) return false;
    commit('house-added', draft => {
      draft.houses.push({
        id: houseId,
        name: String(values.name || houseId).trim(),
        motto: String(values.motto || '').trim(),
        emblem: String(values.emblem || '').trim(),
        status: 'active'
      });
    }, { houseId });
    return true;
  }

  function addParentage(values) {
    const parentIds = [...new Set(values.parentIds || [])];
    if (hasMatchingParentage(family, { ...values, parentIds })) {
      throw new Error('Diese Abstammung ist bereits eingetragen.');
    }
    const id = values.id || createRecordId('parentage', family.parentages.map(item => item.id));
    commit('parentage-added', draft => {
      draft.parentages.push({
        id,
        childId: values.childId,
        parentIds,
        partnershipId: values.partnershipId || '',
        type: values.type,
        legitimacy: values.legitimacy,
        certainty: values.certainty,
        visibility: values.visibility,
        notes: values.notes || '',
        extensions: {}
      });
      if (values.partnershipId) refreshRelationshipLayout(draft, [values.partnershipId]);
    }, { parentageId: id });
    return id;
  }

  function addWard(values) {
    const childId = values.childId;
    const parentIds = [...new Set(values.parentIds || [])]
      .filter(personId => personId && personId !== childId);
    if (!family.persons.some(person => person.id === childId)) {
      throw new Error('Das Mündel wurde nicht gefunden.');
    }
    if (!parentIds.length || parentIds.some(personId => !family.persons.some(person => person.id === personId))) {
      throw new Error('Mindestens eine aufnehmende Person wurde nicht gefunden.');
    }
    const parentageValues = { ...values, childId, parentIds, type: 'foster' };
    if (hasMatchingParentage(family, parentageValues)) {
      throw new Error('Diese Mündelaufnahme ist bereits eingetragen.');
    }
    const id = values.id || createRecordId('parentage', family.parentages.map(item => item.id));
    commit('ward-added', draft => {
      draft.parentages.push({
        id,
        childId,
        parentIds,
        partnershipId: values.partnershipId || findPartnershipId(draft.partnerships, parentIds),
        type: 'foster',
        legitimacy: values.legitimacy || 'unknown',
        certainty: values.certainty || 'confirmed',
        visibility: values.visibility || 'public',
        notes: values.notes || '',
        extensions: cloneValue(values.extensions || {})
      });
      const ward = draft.persons.find(person => person.id === childId);
      ward.familyRole = 'ward';
      refreshRelationshipLayout(draft);
    }, { parentageId: id, childId, parentIds });
    selectedPersonId = childId;
    emit('selection-changed', { personId: childId }, false);
    return id;
  }

  function setOrientation(orientation) {
    const nextOrientation = orientation === 'horizontal' ? 'horizontal' : 'vertical';
    return commit('view-updated', draft => {
      draft.view.orientation = nextOrientation;
    }, { orientation: nextOrientation });
  }

  function updateDocument(values) {
    return commit('document-updated', draft => {
      draft.document = { ...draft.document, ...values };
    });
  }

  function setRelationshipColors(colors) {
    return commit('presentation-updated', draft => {
      draft.presentation.relationshipColors = {
        ...draft.presentation.relationshipColors,
        ...colors
      };
    });
  }

  function setLineage(values) {
    return commit('lineage-updated', draft => {
      const { emblem, ...lineageValues } = values;
      draft.lineage = {
        ...draft.lineage,
        ...lineageValues,
        timeGap: {
          ...draft.lineage.timeGap,
          ...(lineageValues.timeGap || {})
        }
      };
      if (Object.hasOwn(values, 'emblem')) {
        const house = draft.houses.find(item => item.id === draft.lineage.houseId);
        if (house) house.emblem = emblem || '';
        else draft.document.emblem = emblem || '';
      }
    });
  }

  function setLineageTimeGap(values) {
    return commit('lineage-time-gap-updated', draft => {
      draft.lineage.timeGap = {
        ...draft.lineage.timeGap,
        enabled: values.enabled === true,
        years: Number(values.years || 0),
        fromYear: values.fromYear || '',
        toYear: values.toYear || '',
        label: values.label || 'Nicht einzeln überlieferte Generationen'
      };
    });
  }

  function setLineageOrigin(values) {
    return commit('lineage-origin-updated', draft => {
      draft.lineage.originHouse = {
        ...draft.lineage.originHouse,
        ...values,
        childIds: [...new Set(values.childIds || [])]
      };
    });
  }

  function addCadetBranch(values) {
    assertNoDuplicateHouseBranch(family, values);
    const id = values.id || createRecordId('cadet-branch', family.cadetBranches.map(item => item.id));
    commit('cadet-branch-added', draft => {
      draft.cadetBranches.push({
        id,
        name: values.name,
        subtitle: values.subtitle || '',
        linkType: values.linkType,
        parentPartnershipId: values.parentPartnershipId || '',
        parentPersonId: values.parentPersonId || '',
        childIds: [...new Set(values.childIds || [])],
        houseId: values.houseId || '',
        emblem: values.emblem || '',
        emblemScale: Number(values.emblemScale || 0.86),
        crestFrame: values.crestFrame || DEFAULT_CREST_FRAME,
        frameScale: Number(values.frameScale || 1),
        founded: values.founded || '',
        targetFamilyId: values.targetFamilyId || '',
        notes: values.notes || '',
        extensions: {}
      });
    }, { branchId: id });
    return id;
  }

  function updateCadetBranch(branchId, values) {
    assertNoDuplicateHouseBranch(family, values, branchId);
    return commit('cadet-branch-updated', draft => {
      const branch = draft.cadetBranches.find(item => item.id === branchId);
      if (!branch) throw new Error('Die Hausverknüpfung wurde nicht gefunden.');
      Object.assign(branch, {
        name: values.name,
        subtitle: values.subtitle || '',
        linkType: values.linkType,
        parentPartnershipId: values.parentPartnershipId || '',
        parentPersonId: values.parentPersonId || '',
        childIds: values.childIds === undefined
          ? [...(branch.childIds || [])]
          : [...new Set(values.childIds || [])],
        houseId: values.houseId || '',
        emblem: values.emblem || '',
        emblemScale: Number(values.emblemScale || 0.86),
        crestFrame: values.crestFrame || DEFAULT_CREST_FRAME,
        frameScale: Number(values.frameScale || 1),
        founded: values.founded || '',
        targetFamilyId: values.targetFamilyId || '',
        notes: values.notes || ''
      });
    }, { branchId });
  }

  function deleteCadetBranch(branchId) {
    return commit('cadet-branch-deleted', draft => {
      draft.cadetBranches = draft.cadetBranches.filter(branch => branch.id !== branchId);
      appendRegistryTombstone(draft, 'cadetBranches', branchId);
    }, { branchId });
  }

  function sendWardToHouse({ personId, targetFamilyId, targetFamilyTitle, targetHouse, crestFrame = 'silver' }) {
    const normalizedTargetFamilyId = String(targetFamilyId || '').trim();
    const targetHouseId = String(targetHouse?.id || '').trim();
    if (!normalizedTargetFamilyId || !targetHouseId) throw new Error('Das Zielhaus des Mündels ist unvollständig.');
    const existingBranch = family.cadetBranches.find(branch => (
      branch.linkType === 'ward-away' && branch.parentPersonId === personId
    ));
    const branchId = existingBranch?.id
      || createRecordId('ward-away', family.cadetBranches.map(item => item.id));

    commit('ward-sent-to-house', draft => {
      const person = draft.persons.find(item => item.id === personId);
      if (!person) throw new Error('Die fortzugebende Person wurde nicht gefunden.');
      const note = `Als Mündel an ${targetFamilyTitle} gegeben.`;
      person.familyRole = 'ward-away';
      person.tags = [...new Set([...(person.tags || []), 'Fortgegebenes Mündel'])];
      person.notes = person.notes && !person.notes.includes(note)
        ? `${person.notes} ${note}`
        : (person.notes || note);

      if (!draft.houses.some(house => house.id === targetHouseId)) {
        draft.houses.push({
          id: targetHouseId,
          name: String(targetHouse.name || targetFamilyTitle || targetHouseId).trim(),
          motto: String(targetHouse.motto || '').trim(),
          emblem: String(targetHouse.emblem || '').trim(),
          status: targetHouse.status || 'active'
        });
      }

      const branchValues = {
        id: branchId,
        name: String(targetFamilyTitle || targetHouse.name || targetHouseId).trim(),
        subtitle: 'Als Mündel vermittelt',
        linkType: 'ward-away',
        parentPartnershipId: '',
        parentPersonId: personId,
        houseId: targetHouseId,
        emblem: String(targetHouse.emblem || '').trim(),
        emblemScale: 0.86,
        crestFrame,
        frameScale: 1,
        founded: '',
        targetFamilyId: normalizedTargetFamilyId,
        notes: note,
        extensions: existingBranch?.extensions || {}
      };
      const branch = draft.cadetBranches.find(item => item.id === branchId);
      if (branch) Object.assign(branch, branchValues);
      else draft.cadetBranches.push(branchValues);
    }, { personId, branchId, targetFamilyId: normalizedTargetFamilyId });
    return branchId;
  }

  function addTimeJump(values) {
    const id = values.id || createRecordId('time-jump', family.timeJumps.map(item => item.id));
    commit('time-jump-added', draft => {
      const anchor = resolveTimeJumpAnchor(draft, values);
      draft.timeJumps.push({
        id,
        parentPartnershipId: anchor.parentPartnershipId,
        sharedParentPartnershipIds: [...new Set(values.sharedParentPartnershipIds || [])],
        parentPersonId: anchor.parentPersonId,
        childIds: [...new Set(values.childIds || [])],
        years: Number(values.years || 0),
        fromYear: values.fromYear || '',
        toYear: values.toYear || '',
        label: values.label,
        notes: values.notes || '',
        extensions: {}
      });
      synchronizeTimeJumpParentages(draft, id, [...new Set(values.childIds || [])], anchor);
    }, { timeJumpId: id });
    return id;
  }

  function updateTimeJump(timeJumpId, values) {
    return commit('time-jump-updated', draft => {
      const timeJump = draft.timeJumps.find(item => item.id === timeJumpId);
      if (!timeJump) throw new Error('Der Zeitsprungknoten wurde nicht gefunden.');
      const anchor = resolveTimeJumpAnchor(draft, values);
      const childIds = [...new Set(values.childIds || timeJump.childIds)];
      Object.assign(timeJump, {
        parentPartnershipId: anchor.parentPartnershipId,
        parentPersonId: anchor.parentPersonId,
        childIds,
        years: Number(values.years || 0),
        fromYear: values.fromYear || '',
        toYear: values.toYear || '',
        label: values.label,
        notes: values.notes || ''
      });
      synchronizeTimeJumpParentages(draft, timeJumpId, childIds, anchor);
    }, { timeJumpId });
  }

  function deleteTimeJump(timeJumpId) {
    return commit('time-jump-deleted', draft => {
      draft.timeJumps = draft.timeJumps.filter(timeJump => timeJump.id !== timeJumpId);
      draft.parentages = draft.parentages.flatMap(parentage => {
        if (parentage.extensions?.timeJumpId !== timeJumpId) return [parentage];
        const restored = restoreParentageBeforeTimeJump(parentage);
        return restored ? [restored] : [];
      });
      appendRegistryTombstone(draft, 'timeJumps', timeJumpId);
    }, { timeJumpId });
  }

  function undo() {
    if (!history.length) return false;
    future.push(createSnapshot(family));
    family = history.pop();
    if (!family.persons.some(person => person.id === selectedPersonId)) {
      selectedPersonId = family.view.focusPersonId || family.persons[0]?.id || '';
    }
    emit('history-undo', {}, true);
    return true;
  }

  function redo() {
    if (!future.length) return false;
    history.push(createSnapshot(family));
    family = future.pop();
    if (!family.persons.some(person => person.id === selectedPersonId)) {
      selectedPersonId = family.view.focusPersonId || family.persons[0]?.id || '';
    }
    emit('history-redo', {}, true);
    return true;
  }

  return Object.freeze({
    getState,
    subscribe,
    replaceFamily,
    synchronizeFamily,
    selectPerson,
    addPerson,
    addRelatedPerson,
    updatePerson,
    legitimizePerson,
    setPersonExtension,
    setFamilyExtension,
    deletePerson,
    addPartnership,
    setExclusivePartnership,
    updatePartnership,
    deletePartnership,
    addParentage,
    addWard,
    updateParentage,
    deleteParentage,
    ensureHouse,
    setOrientation,
    updateDocument,
    setRelationshipColors,
    setLineage,
    setLineageTimeGap,
    setLineageOrigin,
    addCadetBranch,
    updateCadetBranch,
    deleteCadetBranch,
    sendWardToHouse,
    addTimeJump,
    updateTimeJump,
    deleteTimeJump,
    undo,
    redo
  });
}

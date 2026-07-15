import {
  assertValidFamily,
  cloneValue,
  createRecordId,
  normalizeFamily
} from '../domain/family-schema.js';
import { DEFAULT_CREST_FRAME } from '../config/chart-frames.js';

const RELATED_PERSON_KINDS = new Set(['partnership', 'child', 'parent', 'time-jump-child']);

function createSnapshot(family) {
  return cloneValue(family);
}

function createPersonRecord(values, id) {
  return {
    id,
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
    tags: values.tags || [],
    notes: values.notes,
    extensions: {}
  };
}

function findPartnershipId(partnerships, participantIds) {
  const ids = [...new Set(participantIds)].filter(Boolean);
  return partnerships.find(partnership => (
    ids.length === partnership.participantIds.length
    && ids.every(personId => partnership.participantIds.includes(personId))
  ))?.id || '';
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

  function selectPerson(personId) {
    if (personId && !family.persons.some(person => person.id === personId)) return false;
    selectedPersonId = personId || '';
    emit('selection-changed', { personId: selectedPersonId }, false);
    return true;
  }

  function addPerson(values) {
    const id = values.id || createRecordId('person', family.persons.map(person => person.id));
    commit('person-added', draft => {
      draft.persons.push(createPersonRecord(values, id));
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
      draft.persons.push(createPersonRecord(personValues, personId));

      if (relationKind === 'partnership') {
        draft.partnerships.push({
          id: createRecordId('partnership', draft.partnerships.map(item => item.id)),
          participantIds: [referencePersonId, personId],
          type: relationValues.partnershipType,
          status: relationValues.partnershipStatus,
          start: '',
          end: '',
          certainty: relationValues.certainty,
          visibility: relationValues.visibility,
          notes: '',
          extensions: {}
        });
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
        const partnership = draft.partnerships.find(item => item.id === timeJump.parentPartnershipId);
        if (!partnership || !partnership.participantIds.includes(referencePersonId)) {
          throw new Error('Der Zeitsprungknoten gehört nicht zur ausgewählten Person.');
        }
        parentIds = partnership.participantIds.slice(0, 2);
        partnershipId = partnership.id;
        parentageType = 'claimed';
        timeJump.childIds.push(personId);
      }

      draft.parentages.push({
        id: createRecordId('parentage', draft.parentages.map(item => item.id)),
        childId,
        parentIds: [...new Set(parentIds)],
        partnershipId,
        type: parentageType,
        legitimacy: relationValues.legitimacy,
        certainty: relationValues.certainty,
        visibility: relationValues.visibility,
        notes: relationKind === 'time-jump-child' ? 'Nach einem Zeitsprung wieder belegte Linie.' : '',
        extensions: relationKind === 'time-jump-child' ? { timeJumpId: relationValues.timeJumpId } : {}
      });
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

  function deletePerson(personId) {
    return commit('person-deleted', draft => {
      draft.persons = draft.persons.filter(person => person.id !== personId);
      draft.partnerships = draft.partnerships
        .map(partnership => ({
          ...partnership,
          participantIds: partnership.participantIds.filter(id => id !== personId)
        }))
        .filter(partnership => partnership.participantIds.length >= 2);
      const remainingPartnershipIds = new Set(draft.partnerships.map(partnership => partnership.id));
      draft.parentages = draft.parentages
        .filter(parentage => parentage.childId !== personId)
        .map(parentage => ({
          ...parentage,
          parentIds: parentage.parentIds.filter(id => id !== personId),
          partnershipId: remainingPartnershipIds.has(parentage.partnershipId) ? parentage.partnershipId : ''
        }))
        .filter(parentage => parentage.parentIds.length > 0);
      if (!remainingPartnershipIds.has(draft.lineage.founderPartnershipId)) {
        draft.lineage.founderPartnershipId = '';
      }
      draft.cadetBranches = draft.cadetBranches.filter(branch => (
        remainingPartnershipIds.has(branch.parentPartnershipId)
      ));
      draft.timeJumps = draft.timeJumps
        .filter(timeJump => remainingPartnershipIds.has(timeJump.parentPartnershipId))
        .map(timeJump => ({
          ...timeJump,
          childIds: timeJump.childIds.filter(childId => childId !== personId)
        }));
      const remainingTimeJumpIds = new Set(draft.timeJumps.map(timeJump => timeJump.id));
      draft.parentages = draft.parentages.filter(parentage => (
        !parentage.extensions?.timeJumpId || remainingTimeJumpIds.has(parentage.extensions.timeJumpId)
      ));
      if (draft.view.focusPersonId === personId) draft.view.focusPersonId = draft.persons[0]?.id || '';
    }, { personId });
  }

  function addPartnership(values) {
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
    }, { partnershipId: id });
    return id;
  }

  function addParentage(values) {
    const parentIds = [...new Set(values.parentIds || [])];
    const existing = family.parentages.find(parentage => (
      parentage.childId === values.childId
      && parentage.type === values.type
      && parentIds.length === parentage.parentIds.length
      && parentIds.every(personId => parentage.parentIds.includes(personId))
    ));
    if (existing) throw new Error('Diese Abstammung ist bereits eingetragen.');
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
    }, { parentageId: id });
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

  function addCadetBranch(values) {
    const id = values.id || createRecordId('cadet-branch', family.cadetBranches.map(item => item.id));
    commit('cadet-branch-added', draft => {
      draft.cadetBranches.push({
        id,
        name: values.name,
        subtitle: values.subtitle || '',
        linkType: values.linkType,
        parentPartnershipId: values.parentPartnershipId,
        houseId: values.houseId || '',
        emblem: values.emblem || '',
        crestFrame: values.crestFrame || DEFAULT_CREST_FRAME,
        founded: values.founded || '',
        targetFamilyId: values.targetFamilyId || '',
        notes: values.notes || '',
        extensions: {}
      });
    }, { branchId: id });
    return id;
  }

  function updateCadetBranch(branchId, values) {
    return commit('cadet-branch-updated', draft => {
      const branch = draft.cadetBranches.find(item => item.id === branchId);
      if (!branch) throw new Error('Die Hausverknüpfung wurde nicht gefunden.');
      Object.assign(branch, {
        name: values.name,
        subtitle: values.subtitle || '',
        linkType: values.linkType,
        parentPartnershipId: values.parentPartnershipId,
        houseId: values.houseId || '',
        emblem: values.emblem || '',
        crestFrame: values.crestFrame || DEFAULT_CREST_FRAME,
        founded: values.founded || '',
        targetFamilyId: values.targetFamilyId || '',
        notes: values.notes || ''
      });
    }, { branchId });
  }

  function deleteCadetBranch(branchId) {
    return commit('cadet-branch-deleted', draft => {
      draft.cadetBranches = draft.cadetBranches.filter(branch => branch.id !== branchId);
    }, { branchId });
  }

  function addTimeJump(values) {
    const id = values.id || createRecordId('time-jump', family.timeJumps.map(item => item.id));
    commit('time-jump-added', draft => {
      const partnership = draft.partnerships.find(item => item.id === values.parentPartnershipId);
      if (!partnership) throw new Error('Das Paar vor dem Zeitsprung wurde nicht gefunden.');
      draft.timeJumps.push({
        id,
        parentPartnershipId: values.parentPartnershipId,
        childIds: [...new Set(values.childIds || [])],
        years: Number(values.years || 0),
        fromYear: values.fromYear || '',
        toYear: values.toYear || '',
        label: values.label,
        notes: values.notes || '',
        extensions: {}
      });
      [...new Set(values.childIds || [])].forEach(childId => {
        const alreadyConnected = draft.parentages.some(parentage => (
          parentage.childId === childId && parentage.partnershipId === partnership.id
        ));
        if (alreadyConnected) return;
        draft.parentages.push({
          id: createRecordId('parentage', draft.parentages.map(item => item.id)),
          childId,
          parentIds: partnership.participantIds.slice(0, 2),
          partnershipId: partnership.id,
          type: 'claimed',
          legitimacy: 'unknown',
          certainty: 'probable',
          visibility: 'public',
          notes: 'Nach einem Zeitsprung wieder belegte Linie.',
          extensions: { timeJumpId: id }
        });
      });
    }, { timeJumpId: id });
    return id;
  }

  function updateTimeJump(timeJumpId, values) {
    return commit('time-jump-updated', draft => {
      const timeJump = draft.timeJumps.find(item => item.id === timeJumpId);
      if (!timeJump) throw new Error('Der Zeitsprungknoten wurde nicht gefunden.');
      const partnership = draft.partnerships.find(item => item.id === values.parentPartnershipId);
      if (!partnership) throw new Error('Das Paar vor dem Zeitsprung wurde nicht gefunden.');
      Object.assign(timeJump, {
        parentPartnershipId: values.parentPartnershipId,
        childIds: [...new Set(values.childIds || timeJump.childIds)],
        years: Number(values.years || 0),
        fromYear: values.fromYear || '',
        toYear: values.toYear || '',
        label: values.label,
        notes: values.notes || ''
      });
      draft.parentages
        .filter(parentage => parentage.extensions?.timeJumpId === timeJumpId)
        .forEach(parentage => {
          parentage.parentIds = partnership.participantIds.slice(0, 2);
          parentage.partnershipId = partnership.id;
        });
    }, { timeJumpId });
  }

  function deleteTimeJump(timeJumpId) {
    return commit('time-jump-deleted', draft => {
      draft.timeJumps = draft.timeJumps.filter(timeJump => timeJump.id !== timeJumpId);
      draft.parentages = draft.parentages.filter(parentage => parentage.extensions?.timeJumpId !== timeJumpId);
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
    selectPerson,
    addPerson,
    addRelatedPerson,
    updatePerson,
    deletePerson,
    addPartnership,
    addParentage,
    setOrientation,
    updateDocument,
    setRelationshipColors,
    setLineage,
    addCadetBranch,
    updateCadetBranch,
    deleteCadetBranch,
    addTimeJump,
    updateTimeJump,
    deleteTimeJump,
    undo,
    redo
  });
}

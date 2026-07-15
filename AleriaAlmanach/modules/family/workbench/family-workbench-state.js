// Pure genealogy editing operations used by the direct family workbench.

(function installFamilyWorkbenchState(global) {
  'use strict';

  const PERSON_REFERENCE_COLLECTIONS = Object.freeze([
    'genealogy.fantasy.houseAffiliations',
    'genealogy.fantasy.titleHoldings',
    'genealogy.fantasy.claims',
    'genealogy.fantasy.successionDecisions',
    'genealogy.fantasy.bloodlineLinks'
  ]);

  function getModel() {
    return global.AleriaFamily?.editor?.model || null;
  }

  function create(family) {
    const model = getModel();
    return model?.normalize(model.clone(family, {})) || family;
  }

  function getRecords(family, path) {
    const records = getModel()?.getPath(family, path, []);
    return Array.isArray(records) ? records : [];
  }

  function findPerson(family, personId) {
    return getRecords(family, 'genealogy.persons').find(person => person?.id === personId) || null;
  }

  function createUniqueRecord(family, path) {
    const model = getModel();
    const records = getRecords(family, path);
    return model.createRecord(path, records.length, records.map(record => String(record?.id || '')).filter(Boolean));
  }

  function applyValues(target, values = {}) {
    const model = getModel();
    Object.entries(values).forEach(([path, value]) => model.setPath(target, path, value));
    return target;
  }

  function updatePath(family, path, value) {
    const next = create(family);
    getModel().setPath(next, path, value);
    return next;
  }

  function updatePerson(family, personId, path, value) {
    const next = create(family);
    const person = findPerson(next, personId);
    if (!person || path === 'id') return next;
    getModel().setPath(person, path, value);
    return next;
  }

  function addPerson(family, values = {}) {
    const next = create(family);
    const persons = getRecords(next, 'genealogy.persons');
    const person = applyValues(createUniqueRecord(next, 'genealogy.persons'), values);
    persons.push(person);
    if (!next.view.initialFocusPersonId) next.view.initialFocusPersonId = person.id;
    return Object.freeze({ family: next, personId: person.id });
  }

  function addRelative(family, config = {}) {
    let next = create(family);
    const anchorId = String(config.anchorId || '');
    if (!findPerson(next, anchorId)) return Object.freeze({ family: next, personId: '', relationId: '' });

    let personId = String(config.personId || '');
    if (!personId) {
      const created = addPerson(next, config.personValues || {});
      next = created.family;
      personId = created.personId;
    }
    if (!personId || personId === anchorId || !findPerson(next, personId)) {
      return Object.freeze({ family: next, personId: '', relationId: '' });
    }

    const relationType = config.relationType || 'partner';
    let path = 'genealogy.partnerships';
    if (relationType === 'child' || relationType === 'parent') path = 'genealogy.parentages';
    if (relationType === 'association') path = 'genealogy.associations';
    const relation = createUniqueRecord(next, path);
    applyValues(relation, config.relationValues || {});

    if (path === 'genealogy.partnerships') {
      relation.participantIds = [anchorId, personId];
    } else if (path === 'genealogy.parentages') {
      relation.childId = relationType === 'child' ? personId : anchorId;
      relation.parentIds = [relationType === 'child' ? anchorId : personId];
      const coParentId = String(config.coParentId || '');
      if (coParentId && coParentId !== relation.childId && !relation.parentIds.includes(coParentId) && findPerson(next, coParentId)) {
        relation.parentIds.push(coParentId);
      }
      relation.partnershipId = String(config.partnershipId || '') || null;
    } else {
      relation.participants = [
        { personId: anchorId, role: String(config.anchorRole || 'related') },
        { personId, role: String(config.relativeRole || 'related') }
      ];
    }
    getRecords(next, path).push(relation);
    return Object.freeze({ family: next, personId, relationId: relation.id, collectionPath: path });
  }

  function updateRelation(family, collectionPath, relationId, values = {}) {
    const next = create(family);
    const relation = getRecords(next, collectionPath).find(record => record?.id === relationId);
    if (!relation) return next;
    applyValues(relation, values);
    if (collectionPath === 'genealogy.partnerships') {
      relation.participantIds = [...new Set((relation.participantIds || []).filter(Boolean))];
    } else if (collectionPath === 'genealogy.parentages') {
      relation.parentIds = [...new Set((relation.parentIds || []).filter(id => id && id !== relation.childId))];
    } else if (collectionPath === 'genealogy.associations') {
      const seen = new Set();
      relation.participants = (relation.participants || []).filter(participant => {
        const id = participant?.personId;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    }
    return next;
  }

  function removeRelation(family, collectionPath, relationId) {
    const next = create(family);
    const records = getRecords(next, collectionPath);
    const index = records.findIndex(record => record?.id === relationId);
    if (index >= 0) records.splice(index, 1);
    if (collectionPath === 'genealogy.partnerships') {
      getRecords(next, 'genealogy.parentages').forEach(parentage => {
        if (parentage.partnershipId === relationId) parentage.partnershipId = null;
      });
    }
    return next;
  }

  function removePerson(family, personId) {
    const next = create(family);
    const persons = getRecords(next, 'genealogy.persons');
    const index = persons.findIndex(person => person?.id === personId);
    if (index < 0) return next;
    persons.splice(index, 1);

    next.genealogy.partnerships = getRecords(next, 'genealogy.partnerships')
      .map(partnership => ({
        ...partnership,
        participantIds: (partnership.participantIds || []).filter(id => id !== personId)
      }))
      .filter(partnership => partnership.participantIds.length >= 2);
    const partnershipIds = new Set(next.genealogy.partnerships.map(partnership => partnership.id));
    next.genealogy.parentages = getRecords(next, 'genealogy.parentages')
      .filter(parentage => parentage.childId !== personId)
      .map(parentage => ({
        ...parentage,
        parentIds: (parentage.parentIds || []).filter(id => id !== personId),
        partnershipId: partnershipIds.has(parentage.partnershipId) ? parentage.partnershipId : null
      }))
      .filter(parentage => parentage.parentIds.length > 0);
    next.genealogy.associations = getRecords(next, 'genealogy.associations')
      .map(association => ({
        ...association,
        participants: (association.participants || []).filter(participant => participant?.personId !== personId)
      }))
      .filter(association => association.participants.length >= 2);
    PERSON_REFERENCE_COLLECTIONS.forEach(path => {
      getModel().setPath(next, path, getRecords(next, path).filter(record => record?.personId !== personId));
    });
    if (next.view.initialFocusPersonId === personId) next.view.initialFocusPersonId = persons[0]?.id || '';
    return next;
  }

  function addCollectionRecord(family, collectionPath, values = {}) {
    const next = create(family);
    const definition = getModel().getCollection(collectionPath);
    if (!definition) return Object.freeze({ family: next, recordId: '' });
    const record = applyValues(createUniqueRecord(next, collectionPath), values);
    getRecords(next, collectionPath).push(record);
    return Object.freeze({ family: next, recordId: record.id || '' });
  }

  function updateCollectionRecord(family, collectionPath, recordId, path, value) {
    const next = create(family);
    const records = getRecords(next, collectionPath);
    const index = String(recordId || '').startsWith('@') ? Number(String(recordId).slice(1)) : -1;
    const record = Number.isInteger(index) && index >= 0 ? records[index] : records.find(item => item?.id === recordId);
    if (!record || path === 'id') return next;
    getModel().setPath(record, path, value);
    return next;
  }

  function removeCollectionRecord(family, collectionPath, recordId) {
    if (String(recordId || '').startsWith('@')) {
      const next = create(family);
      const records = getRecords(next, collectionPath);
      const index = Number(String(recordId).slice(1));
      if (Number.isInteger(index) && index >= 0 && index < records.length) records.splice(index, 1);
      return next;
    }
    const next = removeRelation(family, collectionPath, recordId);
    if (collectionPath === 'genealogy.sources') {
      ['genealogy.partnerships', 'genealogy.parentages', 'genealogy.associations'].forEach(path => {
        getRecords(next, path).forEach(relation => {
          if (relation.assertion) relation.assertion.sourceIds = (relation.assertion.sourceIds || []).filter(id => id !== recordId);
        });
      });
    } else if (collectionPath === 'genealogy.fantasy.houses') {
      getRecords(next, 'genealogy.fantasy.lineages').forEach(record => { if (record.houseId === recordId) record.houseId = null; });
      getRecords(next, 'genealogy.fantasy.houseAffiliations').forEach(record => { if (record.houseId === recordId) record.houseId = null; });
      getRecords(next, 'genealogy.fantasy.titles').forEach(record => { if (record.houseId === recordId) record.houseId = null; });
      getRecords(next, 'genealogy.fantasy.successionRules').forEach(record => { if (record.houseId === recordId) record.houseId = null; });
    } else if (collectionPath === 'genealogy.fantasy.lineages') {
      getRecords(next, 'genealogy.fantasy.lineages').forEach(record => { if (record.parentLineageId === recordId) record.parentLineageId = null; });
      getRecords(next, 'genealogy.fantasy.houseAffiliations').forEach(record => { if (record.lineageId === recordId) record.lineageId = null; });
    } else if (collectionPath === 'genealogy.fantasy.titles') {
      next.genealogy.fantasy.titleHoldings = getRecords(next, 'genealogy.fantasy.titleHoldings').filter(record => record.titleId !== recordId);
      next.genealogy.fantasy.claims = getRecords(next, 'genealogy.fantasy.claims').filter(record => record.titleId !== recordId);
      getRecords(next, 'genealogy.fantasy.successionRules').forEach(record => { if (record.titleId === recordId) record.titleId = null; });
      getRecords(next, 'genealogy.fantasy.successionDecisions').forEach(record => { if (record.titleId === recordId) record.titleId = null; });
    } else if (collectionPath === 'genealogy.fantasy.successionRules') {
      getRecords(next, 'genealogy.fantasy.successionDecisions').forEach(record => { if (record.ruleId === recordId) record.ruleId = null; });
    } else if (collectionPath === 'genealogy.fantasy.bloodlines') {
      next.genealogy.fantasy.bloodlineLinks = getRecords(next, 'genealogy.fantasy.bloodlineLinks').filter(record => record.bloodlineId !== recordId);
    }
    return next;
  }

  function personName(family, personId) {
    const person = findPerson(family, personId);
    return person?.identity?.displayName || person?.id || 'Unbekannte Person';
  }

  function assertionLabel(assertion = {}) {
    const certainty = assertion.certainty && assertion.certainty !== 'confirmed' ? ` · ${assertion.certainty}` : '';
    const visibility = assertion.visibility && assertion.visibility !== 'public' ? ` · ${assertion.visibility}` : '';
    return `${certainty}${visibility}`;
  }

  function getConnections(family, personId) {
    const connections = [];
    getRecords(family, 'genealogy.partnerships').forEach(relation => {
      if (!(relation.participantIds || []).includes(personId)) return;
      const others = relation.participantIds.filter(id => id !== personId);
      connections.push({
        collectionPath: 'genealogy.partnerships', relationId: relation.id, type: 'partner',
        title: others.map(id => personName(family, id)).join(', ') || 'Partnerschaft',
        subtitle: `${relation.kind || 'Verbindung'}${relation.status === 'ended' ? ' · beendet' : ''}${assertionLabel(relation.assertion)}`,
        relatedPersonIds: others
      });
    });
    getRecords(family, 'genealogy.parentages').forEach(relation => {
      if (relation.childId === personId) {
        connections.push({
          collectionPath: 'genealogy.parentages', relationId: relation.id, type: 'parent',
          title: relation.parentIds.map(id => personName(family, id)).join(' & ') || 'Unbekannte Eltern',
          subtitle: `${relation.kind || 'Abstammung'} · ${relation.legitimacy?.status || 'unknown'}${assertionLabel(relation.assertion)}`,
          relatedPersonIds: [...(relation.parentIds || [])]
        });
      } else if ((relation.parentIds || []).includes(personId)) {
        connections.push({
          collectionPath: 'genealogy.parentages', relationId: relation.id, type: 'child',
          title: personName(family, relation.childId),
          subtitle: `${relation.kind || 'Abstammung'} · ${relation.legitimacy?.status || 'unknown'}${assertionLabel(relation.assertion)}`,
          relatedPersonIds: [relation.childId]
        });
      }
    });
    getRecords(family, 'genealogy.associations').forEach(relation => {
      if (!(relation.participants || []).some(participant => participant?.personId === personId)) return;
      const others = relation.participants.filter(participant => participant?.personId !== personId);
      connections.push({
        collectionPath: 'genealogy.associations', relationId: relation.id, type: 'association',
        title: relation.label || others.map(item => personName(family, item.personId)).join(', ') || 'Weitere Bindung',
        subtitle: `${relation.kind || 'Bindung'}${assertionLabel(relation.assertion)}`,
        relatedPersonIds: others.map(item => item.personId)
      });
    });
    return connections;
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  const currentWorkbench = isRecord(currentApi.workbench) ? currentApi.workbench : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    workbench: Object.freeze({
      ...currentWorkbench,
      state: Object.freeze({
        create,
        getRecords,
        findPerson,
        updatePath,
        updatePerson,
        addPerson,
        addRelative,
        updateRelation,
        removeRelation,
        removePerson,
        addCollectionRecord,
        updateCollectionRecord,
        removeCollectionRecord,
        getConnections,
        personName
      })
    })
  });
})(globalThis);

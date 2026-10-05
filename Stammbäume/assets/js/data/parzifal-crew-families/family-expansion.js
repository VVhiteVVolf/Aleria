import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';

export const PARZIFAL_FAMILY_SOURCE = 'Nutzervorgaben vom 06.10.2026: vorhandene Angehörige erhalten; ergänzte Eltern, Vettern und weitere Generationen ausdrücklich neu ausgearbeitet. Altersbezug: 1740.';

// Each row is a named, authored person: given name | sex | birth | death.
// Couples supply a spouse and explicit children, never infer kinship from surnames.
export function familyPersonId(givenName, surname) {
  return `${givenName.toLowerCase()}-${surname.toLowerCase()}`;
}

function rowPerson(row, surname, spouseOf = '') {
  const [givenName, sexCode, birth = '', death = ''] = row.split('|');
  const id = spouseOf ? `${givenName.toLowerCase()}-${spouseOf}-spouse` : familyPersonId(givenName, surname);
  return createFamilyPerson({
    id, name: spouseOf ? givenName : `${givenName} ${surname}`,
    sex: sexCode === 'f' ? 'female' : 'male', birth, death,
    houseId: spouseOf ? '' : `house-${surname.toLowerCase()}`,
    worldPersonId: spouseOf ? `person--haus-${surname.toLowerCase()}--${id}` : '',
    familyRole: spouseOf ? 'married' : 'core',
    portraitPlaceholder: birth && !death && 1740 - Number(birth) < 16 ? 'child' : 'auto',
    notes: 'Neu ausgearbeitete Familiengeneration nach Nutzerauftrag vom 06.10.2026.',
    extensions: { sourceNote: PARZIFAL_FAMILY_SOURCE, authoredFamilyExpansion: true }
  });
}

function mergePerson(existing, authored, patch, revision) {
  const value = { ...authored, ...existing, birth: authored.birth, death: authored.death, ...patch };
  const fields = [...new Set([...(existing?.extensions?.registryManagedFields || []),
    'birth', 'death', ...Object.keys(patch).filter(key => key !== 'extensions')])];
  return { ...value, extensions: {
    ...authored.extensions, ...existing?.extensions, ...patch?.extensions,
    sourceNote: PARZIFAL_FAMILY_SOURCE,
    registryManagedExtensionFields: [...new Set([...(existing?.extensions?.registryManagedExtensionFields || []), 'sourceNote'])],
    registryManagedSourceRevision: revision,
    registryManagedFields: fields,
    registryManagedFieldRevisions: Object.fromEntries(fields.map(field => [field, revision]))
  } };
}

function authoredCouple(definition, surname, persons) {
  const [givenName, spouseRow, childNames] = definition;
  const firstId = familyPersonId(givenName, surname);
  const spouse = rowPerson(spouseRow, surname, firstId);
  persons.set(spouse.id, spouse);
  const first = persons.get(firstId);
  if (!first) throw new Error(`Fehlender Elternteil: ${firstId}`);
  const end = [first.death, spouse.death].filter(Boolean).sort()[0] || '';
  const partnership = createMarriage(`marriage-${firstId}`, firstId, spouse.id, {
    status: end ? 'widowed' : 'active', end,
    notes: PARZIFAL_FAMILY_SOURCE,
    extensions: { sourceNote: PARZIFAL_FAMILY_SOURCE }
  });
  const childIds = childNames.map(name => familyPersonId(name, surname));
  childIds.forEach(id => { if (!persons.has(id)) throw new Error(`Fehlendes Kind: ${id}`); });
  return { partnership, parentages: createParentages(childIds, [firstId, spouse.id], partnership.id, {
    notes: `${PARZIFAL_FAMILY_SOURCE} Der Familienname wird auch in den mütterlich fortgeführten Zweigen beibehalten.`
  }) };
}

export function expandParzifalCrewFamily(base, definition, crewPeople = []) {
  const revision = definition.revision || 6;
  const retired = new Set(definition.retiredPersonIds || []);
  const persons = new Map(base.persons.filter(person => !retired.has(person.id)).map(person => [person.id, person]));
  crewPeople.forEach(person => { if (!persons.has(person.id)) persons.set(person.id, person); });
  for (const row of definition.people) {
    const authored = rowPerson(row, definition.surname);
    const patch = definition.personPatches?.[authored.id] || {};
    persons.set(authored.id, mergePerson(persons.get(authored.id), authored, patch, revision));
  }
  // Stable legacy identifiers are retained when an existing person is renamed.
  for (const [id, patch] of Object.entries(definition.personPatches || {})) {
    if (persons.has(id) && !definition.people.some(row => familyPersonId(row.split('|')[0], definition.surname) === id)) {
      persons.set(id, mergePerson(persons.get(id), persons.get(id), patch, revision));
    }
  }
  const partnerships = new Map(base.partnerships.map(edge => [edge.id, edge]));
  const parentages = new Map(base.parentages.map(edge => [edge.childId, edge]));
  for (const couple of definition.couples) {
    const built = authoredCouple(couple, definition.surname, persons);
    partnerships.set(built.partnership.id, built.partnership);
    for (const edge of built.parentages) {
      const old = parentages.get(edge.childId);
      parentages.set(edge.childId, { ...edge, id: old?.id || edge.id, extensions: {
        ...old?.extensions, registryManagedFields: ['parentIds', 'partnershipId', 'legitimacy', 'notes'],
        registryManagedSourceRevision: revision
      } });
    }
  }
  const founderId = familyPersonId(definition.people[0].split('|')[0], definition.surname);
  return Object.freeze({
    ...base,
    document: { ...base.document, description: `${definition.description || base.document.description} Familiengerüst seit ${definition.people[0].split('|')[2]} mit Haupt- und Vetternzweigen.` },
    persons: [...persons.values()], partnerships: [...partnerships.values()], parentages: [...parentages.values()],
    lineage: { ...base.lineage, founderPartnershipId: `marriage-${founderId}` },
    view: { ...base.view, focusPersonId: '', ancestorDepth: 8, descendantDepth: 8, limitGenerations: false },
    extensions: { ...base.extensions, blankFamily: false, sourceRevision: revision,
      sourceNote: PARZIFAL_FAMILY_SOURCE,
      registryManagedEntitySourceRevision: revision,
      registryManagedDocumentFields: [...new Set([...(base.extensions.registryManagedDocumentFields || []), 'description'])],
      registryManagedLineageFields: ['founderPartnershipId'],
      registryManagedViewFields: ['focusPersonId', 'limitGenerations', 'showSiblings'],
      registryManagedExtensionFields: ['sourceNote', 'pendingFamilySituation'],
      registryTombstones: { ...base.extensions.registryTombstones,
        ...(retired.size ? { persons: [...retired] } : {}) },
      pendingFamilySituation: { openQuestions: ['Spätere Lebensereignisse und zusätzliche Angehörige bleiben offen.'] }
    }
  });
}

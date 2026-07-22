const MIRRORED_PARTNERSHIP_FIELDS = Object.freeze([
  'type',
  'status',
  'start',
  'end',
  'certainty',
  'visibility',
  'notes'
]);

function collectLinks(family) {
  const links = new Map();
  const personsById = new Map((family?.persons || []).map(person => [person.id, person]));
  family?.partnerships?.forEach(partnership => {
    const relationship = partnership.extensions?.crossFamilyRelationship;
    const linkId = String(relationship?.linkId || '');
    const counterpartFamilyId = String(relationship?.counterpartFamilyId || '');
    if (!linkId || !counterpartFamilyId) return;
    if (!links.has(linkId)) links.set(linkId, []);
    links.get(linkId).push(Object.freeze({
      familyId: family.document.id,
      counterpartFamilyId,
      participantWorldPersonIds: partnership.participantIds.map(personId => {
        const person = personsById.get(personId);
        return String(person?.worldPersonId || `local:${family.document.id}:${personId}`);
      }).sort(),
      partnership
    }));
  });
  return links;
}

function entrySignature(entry, { includeCounterpart = true } = {}) {
  return JSON.stringify([
    ...(includeCounterpart ? [entry.counterpartFamilyId] : []),
    entry.participantWorldPersonIds,
    ...MIRRORED_PARTNERSHIP_FIELDS.map(field => String(entry.partnership[field] || ''))
  ]);
}

function entriesSignature(entries) {
  return entries.map(entry => entrySignature(entry)).sort().join('|');
}

function invariantMessage(linkId, detail) {
  return `Die registerübergreifende Beziehung „${linkId}“ ist nicht mehr beidseitig konsistent (${detail}). Es wurde nichts online gespeichert. Gleiche zuerst beide Familien mit Firebase ab oder stelle die Spiegelbeziehung in beiden Akten wieder her.`;
}

export class CrossFamilySyncInvariantError extends Error {
  constructor(linkId, detail) {
    super(invariantMessage(linkId, detail));
    this.name = 'CrossFamilySyncInvariantError';
    this.linkId = linkId;
  }
}

export function assertMirroredCrossFamilyBatch(records) {
  if (!Array.isArray(records) || records.length === 0) return true;
  const snapshots = records.map(record => Object.freeze({
    familyId: record.family.document.id,
    current: collectLinks(record.family),
    base: collectLinks(record.baseFamily)
  }));
  const includedFamilyIds = new Set(snapshots.map(snapshot => snapshot.familyId));
  if (includedFamilyIds.size !== snapshots.length) {
    throw new Error('Eine Familie darf in einem atomaren Online-Paket nur einmal vorkommen.');
  }

  const linkIds = new Set();
  snapshots.forEach(snapshot => {
    snapshot.current.forEach((_, linkId) => linkIds.add(linkId));
    snapshot.base.forEach((_, linkId) => linkIds.add(linkId));
  });

  linkIds.forEach(linkId => {
    const currentEntries = snapshots.flatMap(snapshot => snapshot.current.get(linkId) || []);
    const baseEntries = snapshots.flatMap(snapshot => snapshot.base.get(linkId) || []);
    const touched = snapshots.some(snapshot => (
      entriesSignature(snapshot.current.get(linkId) || [])
        !== entriesSignature(snapshot.base.get(linkId) || [])
    ));
    const endpointIds = new Set(
      [...currentEntries, ...baseEntries]
        .flatMap(entry => [entry.familyId, entry.counterpartFamilyId])
    );
    const allEndpointsIncluded = [...endpointIds].every(id => includedFamilyIds.has(id));

    if (touched && !allEndpointsIncluded) {
      throw new CrossFamilySyncInvariantError(linkId, 'die geänderte Gegenfamilie fehlt im atomaren Paket');
    }
    if (!allEndpointsIncluded) return;
    if (endpointIds.size !== 2) {
      throw new CrossFamilySyncInvariantError(linkId, 'die Link-ID verweist nicht eindeutig auf genau zwei Familien');
    }
    if (currentEntries.length === 0) return;
    if (currentEntries.length !== 2) {
      throw new CrossFamilySyncInvariantError(linkId, 'die Verbindung ist nur in einer der beiden Familien vorhanden');
    }

    const [first, second] = currentEntries;
    const reciprocal = first.familyId !== second.familyId
      && first.counterpartFamilyId === second.familyId
      && second.counterpartFamilyId === first.familyId;
    if (!reciprocal) {
      throw new CrossFamilySyncInvariantError(linkId, 'die Gegenfamilien-Verweise sind nicht reziprok');
    }
    if (
      entrySignature(first, { includeCounterpart: false })
      !== entrySignature(second, { includeCounterpart: false })
    ) {
      throw new CrossFamilySyncInvariantError(linkId, 'Teilnehmer, Status oder Beziehungsart unterscheiden sich zwischen den Akten');
    }
  });
  return true;
}

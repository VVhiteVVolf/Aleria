import { createMarriedAwayBranch } from './family-record-builders.js';

/** End the birth-house projection at a marriage; retain the children in the
 * destination house. Tombstones also remove the old duplicate from saved trees. */
export function withMarriedAwayContinuation(source, { childIds, ...branch }) {
  const family = structuredClone(source);
  const transferred = childIds.map(id => {
    const person = family.persons.find(person => person.id === id);
    const parentage = family.parentages.find(record => record.childId === id);
    if (!person || parentage?.partnershipId !== branch.parentPartnershipId) {
      throw new Error(`Unklare fortgeführte Linie: ${id}`);
    }
    if (family.partnerships.some(record => record.participantIds.includes(id))
      || family.parentages.some(record => record.parentIds.includes(id))) {
      throw new Error(`Die Übertragung muss auch die Nachkommen von ${id} umfassen.`);
    }
    return { personId: id, worldPersonId: person.worldPersonId, targetFamilyId: branch.targetFamilyId };
  });
  const removedParentages = family.parentages.filter(record => childIds.includes(record.childId));
  family.persons = family.persons.filter(person => !childIds.includes(person.id));
  family.parentages = family.parentages.filter(record => !childIds.includes(record.childId));
  family.cadetBranches = family.cadetBranches.filter(record => record.id !== branch.id);
  family.cadetBranches.push(createMarriedAwayBranch(branch));
  const tombstones = family.extensions?.registryTombstones || {};
  family.extensions = {
    ...family.extensions,
    registryTombstones: {
      ...tombstones,
      persons: [...new Set([...(tombstones.persons || []), ...childIds])],
      parentages: [...new Set([...(tombstones.parentages || []), ...removedParentages.map(record => record.id)])]
    },
    registryTransferredPersons: [...(family.extensions?.registryTransferredPersons || []), ...transferred]
  };
  return family;
}

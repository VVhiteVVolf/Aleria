import { PARENTAGE_LABELS, PARTNERSHIP_LABELS } from '../config/family-colors.js';
import { normalizeFamily } from './family-schema.js';

function sortPeople(people) {
  return [...people].sort((first, second) => first.name.localeCompare(second.name, 'de'));
}

export function createFamilyGraph(input) {
  const family = normalizeFamily(input);
  const personById = new Map(family.persons.map(person => [person.id, person]));
  const houseById = new Map(family.houses.map(house => [house.id, house]));
  const partnershipsByPerson = new Map();
  const parentagesByChild = new Map();
  const parentagesByParent = new Map();

  family.partnerships.forEach(partnership => {
    partnership.participantIds.forEach(personId => {
      if (!partnershipsByPerson.has(personId)) partnershipsByPerson.set(personId, []);
      partnershipsByPerson.get(personId).push(partnership);
    });
  });

  family.parentages.forEach(parentage => {
    if (!parentagesByChild.has(parentage.childId)) parentagesByChild.set(parentage.childId, []);
    parentagesByChild.get(parentage.childId).push(parentage);
    parentage.parentIds.forEach(parentId => {
      if (!parentagesByParent.has(parentId)) parentagesByParent.set(parentId, []);
      parentagesByParent.get(parentId).push(parentage);
    });
  });

  function peopleFromIds(ids) {
    return sortPeople([...new Set(ids)].map(id => personById.get(id)).filter(Boolean));
  }

  function getPerson(personId) {
    return personById.get(personId) || null;
  }

  function getHouse(houseId) {
    return houseById.get(houseId) || null;
  }

  function getPartnerships(personId) {
    return [...(partnershipsByPerson.get(personId) || [])];
  }

  function getPartners(personId) {
    const ids = getPartnerships(personId).flatMap(partnership => (
      partnership.participantIds.filter(id => id !== personId)
    ));
    return peopleFromIds(ids);
  }

  function getParentages(personId) {
    return [...(parentagesByChild.get(personId) || [])];
  }

  function getParents(personId, options = {}) {
    const allowedTypes = Array.isArray(options.types) ? new Set(options.types) : null;
    const ids = getParentages(personId)
      .filter(parentage => !allowedTypes || allowedTypes.has(parentage.type))
      .flatMap(parentage => parentage.parentIds);
    return peopleFromIds(ids);
  }

  function getChildren(personId, options = {}) {
    const allowedTypes = Array.isArray(options.types) ? new Set(options.types) : null;
    const ids = (parentagesByParent.get(personId) || [])
      .filter(parentage => !allowedTypes || allowedTypes.has(parentage.type))
      .map(parentage => parentage.childId);
    return peopleFromIds(ids);
  }

  function getSiblings(personId) {
    const ownParentIds = new Set(getParentages(personId).flatMap(parentage => parentage.parentIds));
    const siblingIds = new Set();
    ownParentIds.forEach(parentId => {
      (parentagesByParent.get(parentId) || []).forEach(parentage => {
        if (parentage.childId !== personId) siblingIds.add(parentage.childId);
      });
    });
    return peopleFromIds([...siblingIds]).map(person => {
      const siblingParentIds = new Set(getParentages(person.id).flatMap(parentage => parentage.parentIds));
      const commonParentCount = [...ownParentIds].filter(id => siblingParentIds.has(id)).length;
      return Object.freeze({ person, kind: commonParentCount >= 2 ? 'full' : 'half' });
    });
  }

  function traverse(startId, nextPeople, maximumDepth = Infinity) {
    const result = [];
    const queue = [{ personId: startId, depth: 0 }];
    const visited = new Set([startId]);
    while (queue.length) {
      const current = queue.shift();
      if (current.depth >= maximumDepth) continue;
      nextPeople(current.personId).forEach(person => {
        if (visited.has(person.id)) return;
        visited.add(person.id);
        const entry = Object.freeze({ person, depth: current.depth + 1 });
        result.push(entry);
        queue.push({ personId: person.id, depth: entry.depth });
      });
    }
    return result;
  }

  function getAncestors(personId, maximumDepth = Infinity) {
    return traverse(personId, getParents, maximumDepth);
  }

  function getDescendants(personId, maximumDepth = Infinity) {
    return traverse(personId, getChildren, maximumDepth);
  }

  function getGenerationCount() {
    if (!family.persons.length) return 0;
    const childIds = new Set(family.parentages.map(parentage => parentage.childId));
    const roots = family.persons.filter(person => !childIds.has(person.id));
    const startPeople = roots.length ? roots : family.persons;
    let maximum = 1;
    const queue = startPeople.map(person => ({ personId: person.id, depth: 1 }));
    const bestDepth = new Map();
    while (queue.length) {
      const current = queue.shift();
      if ((bestDepth.get(current.personId) || 0) >= current.depth) continue;
      bestDepth.set(current.personId, current.depth);
      maximum = Math.max(maximum, current.depth);
      getChildren(current.personId).forEach(child => queue.push({ personId: child.id, depth: current.depth + 1 }));
    }
    return maximum;
  }

  function search(query) {
    const needle = String(query || '').trim().toLocaleLowerCase('de');
    if (!needle) return [];
    return family.persons.filter(person => {
      const house = getHouse(person.houseId);
      return [person.name, person.title, house?.name, person.notes, ...person.tags]
        .filter(Boolean)
        .some(value => value.toLocaleLowerCase('de').includes(needle));
    }).slice(0, 20);
  }

  function getRelationshipGroups(personId) {
    const parents = getParents(personId);
    const partners = getPartners(personId);
    const children = getChildren(personId);
    const siblings = getSiblings(personId).map(entry => entry.person);
    return Object.freeze([
      Object.freeze({ id: 'parents', label: 'Eltern', people: parents }),
      Object.freeze({ id: 'partners', label: 'Partner', people: partners }),
      Object.freeze({ id: 'children', label: 'Kinder', people: children }),
      Object.freeze({ id: 'siblings', label: 'Geschwister', people: siblings })
    ]);
  }

  function describeConnection(firstId, secondId) {
    const partnership = getPartnerships(firstId).find(item => item.participantIds.includes(secondId));
    if (partnership) return PARTNERSHIP_LABELS[partnership.type] || 'Verbindung';
    const parentage = getParentages(secondId).find(item => item.parentIds.includes(firstId));
    if (parentage) return `${PARENTAGE_LABELS[parentage.type] || 'Abstammung'} · Elternteil`;
    const reverseParentage = getParentages(firstId).find(item => item.parentIds.includes(secondId));
    if (reverseParentage) return `${PARENTAGE_LABELS[reverseParentage.type] || 'Abstammung'} · Kind`;
    if (getSiblings(firstId).some(entry => entry.person.id === secondId)) return 'Geschwister';
    return '';
  }

  return Object.freeze({
    family,
    getPerson,
    getHouse,
    getPartnerships,
    getPartners,
    getParentages,
    getParents,
    getChildren,
    getSiblings,
    getAncestors,
    getDescendants,
    getGenerationCount,
    getRelationshipGroups,
    describeConnection,
    search
  });
}


const LINEAGE_PRESERVATION_PRIORITY = Object.freeze({
  branch: 0,
  mainline: 50,
  head: 100
});

function pairKey(firstId, secondId) {
  return [firstId, secondId].sort().join('\u001f');
}

function preservationPriority(person) {
  const lineagePriority = LINEAGE_PRESERVATION_PRIORITY[person?.lineageRole] ?? 0;
  const coreFamilyPriority = person?.familyRole === 'core' ? 10 : 0;
  return lineagePriority + coreFamilyPriority;
}

function addPartnerLink(partnerLinksByPerson, personId, partnerId, partnership, order) {
  if (!partnerLinksByPerson.has(personId)) partnerLinksByPerson.set(personId, new Map());
  const links = partnerLinksByPerson.get(personId);
  if (!links.has(partnerId)) links.set(partnerId, { partnerId, partnership, order });
}

function collectAncestors(personId, selectedParentageByChild, cache, active = new Set()) {
  if (cache.has(personId)) return cache.get(personId);
  if (active.has(personId)) return new Set([personId]);

  const ancestors = new Set([personId]);
  const parentage = selectedParentageByChild.get(personId);
  const nextActive = new Set(active).add(personId);
  (parentage?.parentIds || []).forEach(parentId => {
    collectAncestors(parentId, selectedParentageByChild, cache, nextActive)
      .forEach(ancestorId => ancestors.add(ancestorId));
  });
  cache.set(personId, ancestors);
  return ancestors;
}

function shareAncestry(firstId, secondId, ancestorIdsByPerson) {
  const firstAncestors = ancestorIdsByPerson.get(firstId) || new Set([firstId]);
  const secondAncestors = ancestorIdsByPerson.get(secondId) || new Set([secondId]);
  return [...firstAncestors].some(ancestorId => secondAncestors.has(ancestorId));
}

function shareDirectParent(firstId, secondId, selectedParentageByChild) {
  const firstParents = selectedParentageByChild.get(firstId)?.parentIds || [];
  const secondParents = selectedParentageByChild.get(secondId)?.parentIds || [];
  return firstParents.some(parentId => secondParents.includes(parentId));
}

function sharedChildIds(firstId, secondId, selectedParentageByChild) {
  const children = [];
  selectedParentageByChild.forEach((parentage, childId) => {
    if (parentage.parentIds.includes(firstId) && parentage.parentIds.includes(secondId)) {
      children.push(childId);
    }
  });
  return children;
}

function chooseDetachedPerson(firstId, secondId, selectedParentageByChild, personById) {
  const firstHasParentage = selectedParentageByChild.has(firstId);
  const secondHasParentage = selectedParentageByChild.has(secondId);
  if (!firstHasParentage) return secondHasParentage ? secondId : '';
  if (!secondHasParentage) return firstId;

  const firstPriority = preservationPriority(personById.get(firstId));
  const secondPriority = preservationPriority(personById.get(secondId));
  if (firstPriority > secondPriority) return secondId;
  if (secondPriority > firstPriority) return firstId;

  // Bei gleicher fachlicher Priorität bleibt die zuerst geführte Person am
  // Herkunftszweig; das macht die Projektion unabhängig von Namen stabil.
  return secondId;
}

export function createFamilyChartCyclePlan({ partnerships, selectedParentageByChild, personById }) {
  const ancestorCache = new Map();
  personById.forEach((_person, personId) => {
    collectAncestors(personId, selectedParentageByChild, ancestorCache);
  });

  const decisions = new Map();
  const detachedPersonIds = new Set();

  partnerships.forEach(partnership => {
    const participantIds = partnership.participantIds.filter(personId => personById.has(personId));
    for (let firstIndex = 0; firstIndex < participantIds.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < participantIds.length; secondIndex += 1) {
        const firstId = participantIds[firstIndex];
        const secondId = participantIds[secondIndex];
        if (!shareAncestry(firstId, secondId, ancestorCache)) continue;

        const children = sharedChildIds(firstId, secondId, selectedParentageByChild);
        const siblingPair = shareDirectParent(firstId, secondId, selectedParentageByChild);
        if (!children.length) {
          decisions.set(pairKey(firstId, secondId), Object.freeze({
            mode: 'extra-partnership-line',
            reason: 'shared-ancestry',
            siblingPair,
            sharedChildIds: Object.freeze([]),
            detachedPersonId: ''
          }));
          continue;
        }

        const detachedPersonId = chooseDetachedPerson(
          firstId,
          secondId,
          selectedParentageByChild,
          personById
        );
        if (!detachedPersonId) {
          decisions.set(pairKey(firstId, secondId), Object.freeze({
            mode: 'extra-partnership-line',
            reason: 'shared-ancestry',
            siblingPair,
            sharedChildIds: Object.freeze([...children]),
            detachedPersonId: ''
          }));
          continue;
        }

        detachedPersonIds.add(detachedPersonId);
        decisions.set(pairKey(firstId, secondId), Object.freeze({
          mode: 'detach-parentage',
          reason: 'shared-ancestry',
          siblingPair,
          sharedChildIds: Object.freeze([...children]),
          detachedPersonId
        }));
      }
    }
  });

  const partnerLinksByPerson = new Map();
  partnerships.forEach((partnership, partnershipIndex) => {
    const participantIds = partnership.participantIds.filter(personId => personById.has(personId));
    for (let firstIndex = 0; firstIndex < participantIds.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < participantIds.length; secondIndex += 1) {
        const firstId = participantIds[firstIndex];
        const secondId = participantIds[secondIndex];
        addPartnerLink(partnerLinksByPerson, firstId, secondId, partnership, partnershipIndex);
        addPartnerLink(partnerLinksByPerson, secondId, firstId, partnership, partnershipIndex);
      }
    }
  });

  const multiPartnerParentageRoutes = [];
  partnerLinksByPerson.forEach((partnerLinks, personId) => {
    if (detachedPersonIds.has(personId) || partnerLinks.size < 2) return;

    const candidates = [...partnerLinks.values()].sort((first, second) => (
      preservationPriority(personById.get(second.partnerId))
      - preservationPriority(personById.get(first.partnerId))
      || first.order - second.order
    ));
    const ancestryAnchors = [];

    candidates.forEach(candidate => {
      if (detachedPersonIds.has(candidate.partnerId)) return;
      const overlappingAnchor = ancestryAnchors.find(anchor => (
        shareAncestry(anchor.partnerId, candidate.partnerId, ancestorCache)
      ));
      if (!overlappingAnchor) {
        ancestryAnchors.push(candidate);
        return;
      }

      const children = sharedChildIds(personId, candidate.partnerId, selectedParentageByChild);
      const decisionKey = pairKey(personId, candidate.partnerId);
      if (!decisions.has(decisionKey)) {
        decisions.set(decisionKey, Object.freeze({
          mode: 'extra-partnership-line',
          reason: 'related-partners',
          siblingPair: false,
          sharedChildIds: Object.freeze([...children]),
          detachedPersonId: ''
        }));
      }

      if (children.length) {
        multiPartnerParentageRoutes.push(Object.freeze({
          personId,
          preservedPartnerId: overlappingAnchor.partnerId,
          partnerId: candidate.partnerId,
          partnershipId: candidate.partnership.id,
          childIds: Object.freeze([...children])
        }));
      }
    });
  });

  return Object.freeze({
    detachedPersonIds: Object.freeze([...detachedPersonIds]),
    multiPartnerParentageRoutes: Object.freeze([...multiPartnerParentageRoutes]),
    getDecision(firstId, secondId) {
      return decisions.get(pairKey(firstId, secondId)) || null;
    }
  });
}

export function detachFamilyChartParentLinks(chartById, childId, requestedParentIds = null) {
  const child = chartById.get(childId);
  if (!child) return Object.freeze([]);

  const requestedIds = requestedParentIds ? new Set(requestedParentIds) : null;
  const parentIds = child.rels.parents.filter(parentId => !requestedIds || requestedIds.has(parentId));
  parentIds.forEach(parentId => {
    const parent = chartById.get(parentId);
    child.rels.parents = child.rels.parents.filter(id => id !== parentId);
    if (parent) parent.rels.children = parent.rels.children.filter(id => id !== childId);
  });
  return Object.freeze(parentIds);
}

function appearanceKey(personId, partnershipId) {
  return `${personId}\u001f${partnershipId}`;
}

export function familyChartPersonAppearanceId(personId, partnershipId) {
  return `__person-appearance-${personId}--${partnershipId}`;
}

export function familyChartPartnerMirrorId(personId, partnershipId) {
  return `__person-partner-mirror-${personId}--${partnershipId}`;
}

function requestedPartnershipIds(person, extensionKey) {
  const configured = person?.extensions?.[extensionKey];
  return Array.isArray(configured)
    ? [...new Set(configured.filter(value => typeof value === 'string' && value.trim()))]
    : [];
}

function relationshipPairKey(participantIds) {
  return [...participantIds].sort().join('\u001f');
}

function repeatedRelationships(partnerships, personById, originIds, founderPartnershipId) {
  const byPair = new Map();
  for (const partnership of partnerships) {
    const [firstId, secondId] = partnership.participantIds;
    if (partnership.participantIds.length !== 2 || firstId === secondId
      || !personById.has(firstId) || !personById.has(secondId)) continue;
    const pairId = relationshipPairKey(partnership.participantIds);
    const relations = byPair.get(pairId) || [];
    relations.push(partnership);
    byPair.set(pairId, relations);
  }
  const repeatedByPerson = new Map();
  const repeatedPairKeys = new Set();
  for (const [pairId, relations] of byPair) {
    if (relations.length < 2) continue;
    repeatedPairKeys.add(pairId);
    const base = relations.find(relation => relation.id === founderPartnershipId)
      || relations.find(relation => relation.type === 'marriage') || relations[0];
    const [firstId, secondId] = base.participantIds;
    const personId = originIds.has(secondId) && !originIds.has(firstId) ? firstId : secondId;
    const ids = repeatedByPerson.get(personId) || [];
    for (const relation of relations) {
      if (relation === base || relation.participantIds.some(id => (
        requestedPartnershipIds(personById.get(id), 'chartRepeatForPartnershipIds').includes(relation.id)
      ))) continue;
      ids.push(relation.id);
    }
    repeatedByPerson.set(personId, ids);
  }
  return { repeatedByPerson, repeatedPairKeys };
}

export function createFamilyChartPersonAppearancePlan({ partnerships, personById, parentages = [], founderPartnershipId }) {
  const relationships = partnerships || [];
  const partnershipById = new Map(relationships.map(partnership => [partnership.id, partnership]));
  const partnershipsByPerson = new Map();
  for (const partnership of relationships) {
    for (const id of partnership.participantIds) {
      const relations = partnershipsByPerson.get(id) || [];
      relations.push(partnership);
      partnershipsByPerson.set(id, relations);
    }
  }
  const appearanceByPersonAndPartnership = new Map();
  const partnerMirrorByPersonAndPartnership = new Map();
  const appearances = [];
  const partnerMirrors = [];
  const invalidRequests = [];
  const originIds = new Set(parentages.filter(parentage => !parentage.extensions?.timeJumpId).map(parentage => parentage.childId));
  const childBearingIds = new Set(parentages.map(parentage => parentage.partnershipId));
  const { repeatedByPerson, repeatedPairKeys } = repeatedRelationships(relationships, personById, originIds, founderPartnershipId);

  personById.forEach((person, personId) => {
    const repeatedIds = new Set([
      ...requestedPartnershipIds(person, 'chartRepeatForPartnershipIds'),
      ...(repeatedByPerson.get(personId) || [])
    ]);
    // An external partner with several families must not drag those families
    // away from their own parents. Give each additional anchored union its
    // own card, keeping the first union on the original card.
    const anchoredUnions = (partnershipsByPerson.get(personId) || []).filter(partnership => (
      partnership.participantIds.length === 2
      && partnership.participantIds.some(id => id !== personId && originIds.has(id))
      && childBearingIds.has(partnership.id)
    ));
    const managedLayout = person?.extensions?.chartMultiPartnerLayoutReviewed
      || person?.extensions?.chartCenterBetweenPartnerPersonIds?.length
      || person?.extensions?.chartCenterBetweenSpousePersonIds?.length
      || anchoredUnions.some(partnership => partnership.extensions?.chartAlignPartnerOverChildrenPersonId);
    if (!managedLayout && !originIds.has(personId) && anchoredUnions.length > 1) {
      const base = anchoredUnions.find(partnership => !repeatedIds.has(partnership.id));
      anchoredUnions.filter(partnership => partnership !== base).forEach(partnership => {
        repeatedIds.add(partnership.id);
      });
    }
    repeatedIds.forEach(partnershipId => {
      const partnership = partnershipById.get(partnershipId);
      if (!partnership || !partnership.participantIds.includes(personId)) {
        invalidRequests.push(Object.freeze({ personId, partnershipId, role: 'partnership-participant' }));
        return;
      }

      const appearance = Object.freeze({
        id: familyChartPersonAppearanceId(personId, partnershipId),
        personId,
        partnershipId,
        role: 'partnership-participant'
      });
      appearanceByPersonAndPartnership.set(appearanceKey(personId, partnershipId), appearance);
      appearances.push(appearance);
    });

    requestedPartnershipIds(person, 'chartPartnerMirrorForPartnershipIds').forEach(partnershipId => {
      const partnership = partnershipById.get(partnershipId);
      if (!partnership || !partnership.participantIds.includes(personId)) {
        invalidRequests.push(Object.freeze({ personId, partnershipId, role: 'partner-mirror' }));
        return;
      }

      const mirror = Object.freeze({
        id: familyChartPartnerMirrorId(personId, partnershipId),
        personId,
        partnershipId,
        role: 'partner-mirror',
        partnerIds: Object.freeze(partnership.participantIds.filter(participantId => participantId !== personId))
      });
      partnerMirrorByPersonAndPartnership.set(appearanceKey(personId, partnershipId), mirror);
      partnerMirrors.push(mirror);
      appearances.push(mirror);
    });
  });

  return Object.freeze({
    appearances: Object.freeze(appearances),
    partnerMirrors: Object.freeze(partnerMirrors),
    invalidRequests: Object.freeze(invalidRequests),
    hasRepeatedPair(parentIds) {
      return repeatedPairKeys.size > 0 && parentIds.length === 2 && repeatedPairKeys.has(relationshipPairKey(parentIds));
    },
    resolveParticipantId(personId, partnershipId) {
      return appearanceByPersonAndPartnership.get(appearanceKey(personId, partnershipId))?.id || personId;
    },
    resolvePartnerMirrorId(personId, partnershipId) {
      return partnerMirrorByPersonAndPartnership.get(appearanceKey(personId, partnershipId))?.id || personId;
    }
  });
}

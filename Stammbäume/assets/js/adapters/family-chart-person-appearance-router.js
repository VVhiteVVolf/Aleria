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

export function createFamilyChartPersonAppearancePlan({ partnerships, personById, parentages = [] }) {
  const partnershipById = new Map((partnerships || []).map(partnership => [partnership.id, partnership]));
  const appearanceByPersonAndPartnership = new Map();
  const partnerMirrorByPersonAndPartnership = new Map();
  const appearances = [];
  const partnerMirrors = [];
  const invalidRequests = [];
  const originIds = new Set(parentages.filter(parentage => !parentage.extensions?.timeJumpId).map(parentage => parentage.childId));

  personById.forEach((person, personId) => {
    const repeatedIds = requestedPartnershipIds(person, 'chartRepeatForPartnershipIds');
    // An external partner with several families must not drag those families
    // away from their own parents. Give each additional anchored union its
    // own card, keeping the first union on the original card.
    const anchoredUnions = (partnerships || []).filter(partnership => (
      partnership.participantIds.length === 2
      && partnership.participantIds.includes(personId)
      && partnership.participantIds.some(id => id !== personId && originIds.has(id))
      && parentages.some(parentage => parentage.partnershipId === partnership.id)
    ));
    const managedLayout = person?.extensions?.chartMultiPartnerLayoutReviewed
      || person?.extensions?.chartCenterBetweenPartnerPersonIds?.length
      || person?.extensions?.chartCenterBetweenSpousePersonIds?.length
      || anchoredUnions.some(partnership => partnership.extensions?.chartAlignPartnerOverChildrenPersonId);
    if (!managedLayout && !originIds.has(personId) && anchoredUnions.length > 1) {
      const base = anchoredUnions.find(partnership => !repeatedIds.includes(partnership.id));
      anchoredUnions.filter(partnership => partnership !== base).forEach(partnership => {
        if (!repeatedIds.includes(partnership.id)) repeatedIds.push(partnership.id);
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
    resolveParticipantId(personId, partnershipId) {
      return appearanceByPersonAndPartnership.get(appearanceKey(personId, partnershipId))?.id || personId;
    },
    resolvePartnerMirrorId(personId, partnershipId) {
      return partnerMirrorByPersonAndPartnership.get(appearanceKey(personId, partnershipId))?.id || personId;
    }
  });
}

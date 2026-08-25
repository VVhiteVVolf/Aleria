const PARTNERSHIP_PROXIMITY = Object.freeze({
  marriage: 500,
  engagement: 400,
  affair: 200,
  forced: 100
});

function directChildIds(family, partnershipId) {
  return (family?.parentages || [])
    .filter(parentage => parentage.partnershipId === partnershipId)
    .map(parentage => parentage.childId)
    .filter(Boolean);
}

function partnerIdFor(partnership, centeredPersonId) {
  const participantIds = [...new Set(partnership?.participantIds || [])].filter(Boolean);
  if (participantIds.length !== 2 || !participantIds.includes(centeredPersonId)) return '';
  return participantIds.find(personId => personId !== centeredPersonId) || '';
}

function centeredPartnerSlots(count) {
  const beforeCount = Math.ceil(count / 2);
  const afterCount = count - beforeCount;
  return [
    ...Array.from({ length: beforeCount }, (_, index) => index - beforeCount),
    ...Array.from({ length: afterCount }, (_, index) => index + 1)
  ];
}

function relationshipCorePersonId(family, partnership, partnershipsByPersonId, personById) {
  const participantIds = [...new Set(partnership?.participantIds || [])].filter(Boolean);
  if (participantIds.length !== 2) return '';
  const lineageHouseId = family?.lineage?.houseId || '';
  const lineageParticipants = lineageHouseId
    ? participantIds.filter(personId => personById.get(personId)?.houseId === lineageHouseId)
    : [];
  if (lineageParticipants.length === 1) return lineageParticipants[0];

  const [firstId, secondId] = participantIds;
  const firstCount = (partnershipsByPersonId.get(firstId) || []).length;
  const secondCount = (partnershipsByPersonId.get(secondId) || []).length;
  if (firstCount === secondCount) return '';
  return firstCount > secondCount ? firstId : secondId;
}

/**
 * Legitimate partnerships occupy the lanes closest to the repeated core
 * person. Affairs and forced relations move outwards. The result is merely a
 * render plan and never changes the stored family document.
 */
export function orderFamilyChartPartnersAroundCore(partnerships, centeredPersonId) {
  const records = (partnerships || []).map((partnership, sourceIndex) => ({
    partnership,
    sourceIndex,
    partnerPersonId: partnerIdFor(partnership, centeredPersonId),
    priority: PARTNERSHIP_PROXIMITY[partnership?.type] || 0
  })).filter(record => record.partnerPersonId);
  const slots = centeredPartnerSlots(records.length);
  const preferredSlots = [...slots].sort((first, second) => (
    Math.abs(first) - Math.abs(second) || first - second
  ));
  const preferredRecords = [...records].sort((first, second) => (
    second.priority - first.priority || first.sourceIndex - second.sourceIndex
  ));
  const assignments = preferredRecords.map((record, index) => ({
    ...record,
    slot: preferredSlots[index]
  }));
  return Object.freeze(assignments
    .sort((first, second) => first.slot - second.slot)
    .map(record => Object.freeze({
      partnershipId: record.partnership.id,
      partnershipType: record.partnership.type || 'marriage',
      partnerPersonId: record.partnerPersonId,
      slot: record.slot
    })));
}

/**
 * Builds the safe automatic fallback for a star-shaped multi-partner group:
 * the shared person is rendered once, every partner owns the lane above their
 * children, and legitimate partners remain nearest to the shared person.
 *
 * Interlocked hubs (both participants have several child-bearing relations)
 * are deliberately left to explicit source data because two automatic centres
 * would compete for the same card occurrence.
 */
export function createAutomaticFamilyChartMultiPartnerPlan(family) {
  const partnershipsByPersonId = new Map();
  (family?.partnerships || []).forEach(partnership => {
    const participantIds = [...new Set(partnership.participantIds || [])].filter(Boolean);
    if (participantIds.length !== 2) return;
    participantIds.forEach(personId => {
      const entries = partnershipsByPersonId.get(personId) || [];
      entries.push(partnership);
      partnershipsByPersonId.set(personId, entries);
    });
  });

  const hubs = [];
  const partnerLaneRequests = [];
  const skippedAmbiguousPersonIds = [];
  const personById = new Map((family?.persons || []).map(person => [person.id, person]));
  const explicitlyManagedPersonIds = new Set();
  (family?.partnerships || []).forEach(partnership => {
    if (
      typeof partnership?.extensions?.chartAlignPartnerOverChildrenPersonId === 'string'
      && partnership.extensions.chartAlignPartnerOverChildrenPersonId.trim()
    ) {
      (partnership.participantIds || []).forEach(personId => explicitlyManagedPersonIds.add(personId));
    }
  });
  (family?.persons || []).forEach(person => {
    if (
      ['chartCenterBetweenPartnerPersonIds', 'chartCenterBetweenSpousePersonIds']
        .some(key => Array.isArray(person?.extensions?.[key]) && person.extensions[key].length)
    ) explicitlyManagedPersonIds.add(person.id);
  });
  const childBearingPartnershipsByPersonId = new Map();
  partnershipsByPersonId.forEach((partnerships, personId) => {
    childBearingPartnershipsByPersonId.set(personId, partnerships.filter(partnership => (
      directChildIds(family, partnership.id).length > 0
    )));
  });

  childBearingPartnershipsByPersonId.forEach((partnerships, centeredPersonId) => {
    if (partnerships.length < 2) return;
    const centeredPerson = personById.get(centeredPersonId);
    if (centeredPerson?.extensions?.chartMultiPartnerLayoutReviewed === true) return;
    const hasExplicitLayout = partnerships.some(partnership => (
      typeof partnership?.extensions?.chartAlignPartnerOverChildrenPersonId === 'string'
      && partnership.extensions.chartAlignPartnerOverChildrenPersonId.trim()
    )) || [
      centeredPerson?.extensions?.chartCenterBetweenPartnerPersonIds,
      centeredPerson?.extensions?.chartCenterBetweenSpousePersonIds
    ].some(value => Array.isArray(value) && value.length > 0);
    // Existing family-specific layout declarations stay authoritative as one
    // coherent block. Mixing inferred and hand-authored lanes is precisely
    // what previously displaced Diafol/Beryn branches across the canvas.
    if (hasExplicitLayout) return;

    const hasInterlockedHub = partnerships.some(partnership => {
      const partnerPersonId = partnerIdFor(partnership, centeredPersonId);
      return (childBearingPartnershipsByPersonId.get(partnerPersonId) || []).length > 1;
    });
    if (hasInterlockedHub) {
      skippedAmbiguousPersonIds.push(centeredPersonId);
      return;
    }

    const orderedPartners = orderFamilyChartPartnersAroundCore(
      partnerships,
      centeredPersonId
    );
    if (orderedPartners.length !== partnerships.length) {
      skippedAmbiguousPersonIds.push(centeredPersonId);
      return;
    }

    hubs.push(Object.freeze({
      centeredPersonId,
      partnerPersonIds: Object.freeze(orderedPartners.map(entry => entry.partnerPersonId)),
      partnershipIds: Object.freeze(orderedPartners.map(entry => entry.partnershipId)),
      source: 'automatic-multi-partner'
    }));
    orderedPartners.forEach(entry => {
      partnerLaneRequests.push(Object.freeze({
        partnershipId: entry.partnershipId,
        partnershipType: entry.partnershipType,
        sharedPersonId: centeredPersonId,
        partnerPersonId: entry.partnerPersonId,
        source: 'automatic-multi-partner'
      }));
    });
  });

  // Even without a complete multi-partner hub, an affair or forced relation
  // with children must remain a compact local block. Family Chart can place
  // the secondary participant at the far edge of a generation; this render
  // request keeps that partner over their own children and lets the alignment
  // pass open an adjacent slot beside the core person.
  const requestedPartnershipIds = new Set(
    partnerLaneRequests.map(request => request.partnershipId)
  );
  (family?.partnerships || []).forEach(partnership => {
    if (
      !['affair', 'forced'].includes(partnership?.type)
      || requestedPartnershipIds.has(partnership.id)
      || !directChildIds(family, partnership.id).length
      || (
        typeof partnership?.extensions?.chartAlignPartnerOverChildrenPersonId === 'string'
        && partnership.extensions.chartAlignPartnerOverChildrenPersonId.trim()
      )
    ) return;

    const sharedPersonId = relationshipCorePersonId(
      family,
      partnership,
      partnershipsByPersonId,
      personById
    );
    if (!sharedPersonId) return;
    if (explicitlyManagedPersonIds.has(sharedPersonId)) return;
    if (personById.get(sharedPersonId)?.extensions?.chartMultiPartnerLayoutReviewed === true) return;
    const partnerPersonId = partnerIdFor(partnership, sharedPersonId);
    if (!partnerPersonId) return;
    partnerLaneRequests.push(Object.freeze({
      partnershipId: partnership.id,
      partnershipType: partnership.type,
      sharedPersonId,
      partnerPersonId,
      source: 'automatic-affair-proximity'
    }));
    requestedPartnershipIds.add(partnership.id);
  });

  return Object.freeze({
    hubs: Object.freeze(hubs),
    partnerLaneRequests: Object.freeze(partnerLaneRequests),
    skippedAmbiguousPersonIds: Object.freeze(skippedAmbiguousPersonIds)
  });
}

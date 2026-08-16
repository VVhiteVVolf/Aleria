const CHILD_ALIGNMENT_EXTENSION = 'chartAlignParentPairOverChildPersonId';
const AUTOMATIC_ALIGNMENT_EXTENSION = 'chartAutomaticSingleChildAlignment';
const INACTIVE_STATUSES = new Set(['divorced', 'ended']);

function hasMultipleSpouses(family, personId) {
  return family.partnerships.filter(partnership => (
    partnership.participantIds.includes(personId)
    && ['marriage', 'union'].includes(partnership.type)
    && !INACTIVE_STATUSES.has(partnership.status || 'active')
  )).length > 1;
}

function eligibleParentages(family, partnershipId) {
  return family.parentages.filter(parentage => (
    parentage.partnershipId === partnershipId
    && parentage.type !== 'foster'
    && !parentage.extensions?.timeJumpId
  ));
}

export function refreshAutomaticSingleChildAlignment(family, partnershipIds = null) {
  const selectedIds = partnershipIds ? new Set(partnershipIds) : null;
  family.partnerships.forEach(partnership => {
    if (selectedIds && !selectedIds.has(partnership.id)) return;
    const extensions = { ...(partnership.extensions || {}) };
    const isAutomatic = extensions[AUTOMATIC_ALIGNMENT_EXTENSION] === true;
    const children = eligibleParentages(family, partnership.id);
    const belongsToMultiplePartnershipLayout = partnership.participantIds
      .some(personId => hasMultipleSpouses(family, personId));
    if (children.length === 1 && !belongsToMultiplePartnershipLayout && (!extensions[CHILD_ALIGNMENT_EXTENSION] || isAutomatic)) {
      extensions[CHILD_ALIGNMENT_EXTENSION] = children[0].childId;
      extensions[AUTOMATIC_ALIGNMENT_EXTENSION] = true;
    } else if ((children.length !== 1 || belongsToMultiplePartnershipLayout) && isAutomatic) {
      delete extensions[CHILD_ALIGNMENT_EXTENSION];
      delete extensions[AUTOMATIC_ALIGNMENT_EXTENSION];
    }
    partnership.extensions = extensions;
  });
  return family;
}

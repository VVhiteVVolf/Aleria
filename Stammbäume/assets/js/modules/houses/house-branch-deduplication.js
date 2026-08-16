function normalized(value) {
  return String(value || '').trim().toLocaleLowerCase('de');
}

function branchAnchor(branch) {
  return branch.parentPartnershipId
    ? `partnership:${branch.parentPartnershipId}`
    : `person:${branch.parentPersonId || ''}`;
}

function branchTarget(branch) {
  return normalized(branch.targetFamilyId)
    || normalized(branch.houseId)
    || normalized(branch.name);
}

export function findEquivalentHouseBranch(family, candidate, excludedBranchId = '') {
  const anchor = branchAnchor(candidate);
  const target = branchTarget(candidate);
  return family.cadetBranches.find(branch => (
    branch.id !== excludedBranchId
    && normalized(branch.linkType) === normalized(candidate.linkType)
    && branchAnchor(branch) === anchor
    && branchTarget(branch) === target
  )) || null;
}

export function assertNoDuplicateHouseBranch(family, candidate, excludedBranchId = '') {
  const equivalent = findEquivalentHouseBranch(family, candidate, excludedBranchId);
  if (equivalent) {
    throw new Error(`Diese Wappenverknüpfung existiert an derselben Stelle bereits (${equivalent.name}).`);
  }
}

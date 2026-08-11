export const CHART_PARENTAGE_GROUP_ID_EXTENSION = 'chartParentageGroupId';
export const CHART_PARENTAGE_GROUP_ANCHOR_EXTENSION = 'chartParentageGroupAnchorPersonId';

function configuredValue(parentage, field) {
  const value = parentage?.extensions?.[field];
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Groups selected parentages under one visible parent rail while leaving the
 * full relationship graph intact for Family Chart and the domain model.
 */
export function createFamilyChartParentageGroupPlan(selectedParentageByChild) {
  const mutableGroups = new Map();
  const invalidRequests = [];

  selectedParentageByChild.forEach((parentage, childId) => {
    const groupId = configuredValue(parentage, CHART_PARENTAGE_GROUP_ID_EXTENSION);
    const anchorPersonId = configuredValue(parentage, CHART_PARENTAGE_GROUP_ANCHOR_EXTENSION);
    if (!groupId && !anchorPersonId) return;

    if (!groupId || !anchorPersonId || !parentage.parentIds?.includes(anchorPersonId)) {
      invalidRequests.push(Object.freeze({
        childId,
        parentageId: parentage.id,
        groupId,
        anchorPersonId,
        parentIds: Object.freeze([...(parentage.parentIds || [])])
      }));
      return;
    }

    const existing = mutableGroups.get(groupId);
    if (existing && existing.anchorPersonId !== anchorPersonId) {
      invalidRequests.push(Object.freeze({
        childId,
        parentageId: parentage.id,
        groupId,
        anchorPersonId,
        expectedAnchorPersonId: existing.anchorPersonId,
        parentIds: Object.freeze([...(parentage.parentIds || [])])
      }));
      return;
    }

    const group = existing || { groupId, anchorPersonId, childIds: [] };
    group.childIds.push(childId);
    mutableGroups.set(groupId, group);
  });

  const groupCandidates = [...mutableGroups.values()];
  groupCandidates
    .filter(group => group.childIds.length < 2)
    .forEach(group => {
      invalidRequests.push(Object.freeze({
        groupId: group.groupId,
        anchorPersonId: group.anchorPersonId,
        childIds: Object.freeze([...group.childIds]),
        reason: 'parentage-group-requires-multiple-children'
      }));
    });
  const groups = groupCandidates
    .filter(group => group.childIds.length > 1)
    .map(group => Object.freeze({
      groupId: group.groupId,
      anchorPersonId: group.anchorPersonId,
      childIds: Object.freeze([...group.childIds])
    }));
  const groupedChildIds = new Set(groups.flatMap(group => group.childIds));

  return Object.freeze({
    groups: Object.freeze(groups),
    groupedChildIds,
    invalidRequests: Object.freeze(invalidRequests)
  });
}

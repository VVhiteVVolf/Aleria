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

/**
 * Converts opt-in card alignment into matching visible parentage routes.
 * Family Chart keeps the full parent graph for layout purposes, while the
 * overlay renderer draws the line from the card position that the editor
 * explicitly selected (partner card or center of the parent pair).
 */
export function createFamilyChartAlignedParentageGroupPlan({
  selectedParentageByChild,
  explicitGroupPlan,
  partnerAlignmentPlan,
  descendantAlignmentPlan
}) {
  const groupedChildIds = new Set(explicitGroupPlan?.groupedChildIds || []);
  const groups = [];

  (descendantAlignmentPlan?.childGroupRoutes || []).forEach(route => {
    const childIds = route.childPersonIds.filter(childId => {
      const parentage = selectedParentageByChild.get(childId);
      return parentage?.partnershipId === route.partnershipId
        && !groupedChildIds.has(childId);
    });
    if (!childIds.length) return;
    childIds.forEach(childId => groupedChildIds.add(childId));
    groups.push(Object.freeze({
      kind: 'parent-pair',
      partnershipId: route.partnershipId,
      parentIds: Object.freeze([...route.parentPersonIds]),
      childIds: Object.freeze(childIds)
    }));
  });

  (partnerAlignmentPlan?.partnerOverChildrenRoutes || []).forEach(route => {
    const childIds = route.childIds.filter(childId => {
      const parentage = selectedParentageByChild.get(childId);
      return parentage?.partnershipId === route.partnershipId
        && !groupedChildIds.has(childId);
    });
    if (!childIds.length) return;
    childIds.forEach(childId => groupedChildIds.add(childId));
    groups.push(Object.freeze({
      kind: 'partner',
      partnershipId: route.partnershipId,
      parentId: route.partnerPersonId,
      childIds: Object.freeze(childIds)
    }));
  });

  return Object.freeze({
    groups: Object.freeze(groups),
    groupedChildIds
  });
}

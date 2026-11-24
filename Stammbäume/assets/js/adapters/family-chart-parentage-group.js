export const CHART_PARENTAGE_GROUP_ID_EXTENSION = 'chartParentageGroupId';
export const CHART_PARENTAGE_GROUP_ANCHOR_EXTENSION = 'chartParentageGroupAnchorPersonId';

export function createFamilyChartParentageGroupStyle(childIds, parentageLines, biologicalColor) {
  const fallback = { type: 'biological', color: biologicalColor, dashed: false };
  const childStyles = childIds.map(childId => {
    const { type, color, dashed } = parentageLines.get(childId) || fallback;
    return { type, color, dashed };
  });
  const first = childStyles[0] || fallback;
  const uniform = childStyles.every(style => style.type === first.type
    && style.color === first.color && style.dashed === first.dashed);
  if (uniform) return first;
  return { ...fallback, childStyles: Object.freeze(childStyles.map(style => Object.freeze(style))) };
}

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
    const parents = selectedParentageByChild.get(childIds[0]).parentIds;
    const ownsPairJunction = route.source === 'automatic-multi-partner' && parents.length === 2
      && childIds.every(childId => {
        const otherParents = selectedParentageByChild.get(childId).parentIds;
        return otherParents.length === 2 && parents.every(id => otherParents.includes(id));
      });
    groups.push(Object.freeze({
      partnershipId: route.partnershipId,
      ...(ownsPairJunction
        ? { kind: 'parent-pair', parentIds: Object.freeze([...parents]) }
        : { kind: 'partner', parentId: route.partnerPersonId }),
      childIds: Object.freeze(childIds)
    }));
  });

  return Object.freeze({
    groups: Object.freeze(groups),
    groupedChildIds
  });
}

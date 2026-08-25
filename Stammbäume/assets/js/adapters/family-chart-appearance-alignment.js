import {
  cardStepForAxis,
  shiftedCollisionCount,
  shiftNodeAlongCrossAxis
} from './family-chart-collision-geometry.js';
import { familyChartPartnerMirrorId } from './family-chart-person-appearance-router.js';

function requestedPartnershipIds(person) {
  const value = person?.extensions?.chartPartnerMirrorForPartnershipIds;
  return Array.isArray(value)
    ? [...new Set(value.filter(partnershipId => typeof partnershipId === 'string' && partnershipId.trim()))]
    : [];
}

/**
 * A partner mirror is the childless copy shown beside a person's original
 * family card during an internal marriage. The chart library knows that it is
 * a spouse, but not beside which occurrence it belongs. The plan makes this
 * ownership explicit without moving the continued descendant branch.
 */
export function createFamilyChartAppearanceAlignmentPlan(family) {
  const partnershipById = new Map((family?.partnerships || []).map(partnership => [
    partnership.id,
    partnership
  ]));
  const routes = [];

  (family?.persons || []).forEach(person => {
    requestedPartnershipIds(person).forEach(partnershipId => {
      const partnership = partnershipById.get(partnershipId);
      const anchorPersonId = (partnership?.participantIds || [])
        .find(participantId => participantId !== person.id) || '';
      if (!anchorPersonId) return;
      routes.push(Object.freeze({
        partnershipId,
        anchorPersonId,
        mirrorNodeId: familyChartPartnerMirrorId(person.id, partnershipId)
      }));
    });
  });

  return Object.freeze({ routes: Object.freeze(routes) });
}

function displayedNodeById(nodes, nodeId) {
  return nodes.find(node => node?.data?.id === nodeId && !node.spouse)
    || nodes.find(node => node?.data?.id === nodeId)
    || null;
}

function treeCenter(nodes, axis) {
  const coordinates = nodes.map(node => Number(node?.[axis])).filter(Number.isFinite);
  if (!coordinates.length) return 0;
  return (Math.min(...coordinates) + Math.max(...coordinates)) / 2;
}

export function applyFamilyChartAppearanceAlignmentPlan({
  tree,
  plan,
  orientation = 'vertical'
}) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const step = cardStepForAxis(axis);
  const center = treeCenter(nodes, axis);
  const resolutions = [];

  (plan?.routes || []).forEach(route => {
    const mirrorNode = displayedNodeById(nodes, route.mirrorNodeId);
    const anchorNode = displayedNodeById(nodes, route.anchorPersonId);
    const mirrorCoordinate = Number(mirrorNode?.[axis]);
    const anchorCoordinate = Number(anchorNode?.[axis]);
    if (!mirrorNode || !anchorNode || !Number.isFinite(mirrorCoordinate) || !Number.isFinite(anchorCoordinate)) {
      return;
    }

    // The copy belongs on the outside of its origin branch. Putting it on the
    // inside would place its pair-bound house knot over the continued children
    // of the second occurrence of the same marriage.
    const direction = anchorCoordinate < center ? -1 : 1;
    const stationaryNodes = nodes.filter(node => node !== mirrorNode);
    let selected = null;
    for (let slot = 1; slot <= 12; slot += 1) {
      const targetCoordinate = anchorCoordinate + (direction * step * slot);
      const delta = targetCoordinate - mirrorCoordinate;
      const collisionCount = shiftedCollisionCount([mirrorNode], stationaryNodes, axis, delta);
      if (collisionCount === 0) {
        selected = { targetCoordinate, delta, slot, direction };
        break;
      }
    }
    if (!selected) return;

    shiftNodeAlongCrossAxis(mirrorNode, axis, selected.delta);
    resolutions.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate: selected.targetCoordinate,
      delta: selected.delta,
      side: selected.direction < 0 ? 'before' : 'after',
      slot: selected.slot
    }));
  });

  return Object.freeze({ resolutions: Object.freeze(resolutions) });
}

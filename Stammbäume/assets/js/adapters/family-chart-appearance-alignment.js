import {
  cardStepForAxis,
  shiftedCollisionCount,
  shiftNodeAlongCrossAxis
} from './family-chart-collision-geometry.js';
import { createFamilyChartPersonAppearancePlan } from './family-chart-person-appearance-router.js';

/**
 * Internal marriages use two deliberately separate pair views:
 * - a childless origin pair beside the person's siblings;
 * - a continuing pair at the partner's branch.
 *
 * The chart library knows the copied cards, but not beside which occurrence
 * they belong. The plan makes that ownership explicit without connecting the
 * two pair views or duplicating their descendants.
 */
export function createFamilyChartAppearanceAlignmentPlan(family) {
  const partnershipById = new Map((family?.partnerships || []).map(partnership => [
    partnership.id,
    partnership
  ]));
  const routes = [];

  const appearances = createFamilyChartPersonAppearancePlan({
    partnerships: family?.partnerships || [],
    personById: new Map((family?.persons || []).map(person => [person.id, person])),
    parentages: family?.parentages || []
  });
  appearances.appearances.forEach(appearance => {
    const partnership = partnershipById.get(appearance.partnershipId);
    const anchorPersonId = (partnership?.participantIds || [])
      .find(participantId => participantId !== appearance.personId) || '';
    if (!anchorPersonId) return;
    routes.push(Object.freeze({
      partnershipId: appearance.partnershipId,
      anchorPersonId,
      appearanceNodeId: appearance.id,
      role: appearance.role
    }));
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
    const appearanceNode = displayedNodeById(nodes, route.appearanceNodeId);
    const anchorNode = displayedNodeById(nodes, route.anchorPersonId);
    const appearanceCoordinate = Number(appearanceNode?.[axis]);
    const anchorCoordinate = Number(anchorNode?.[axis]);
    if (
      !appearanceNode
      || !anchorNode
      || !Number.isFinite(appearanceCoordinate)
      || !Number.isFinite(anchorCoordinate)
    ) {
      return;
    }

    // A copied spouse must stay in the immediately adjacent card slot. Moving
    // it several slots away creates a misleading long-distance partnership
    // line between unrelated branches. If an adjacent slot is occupied, the
    // following spacing guard moves the blocking local branch and keeps this
    // pair intact.
    const direction = anchorCoordinate < center ? -1 : 1;
    const stationaryNodes = nodes.filter(node => node !== appearanceNode);
    const selected = [direction, -direction]
      .map((candidateDirection, preference) => {
        const targetCoordinate = anchorCoordinate + (candidateDirection * step);
        const delta = targetCoordinate - appearanceCoordinate;
        return {
          targetCoordinate,
          delta,
          slot: 1,
          direction: candidateDirection,
          preference,
          collisionCount: shiftedCollisionCount(
            [appearanceNode],
            stationaryNodes,
            axis,
            delta
          )
        };
      })
      .sort((first, second) => (
        first.collisionCount - second.collisionCount
        || first.preference - second.preference
        || Math.abs(first.delta) - Math.abs(second.delta)
      ))[0];

    shiftNodeAlongCrossAxis(appearanceNode, axis, selected.delta);
    resolutions.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate: selected.targetCoordinate,
      delta: selected.delta,
      side: selected.direction < 0 ? 'before' : 'after',
      slot: selected.slot,
      collisionCountBeforeSpacingGuard: selected.collisionCount
    }));
  });

  return Object.freeze({ resolutions: Object.freeze(resolutions) });
}

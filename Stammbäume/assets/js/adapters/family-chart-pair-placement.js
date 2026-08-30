import {
  cardStepForAxis,
  shiftNodeAlongCrossAxis
} from './family-chart-collision-geometry.js';

const PAIR_EDGE_PLACEMENT_EXTENSION = 'chartPlacePairAtGenerationEdge';
const MAXIMUM_GAP_SLOTS = 4;

function configuredPairPlacement(partnership) {
  const value = partnership?.extensions?.[PAIR_EDGE_PLACEMENT_EXTENSION];
  if (value === undefined) return null;
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {};
}

function normalizedOrderedPersonIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .filter(personId => typeof personId === 'string')
    .map(personId => personId.trim())
    .filter(Boolean))];
}

function normalizedGapSlots(value) {
  const gapSlots = Number(value ?? 0);
  return Number.isInteger(gapSlots) && gapSlots >= 0 && gapSlots <= MAXIMUM_GAP_SLOTS
    ? gapSlots
    : null;
}

/**
 * Collects explicit leaf-pair placements without coupling source data to
 * Family Chart coordinates. `before` means left in the vertical tree and
 * above in the horizontal tree; `after` is the corresponding opposite edge.
 */
export function createFamilyChartPairPlacementPlan(family) {
  const personIds = new Set((family?.persons || []).map(person => person.id));
  const childBearingPartnershipIds = new Set((family?.parentages || [])
    .map(parentage => parentage.partnershipId)
    .filter(Boolean));
  const routes = [];
  const invalidRequests = [];

  (family?.partnerships || []).forEach(partnership => {
    const configured = configuredPairPlacement(partnership);
    if (!configured) return;

    const participantIds = [...new Set(partnership.participantIds || [])].filter(Boolean);
    const orderedPersonIds = normalizedOrderedPersonIds(configured.orderedPersonIds);
    const side = configured.side === 'before' || configured.side === 'after'
      ? configured.side
      : '';
    const gapSlots = normalizedGapSlots(configured.gapSlots);
    const validParticipantSet = participantIds.length === 2
      && orderedPersonIds.length === 2
      && orderedPersonIds.every(personId => participantIds.includes(personId))
      && participantIds.every(personId => personIds.has(personId));
    const hasDirectChildren = childBearingPartnershipIds.has(partnership.id);

    if (!validParticipantSet || !side || gapSlots === null || hasDirectChildren) {
      invalidRequests.push(Object.freeze({
        partnershipId: partnership.id,
        participantIds: Object.freeze([...participantIds]),
        orderedPersonIds: Object.freeze([...orderedPersonIds]),
        side,
        gapSlots,
        hasDirectChildren
      }));
      return;
    }

    routes.push(Object.freeze({
      partnershipId: partnership.id,
      orderedPersonIds: Object.freeze([...orderedPersonIds]),
      side,
      gapSlots
    }));
  });

  return Object.freeze({
    routes: Object.freeze(routes),
    invalidRequests: Object.freeze(invalidRequests)
  });
}

function displayedNodeById(nodes, personId) {
  return nodes.find(node => node?.data?.id === personId && !node.spouse)
    || nodes.find(node => node?.data?.id === personId)
    || null;
}

function nodesInGeneration(nodes, mainAxis, generationCoordinate, excludedNodes) {
  return nodes.filter(node => (
    !excludedNodes.has(node)
    && Number.isFinite(Number(node?.[mainAxis]))
    && Math.abs(Number(node[mainAxis]) - generationCoordinate) < 1
  ));
}

/**
 * Packs an explicitly ordered pair at one outer edge of its generation. A
 * configurable number of empty card lanes can separate the side pair from a
 * continuing lineage, while both pair cards themselves remain adjacent.
 */
export function applyFamilyChartPairPlacementPlan({
  tree,
  plan,
  orientation = 'vertical'
}) {
  const nodes = tree?.data || [];
  const crossAxis = orientation === 'horizontal' ? 'y' : 'x';
  const mainAxis = crossAxis === 'x' ? 'y' : 'x';
  const step = cardStepForAxis(crossAxis);
  const resolutions = [];

  (plan?.routes || []).forEach(route => {
    const pairNodes = route.orderedPersonIds
      .map(personId => displayedNodeById(nodes, personId))
      .filter(Boolean);
    if (pairNodes.length !== 2) return;

    const generationCoordinates = pairNodes
      .map(node => Number(node?.[mainAxis]))
      .filter(Number.isFinite);
    if (
      generationCoordinates.length !== 2
      || Math.abs(generationCoordinates[0] - generationCoordinates[1]) >= 1
    ) return;

    const generationCoordinate = generationCoordinates[0];
    const stationaryGenerationNodes = nodesInGeneration(
      nodes,
      mainAxis,
      generationCoordinate,
      new Set(pairNodes)
    );
    const stationaryCoordinates = stationaryGenerationNodes
      .map(node => Number(node?.[crossAxis]))
      .filter(Number.isFinite);
    if (!stationaryCoordinates.length) return;

    const gapDistance = step * (route.gapSlots + 1);
    const targetCoordinates = route.side === 'before'
      ? [
          Math.min(...stationaryCoordinates) - gapDistance - step,
          Math.min(...stationaryCoordinates) - gapDistance
        ]
      : [
          Math.max(...stationaryCoordinates) + gapDistance,
          Math.max(...stationaryCoordinates) + gapDistance + step
        ];
    const deltas = pairNodes.map((node, index) => (
      targetCoordinates[index] - Number(node?.[crossAxis])
    ));
    if (deltas.some(delta => !Number.isFinite(delta))) return;

    pairNodes.forEach((node, index) => {
      if (deltas[index] !== 0) shiftNodeAlongCrossAxis(node, crossAxis, deltas[index]);
    });
    resolutions.push(Object.freeze({
      ...route,
      axis: crossAxis,
      targetCoordinates: Object.freeze([...targetCoordinates]),
      deltas: Object.freeze([...deltas]),
      strategy: 'place-pair-at-generation-edge'
    }));
  });

  return Object.freeze({ resolutions: Object.freeze(resolutions) });
}

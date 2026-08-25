import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import {
  FAMILY_CHART_CARD_GAP,
  cardRectangle,
  findCollisionFreeGroupShift,
  rectanglesOverlap,
  shiftNodeAlongCrossAxis
} from './family-chart-collision-geometry.js';
import { familyChartCadetRelationshipBlock } from './family-chart-relationship-block.js';

function finiteNodes(nodes) {
  return (nodes || []).filter(node => (
    Number.isFinite(Number(node?.x))
    && Number.isFinite(Number(node?.y))
  ));
}

function nodeIdentifier(node, index) {
  return String(node?.data?.id || node?.id || `node-${index}`);
}

function familyGraph(family) {
  const persons = family?.persons || [];
  const partnerships = family?.partnerships || [];
  const parentages = family?.parentages || [];
  return {
    personById: new Map(persons.map(person => [person.id, person])),
    partnershipById: new Map(partnerships.map(partnership => [partnership.id, partnership])),
    partnerships,
    parentages
  };
}

function upstreamParentage(graph, personId) {
  return graph.parentages.find(parentage => (
    parentage.childId === personId
    && !parentage.extensions?.timeJumpId
  )) || null;
}

function branchRootForCollision(graph, personId, otherPersonId) {
  if (!graph.personById.has(personId)) return '';
  const ownParentage = upstreamParentage(graph, personId);
  const otherParentage = upstreamParentage(graph, otherPersonId);
  if (
    ownParentage?.partnershipId
    && ownParentage.partnershipId === otherParentage?.partnershipId
  ) return personId;

  if (ownParentage) {
    const partnership = graph.partnershipById.get(ownParentage.partnershipId);
    return (partnership?.participantIds || []).find(parentId => (
      graph.personById.has(parentId)
      && upstreamParentage(graph, parentId)
    )) || (partnership?.participantIds || []).find(parentId => graph.personById.has(parentId)) || personId;
  }

  const partnerWithOrigin = graph.partnerships
    .filter(partnership => partnership.participantIds?.includes(personId))
    .flatMap(partnership => partnership.participantIds)
    .find(partnerId => partnerId !== personId && upstreamParentage(graph, partnerId));
  return partnerWithOrigin || personId;
}

function descendantBranchPersonIds(graph, rootPersonId) {
  const personIds = new Set([rootPersonId]);
  const queue = [rootPersonId];
  while (queue.length) {
    const personId = queue.shift();
    graph.partnerships
      .filter(partnership => partnership.participantIds?.includes(personId))
      .forEach(partnership => {
        partnership.participantIds
          .filter(partnerId => partnerId !== personId && graph.personById.has(partnerId))
          .forEach(partnerId => personIds.add(partnerId));
        graph.parentages
          .filter(parentage => parentage.partnershipId === partnership.id)
          .forEach(parentage => {
            if (personIds.has(parentage.childId)) return;
            personIds.add(parentage.childId);
            queue.push(parentage.childId);
          });
      });

    graph.parentages
      .filter(parentage => (
        parentage.type === 'foster'
        && !parentage.partnershipId
        && !parentage.extensions?.timeJumpId
        && parentage.parentIds?.includes(personId)
      ))
      .forEach(parentage => {
        if (personIds.has(parentage.childId)) return;
        personIds.add(parentage.childId);
        queue.push(parentage.childId);
      });
  }
  return personIds;
}

function displayedBranchNodes(nodes, graph, rootPersonId) {
  const branchIds = descendantBranchPersonIds(graph, rootPersonId);
  let changed = true;
  while (changed) {
    changed = false;
    nodes.forEach(node => {
      const id = nodeIdentifier(node, -1);
      if (!id || branchIds.has(id)) return;
      const parents = Array.isArray(node?.data?.rels?.parents)
        ? node.data.rels.parents.filter(Boolean)
        : [];
      const spouses = Array.isArray(node?.data?.rels?.spouses)
        ? node.data.rels.spouses.filter(Boolean)
        : [];
      if (
        parents.some(parentId => branchIds.has(parentId))
        || spouses.some(spouseId => branchIds.has(spouseId))
      ) {
        branchIds.add(id);
        changed = true;
      }
    });
  }
  return nodes.filter(node => branchIds.has(nodeIdentifier(node, -1)));
}

function branchMovePriority(graph, rootPersonId, nodeCount) {
  const role = graph.personById.get(rootPersonId)?.lineageRole || 'member';
  const rolePriority = role === 'branch' ? 0 : role === 'member' ? 1 : role === 'mainline' ? 2 : 3;
  return [rolePriority, nodeCount];
}

function comparePriority(first, second) {
  return first.priority[0] - second.priority[0]
    || first.priority[1] - second.priority[1];
}

function resolveLocalBranchCollisions(nodes, family, axis, minimumGap) {
  if (!family) return Object.freeze([]);
  const graph = familyGraph(family);
  const resolutions = [];
  const maximumPasses = Math.max(1, nodes.length * 2);

  for (let pass = 0; pass < maximumPasses; pass += 1) {
    const collision = collectFamilyChartCardCollisions(nodes, { minimumGap })[0];
    if (!collision) break;
    const firstId = collision.firstId;
    const secondId = collision.secondId;
    const branchCandidates = [
      branchRootForCollision(graph, firstId, secondId),
      branchRootForCollision(graph, secondId, firstId)
    ].filter(Boolean).map(rootPersonId => {
        const movingNodes = displayedBranchNodes(nodes, graph, rootPersonId);
        return {
          rootPersonId,
          movingNodes,
          priority: branchMovePriority(graph, rootPersonId, movingNodes.length)
        };
      });
    const relationshipCandidates = [firstId, secondId]
      .map(houseNodeId => ({
        rootPersonId: houseNodeId,
        movingNodes: familyChartCadetRelationshipBlock(nodes, family, houseNodeId)
      }))
      .filter(candidate => candidate.movingNodes.length)
      .map(candidate => ({
        ...candidate,
        // A local childless relationship block is safer to move than a whole
        // lineage branch, because its parents and house knot stay together.
        priority: [-1, candidate.movingNodes.length]
      }));
    const candidates = [...relationshipCandidates, ...branchCandidates]
      .filter(candidate => candidate.movingNodes.length)
      .sort(comparePriority);

    let selected = null;
    for (const candidate of candidates) {
      const movingNodeSet = new Set(candidate.movingNodes);
      const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));
      const collisionPartner = candidate.movingNodes.includes(collision.first)
        ? collision.second
        : collision.first;
      if (movingNodeSet.has(collisionPartner)) continue;
      const movingCoordinate = Number(candidate.movingNodes[0]?.[axis]);
      const partnerCoordinate = Number(collisionPartner?.[axis]);
      const preferredDirection = Number.isFinite(movingCoordinate) && Number.isFinite(partnerCoordinate)
        ? (movingCoordinate <= partnerCoordinate ? -1 : 1)
        : 0;
      const delta = findCollisionFreeGroupShift(
        candidate.movingNodes,
        stationaryNodes,
        axis,
        { preferredDirection }
      );
      if (!Number.isFinite(delta) || delta === 0) continue;
      selected = { ...candidate, delta };
      break;
    }

    if (!selected) break;
    selected.movingNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, selected.delta));
    resolutions.push(Object.freeze({
      firstId,
      secondId,
      rootPersonId: selected.rootPersonId,
      axis,
      delta: selected.delta,
      movedNodeIds: Object.freeze(selected.movingNodes.map(node => nodeIdentifier(node, -1)))
    }));
  }
  return Object.freeze(resolutions);
}

export function collectFamilyChartCardCollisions(
  nodes,
  { minimumGap = FAMILY_CHART_CARD_GAP } = {}
) {
  const candidates = finiteNodes(nodes);
  const collisions = [];

  for (let firstIndex = 0; firstIndex < candidates.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < candidates.length; secondIndex += 1) {
      const first = candidates[firstIndex];
      const second = candidates[secondIndex];
      if (!rectanglesOverlap(cardRectangle(first), cardRectangle(second), minimumGap)) continue;
      collisions.push(Object.freeze({
        firstId: nodeIdentifier(first, firstIndex),
        secondId: nodeIdentifier(second, secondIndex),
        first,
        second
      }));
    }
  }

  return Object.freeze(collisions);
}

function requiredAxisScale(collisions, axis, minimumGap) {
  const cardSize = axis === 'x'
    ? FAMILY_CHART_CARD_LAYOUT.width
    : FAMILY_CHART_CARD_LAYOUT.height;
  let requiredScale = 1;

  collisions.forEach(collision => {
    const firstCoordinate = Number(collision.first?.[axis]);
    const secondCoordinate = Number(collision.second?.[axis]);
    const distance = Math.abs(firstCoordinate - secondCoordinate);
    if (!distance) {
      requiredScale = Number.POSITIVE_INFINITY;
      return;
    }
    requiredScale = Math.max(requiredScale, (cardSize + minimumGap) / distance);
  });

  return requiredScale;
}

function scaleNodeCoordinate(node, axis, center, scale, updateSourceCoordinate) {
  const coordinate = Number(node?.[axis]);
  if (Number.isFinite(coordinate)) {
    node[axis] = center + ((coordinate - center) * scale);
  }
  if (updateSourceCoordinate) {
    const sourceCoordinate = Number(node?.sx);
    if (Number.isFinite(sourceCoordinate)) {
      node.sx = center + ((sourceCoordinate - center) * scale);
    }
  }
}

export function applyFamilyChartSpacingGuard({
  tree,
  family,
  orientation = 'vertical',
  minimumGap = FAMILY_CHART_CARD_GAP,
  maximumScale = 2
}) {
  const nodes = finiteNodes(tree?.data);
  const initialCollisions = collectFamilyChartCardCollisions(nodes, { minimumGap });
  const crossAxis = orientation === 'horizontal' ? 'y' : 'x';
  const mainAxis = crossAxis === 'x' ? 'y' : 'x';
  if (!initialCollisions.length) {
    return Object.freeze({
      axis: crossAxis,
      scale: 1,
      localResolutions: Object.freeze([]),
      initialCollisions,
      remainingCollisions: initialCollisions,
      applied: false,
      reason: 'already-clear'
    });
  }

  const localResolutions = resolveLocalBranchCollisions(
    nodes,
    family,
    crossAxis,
    minimumGap
  );
  const collisionsAfterLocalResolution = collectFamilyChartCardCollisions(nodes, { minimumGap });
  if (!collisionsAfterLocalResolution.length) {
    return Object.freeze({
      axis: crossAxis,
      scale: 1,
      initialCollisions,
      localResolutions,
      remainingCollisions: collisionsAfterLocalResolution,
      applied: true,
      reason: 'locally-resolved'
    });
  }

  const crossAxisScale = requiredAxisScale(collisionsAfterLocalResolution, crossAxis, minimumGap);
  const mainAxisScale = requiredAxisScale(collisionsAfterLocalResolution, mainAxis, minimumGap);
  const axis = Number.isFinite(crossAxisScale) && crossAxisScale <= maximumScale
    ? crossAxis
    : Number.isFinite(mainAxisScale) && mainAxisScale <= maximumScale
      ? mainAxis
      : crossAxis;
  const requiredScale = axis === crossAxis ? crossAxisScale : mainAxisScale;
  const coordinates = nodes.map(node => Number(node[axis])).filter(Number.isFinite);
  const center = coordinates.length
    ? (Math.min(...coordinates) + Math.max(...coordinates)) / 2
    : 0;
  if (!Number.isFinite(requiredScale) || requiredScale > maximumScale) {
    return Object.freeze({
      axis,
      scale: 1,
      requiredScale,
      initialCollisions,
      localResolutions,
      remainingCollisions: collisionsAfterLocalResolution,
      applied: false,
      reason: !Number.isFinite(requiredScale) ? 'same-cross-axis' : 'maximum-scale-exceeded'
    });
  }

  // Ein kleiner Sicherheitsaufschlag vermeidet Rundungsberührungen beim SVG-Layout.
  const scale = Math.max(1, requiredScale + 0.01);
  nodes.forEach(node => scaleNodeCoordinate(
    node,
    axis,
    center,
    scale,
    axis === crossAxis
  ));
  const remainingCollisions = collectFamilyChartCardCollisions(nodes, { minimumGap });

  return Object.freeze({
    axis,
    center,
    scale,
    requiredScale,
    initialCollisions,
    localResolutions,
    remainingCollisions,
    applied: true,
    reason: remainingCollisions.length ? 'partially-resolved' : 'resolved'
  });
}

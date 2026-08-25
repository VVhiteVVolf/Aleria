import {
  cardStepForAxis,
  findCollisionFreeGroupShift,
  shiftedCollisionCount,
  shiftNodeAlongCrossAxis
} from './family-chart-collision-geometry.js';

const PARENT_PAIR_OVER_CHILD_EXTENSION = 'chartAlignParentPairOverChildPersonId';
const CHILD_GROUP_BELOW_PARENT_PAIR_EXTENSION = 'chartAlignChildGroupBelowParentPair';
const PACK_LEAF_SIBLINGS_BESIDE_ALIGNED_CHILD_EXTENSION =
  'chartPackLeafSiblingBranchesBesideAlignedChild';
const PACK_SIBLING_BRANCHES_BESIDE_ALIGNED_CHILD_EXTENSION =
  'chartPackSiblingBranchesBesideAlignedChild';

function configuredChildId(partnership) {
  const value = partnership?.extensions?.[PARENT_PAIR_OVER_CHILD_EXTENSION];
  return typeof value === 'string' ? value.trim() : '';
}

function displayedMainNode(nodes, personId) {
  const candidates = nodes.filter(node => node?.data?.id === personId);
  return candidates.find(node => !node.spouse) || candidates[0] || null;
}

function displayedPartnerNode(nodes, personId) {
  return nodes.find(node => node?.data?.id === personId && node.spouse) || null;
}

function collectDescendantBranchPersonIds(family, rootPersonId) {
  const descendantPersonIds = new Set([rootPersonId]);
  const partnerPersonIds = new Set();
  const queue = [rootPersonId];

  while (queue.length) {
    const personId = queue.shift();
    (family?.partnerships || [])
      .filter(partnership => partnership.participantIds?.includes(personId))
      .forEach(partnership => {
        partnership.participantIds
          .filter(participantId => participantId !== personId)
          .forEach(partnerPersonId => partnerPersonIds.add(partnerPersonId));
        (family?.parentages || [])
          .filter(parentage => parentage.partnershipId === partnership.id)
          .forEach(parentage => {
            if (descendantPersonIds.has(parentage.childId)) return;
            descendantPersonIds.add(parentage.childId);
            queue.push(parentage.childId);
          });
      });

    // Ein aufgenommenes Mündel ohne Elternpartnerschaft ist trotzdem ein
    // sichtbarer Bestandteil des Zweigs seines Vormunds. Wird ein ganzer
    // Nachkommenzweig später erneut ausgerichtet, muss das Mündel denselben
    // Versatz erhalten; andernfalls bleibt es an der alten Koordinate zurück
    // und die Pflegschaftslinie spannt sich quer durch den Gesamtbaum.
    (family?.parentages || [])
      .filter(parentage => (
        parentage.type === 'foster'
        && !parentage.partnershipId
        && !parentage.extensions?.timeJumpId
        && parentage.parentIds?.includes(personId)
      ))
      .forEach(parentage => {
        if (descendantPersonIds.has(parentage.childId)) return;
        descendantPersonIds.add(parentage.childId);
        queue.push(parentage.childId);
      });
  }

  descendantPersonIds.forEach(personId => partnerPersonIds.delete(personId));
  return [...descendantPersonIds, ...partnerPersonIds];
}

function directPartnerPersonIds(family, personId) {
  return [...new Set((family?.partnerships || [])
    .filter(partnership => partnership.participantIds?.includes(personId))
    .flatMap(partnership => partnership.participantIds)
    .filter(partnerPersonId => partnerPersonId !== personId))];
}

function linkedHouseNodeIds(family, personId) {
  const partnershipIds = new Set((family?.partnerships || [])
    .filter(partnership => partnership.participantIds?.includes(personId))
    .map(partnership => partnership.id));
  return (family?.cadetBranches || [])
    .filter(branch => partnershipIds.has(branch.parentPartnershipId))
    .map(branch => `__cadet-${branch.id}`);
}

function hasUpstreamParentage(family, personIds) {
  const candidates = new Set(personIds || []);
  return (family?.parentages || []).some(parentage => candidates.has(parentage.childId));
}

function shiftDescendantBranchToParentCenter(nodes, route, axis, delta) {
  if (!delta) return Object.freeze([]);
  const descendantPersonIds = new Set(
    route.descendantBranchPersonIds || [route.childPersonId]
  );
  const movingNodes = nodes.filter(node => descendantPersonIds.has(node?.data?.id));
  movingNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, -delta));
  return Object.freeze(movingNodes.map(node => node?.data?.id).filter(Boolean));
}

function resolveAlignedBranchCollision(nodes, route, axis) {
  const movingPersonIds = new Set([
    ...route.parentPersonIds,
    ...(route.descendantBranchPersonIds || [route.childPersonId])
  ]);
  const movingNodes = nodes.filter(node => movingPersonIds.has(node?.data?.id));
  const movingNodeSet = new Set(movingNodes);
  const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));
  const delta = findCollisionFreeGroupShift(movingNodes, stationaryNodes, axis);
  if (!Number.isFinite(delta) || delta === 0) return null;

  movingNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, delta));
  return Object.freeze({
    partnershipId: route.partnershipId,
    childPersonId: route.childPersonId,
    axis,
    delta,
    movedPersonIds: Object.freeze([...movingPersonIds])
  });
}

function resolveAlignedChildGroupCollision(nodes, route, axis, localNodes) {
  const movingNodes = [...new Set(localNodes.filter(Boolean))];
  const movingNodeSet = new Set(movingNodes);
  const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));
  const delta = findCollisionFreeGroupShift(movingNodes, stationaryNodes, axis);
  if (!Number.isFinite(delta) || delta === 0) return null;

  movingNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, delta));
  return Object.freeze({
    partnershipId: route.partnershipId,
    childPersonIds: Object.freeze([...route.childPersonIds]),
    axis,
    delta,
    movedNodeIds: Object.freeze(movingNodes.map(node => node?.data?.id).filter(Boolean))
  });
}

function placeAdjacentFosterChildren(nodes, route, axis) {
  const fosterPlacements = (route.adjacentFosterChildren || [])
    .map(entry => ({
      ...entry,
      node: displayedMainNode(nodes, entry.childPersonId),
      guardianNode: displayedMainNode(nodes, entry.guardianPersonId)
    }))
    .filter(entry => entry.node && entry.guardianNode);
  if (!fosterPlacements.length) return [];

  const step = cardStepForAxis(axis);
  const fosterNodeSet = new Set(fosterPlacements.map(entry => entry.node));
  const stationaryNodes = nodes.filter(node => !fosterNodeSet.has(node));
  const placedFosterNodes = [];
  const resolutions = [];

  fosterPlacements.forEach(entry => {
    const currentCoordinate = Number(entry.node?.[axis]);
    const guardianCoordinate = Number(entry.guardianNode?.[axis]);
    if (!Number.isFinite(currentCoordinate) || !Number.isFinite(guardianCoordinate)) return;

    // Ein Mündel gehört optisch in die unmittelbare Spur seines Vormunds.
    // Die frühere Platzierung orientierte sich an den Außenkanten der gesamten
    // Kindergruppe. Bei breiten Geschwisterreihen konnte das Mündel deshalb
    // viele Zweige entfernt landen und eine kilometerlange Pflegschaftslinie
    // durch den Stammbaum ziehen. Erst die senkrechte Vormundspur, danach die
    // nächstgelegenen freien Plätze links und rechts, ist die stabile Ordnung.
    const candidates = [];
    const maximumSlots = Math.max(3, stationaryNodes.length + fosterPlacements.length);
    for (let slot = 0; slot <= maximumSlots; slot += 1) {
      const sides = slot === 0 ? ['center'] : ['before', 'after'];
      sides.forEach(side => {
        const coordinate = side === 'center'
          ? guardianCoordinate
          : side === 'before'
            ? guardianCoordinate - (step * slot)
            : guardianCoordinate + (step * slot);
        const delta = coordinate - currentCoordinate;
        const collisionCount = shiftedCollisionCount(
          [entry.node],
          [...stationaryNodes, ...placedFosterNodes],
          axis,
          delta
        );
        candidates.push({ side, slot, coordinate, delta, collisionCount });
      });
    }

    const selected = candidates
      .filter(candidate => candidate.collisionCount === 0)
      .sort((first, second) => (
        first.slot - second.slot
        || Number(first.side === 'after') - Number(second.side === 'after')
        || Math.abs(first.delta) - Math.abs(second.delta)
      ))[0];
    if (!selected) return;

    if (selected.delta) shiftNodeAlongCrossAxis(entry.node, axis, selected.delta);
    placedFosterNodes.push(entry.node);
    resolutions.push(Object.freeze({
      childPersonId: entry.childPersonId,
      guardianPersonId: entry.guardianPersonId,
      axis,
      side: selected.side,
      slot: selected.slot,
      targetCoordinate: selected.coordinate,
      delta: selected.delta
    }));
  });

  return resolutions;
}

function placeLeafSiblingBranchesBesideAlignedChild(nodes, route, axis) {
  const primaryPersonIds = new Set([
    route.childPersonId,
    ...(route.alignedChildPartnerPersonIds || [])
  ]);
  const primaryNodes = [...new Set([...primaryPersonIds]
    .map(personId => (
      personId === route.childPersonId
        ? displayedMainNode(nodes, personId)
        : displayedPartnerNode(nodes, personId) || displayedMainNode(nodes, personId)
    ))
    .filter(Boolean))];
  const primaryCoordinates = primaryNodes
    .map(node => Number(node?.[axis]))
    .filter(Number.isFinite);
  if (!primaryNodes.length || primaryCoordinates.length !== primaryNodes.length) return [];

  const step = cardStepForAxis(axis);
  const primaryMinimum = Math.min(...primaryCoordinates);
  const primaryMaximum = Math.max(...primaryCoordinates);
  const primaryCenter = (primaryMinimum + primaryMaximum) / 2;
  const packedBranches = route.packedSiblingBranches?.length
    ? route.packedSiblingBranches
    : route.leafSiblingBranches || [];
  const packedPersonIds = new Set(packedBranches.flatMap(branch => (
    branch.movingPersonIds || branch.personIds || []
  )));
  const stationaryBaseNodes = nodes.filter(node => !packedPersonIds.has(node?.data?.id));
  const alreadyPlacedNodes = [];
  const resolutions = [];

  [...packedBranches]
    .map(branch => {
      const rootNodes = [...new Set((branch.rootPersonIds || [branch.childPersonId])
        .map(personId => (
          personId === branch.childPersonId
            ? displayedMainNode(nodes, personId)
            : displayedPartnerNode(nodes, personId) || displayedMainNode(nodes, personId)
        ))
        .filter(Boolean))];
      const rootCoordinates = rootNodes
        .map(node => Number(node?.[axis]))
        .filter(Number.isFinite);
      const rootCenter = rootCoordinates.length === rootNodes.length && rootCoordinates.length
        ? (Math.min(...rootCoordinates) + Math.max(...rootCoordinates)) / 2
        : Number.NaN;
      return { branch, rootNodes, rootCoordinates, rootCenter };
    })
    .sort((first, second) => (
      Math.abs(first.rootCenter - primaryCenter) - Math.abs(second.rootCenter - primaryCenter)
    ))
    .forEach(({ branch, rootNodes, rootCoordinates, rootCenter }) => {
      const branchPersonIds = new Set(
        branch.movingPersonIds || branch.personIds || [branch.childPersonId]
      );
      const movingNodes = [...new Set([...branchPersonIds]
        .map(personId => (
          personId === branch.childPersonId
            ? displayedMainNode(nodes, personId)
            : displayedPartnerNode(nodes, personId) || displayedMainNode(nodes, personId)
        ))
        .filter(Boolean))];
      const movingNodeSet = new Set(movingNodes);
      const movingCoordinates = movingNodes
        .map(node => Number(node?.[axis]))
        .filter(Number.isFinite);
      if (!movingNodes.length || movingCoordinates.length !== movingNodes.length) return;

      if (!rootNodes.length || rootCoordinates.length !== rootNodes.length) return;
      const stationaryNodes = stationaryBaseNodes.filter(node => !movingNodeSet.has(node));
      const rootMinimum = Math.min(...rootCoordinates);
      const rootMaximum = Math.max(...rootCoordinates);
      const preferredSide = rootCenter < primaryCenter ? 'before' : 'after';
      const maximumSlots = Math.max(3, nodes.length + 1);
      const candidates = [];

      for (let slot = 1; slot <= maximumSlots; slot += 1) {
        ['before', 'after'].forEach(side => {
          const targetBoundary = side === 'before'
            ? primaryMinimum - (step * slot)
            : primaryMaximum + (step * slot);
          const delta = side === 'before'
            ? targetBoundary - rootMaximum
            : targetBoundary - rootMinimum;
          candidates.push({
            side,
            slot,
            delta,
            collisionCount: shiftedCollisionCount(
              movingNodes,
              [...stationaryNodes, ...alreadyPlacedNodes],
              axis,
              delta
            )
          });
        });
      }

      const selected = candidates
        .filter(candidate => candidate.collisionCount === 0)
        .sort((first, second) => (
          first.slot - second.slot
          || Number(second.side === preferredSide) - Number(first.side === preferredSide)
          || Math.abs(first.delta) - Math.abs(second.delta)
        ))[0];
      if (!selected) return;

      if (selected.delta) {
        movingNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, selected.delta));
      }
      alreadyPlacedNodes.push(...movingNodes);
      resolutions.push(Object.freeze({
        childPersonId: branch.childPersonId,
        personIds: Object.freeze([...branchPersonIds]),
        axis,
        side: selected.side,
        slot: selected.slot,
        delta: selected.delta
      }));
    });

  return resolutions;
}

function downstreamDepth(route, routes, visiting = new Set()) {
  if (visiting.has(route.partnershipId)) return 0;
  const nextVisiting = new Set(visiting).add(route.partnershipId);
  const downstreamRoutes = routes.filter(candidate => (
    candidate.partnershipId !== route.partnershipId
    && candidate.parentPersonIds.includes(route.childPersonId)
  ));
  if (!downstreamRoutes.length) return 0;
  return 1 + Math.max(...downstreamRoutes.map(candidate => (
    downstreamDepth(candidate, routes, nextVisiting)
  )));
}

function childGroupDownstreamDepth(route, routes, visiting = new Set()) {
  if (visiting.has(route.partnershipId)) return 0;
  const nextVisiting = new Set(visiting).add(route.partnershipId);
  const downstreamRoutes = routes.filter(candidate => (
    candidate.partnershipId !== route.partnershipId
    && route.childPersonIds.some(childPersonId => (
      candidate.parentPersonIds.includes(childPersonId)
    ))
  ));
  if (!downstreamRoutes.length) return 0;
  return 1 + Math.max(...downstreamRoutes.map(candidate => (
    childGroupDownstreamDepth(candidate, routes, nextVisiting)
  )));
}

export function createFamilyChartDescendantAlignmentPlan(family) {
  const routes = [];
  const childGroupRoutes = [];
  const invalidRequests = [];
  const personIds = new Set((family?.persons || []).map(person => person.id));

  (family?.partnerships || []).forEach(partnership => {
    const childPersonId = configuredChildId(partnership);
    if (!childPersonId) return;

    const parentPersonIds = Array.isArray(partnership.participantIds)
      ? [...partnership.participantIds]
      : [];
    const isDirectChild = (family?.parentages || []).some(parentage => (
      parentage.partnershipId === partnership.id
      && parentage.childId === childPersonId
      && parentPersonIds.every(parentId => parentage.parentIds?.includes(parentId))
    ));

    if (
      parentPersonIds.length !== 2
      || !parentPersonIds.every(parentId => personIds.has(parentId))
      || !personIds.has(childPersonId)
      || !isDirectChild
    ) {
      invalidRequests.push(Object.freeze({
        partnershipId: partnership.id,
        parentPersonIds: Object.freeze(parentPersonIds),
        childPersonId
      }));
      return;
    }

    routes.push(Object.freeze({
      partnershipId: partnership.id,
      parentPersonIds: Object.freeze(parentPersonIds),
      childPersonId,
      preserveParentPairPosition: hasUpstreamParentage(family, parentPersonIds),
      alignedChildPartnerPersonIds: Object.freeze((family?.partnerships || [])
        .filter(candidate => candidate.participantIds?.includes(childPersonId))
        .flatMap(candidate => candidate.participantIds)
        .filter(personId => personId !== childPersonId)),
      leafSiblingBranches: Object.freeze(
        partnership?.extensions?.[PACK_LEAF_SIBLINGS_BESIDE_ALIGNED_CHILD_EXTENSION] === true
          ? [...new Set((family?.parentages || [])
            .filter(parentage => (
              parentage.partnershipId === partnership.id
              && parentage.childId !== childPersonId
              && !parentage.extensions?.timeJumpId
              && !(family?.parentages || []).some(candidate => (
                candidate.parentIds?.includes(parentage.childId)
              ))
            ))
            .map(parentage => parentage.childId))]
            .map(siblingPersonId => Object.freeze({
              childPersonId: siblingPersonId,
              rootPersonIds: Object.freeze([
                siblingPersonId,
                ...directPartnerPersonIds(family, siblingPersonId)
              ]),
              personIds: Object.freeze(collectDescendantBranchPersonIds(family, siblingPersonId)),
              movingPersonIds: Object.freeze([
                ...collectDescendantBranchPersonIds(family, siblingPersonId),
                ...linkedHouseNodeIds(family, siblingPersonId)
              ])
            }))
          : []
      ),
      packedSiblingBranches: Object.freeze(
        partnership?.extensions?.[PACK_SIBLING_BRANCHES_BESIDE_ALIGNED_CHILD_EXTENSION] === true
          ? [...new Set((family?.parentages || [])
            .filter(parentage => (
              parentage.partnershipId === partnership.id
              && parentage.childId !== childPersonId
            ))
            .map(parentage => parentage.childId))]
            .map(siblingPersonId => Object.freeze({
              childPersonId: siblingPersonId,
              rootPersonIds: Object.freeze([
                siblingPersonId,
                ...directPartnerPersonIds(family, siblingPersonId)
              ]),
              personIds: Object.freeze(collectDescendantBranchPersonIds(family, siblingPersonId)),
              movingPersonIds: Object.freeze([
                // Ein Geschwisterzweig ist eine zusammenhängende Einheit.
                // Nur Wurzel und Partner zu verschieben ließ dessen Kinder an
                // ihren alten Koordinaten zurück und erzeugte genau die
                // kilometerlangen Querlinien, die diese Packregel verhindern
                // soll. Deshalb wandert stets der vollständige Nachkommenblock.
                ...collectDescendantBranchPersonIds(family, siblingPersonId),
                ...linkedHouseNodeIds(family, siblingPersonId)
              ])
            }))
          : []
      ),
      descendantBranchPersonIds: Object.freeze(
        collectDescendantBranchPersonIds(family, childPersonId)
      )
    }));
  });

  (family?.partnerships || []).forEach(partnership => {
    if (partnership?.extensions?.[CHILD_GROUP_BELOW_PARENT_PAIR_EXTENSION] !== true) return;

    const parentPersonIds = Array.isArray(partnership.participantIds)
      ? [...partnership.participantIds]
      : [];
    const childPersonIds = [...new Set((family?.parentages || [])
      .filter(parentage => (
        parentage.partnershipId === partnership.id
        && !parentage.extensions?.timeJumpId
      ))
      .map(parentage => parentage.childId))];
    const adjacentFosterChildren = (family?.parentages || [])
      .filter(parentage => (
        parentage.type === 'foster'
        && !parentage.partnershipId
        && !parentage.extensions?.timeJumpId
        && parentage.parentIds?.length === 1
        && parentPersonIds.includes(parentage.parentIds[0])
        && !childPersonIds.includes(parentage.childId)
        && personIds.has(parentage.childId)
        && !(family?.parentages || []).some(candidate => (
          candidate.parentIds?.includes(parentage.childId)
        ))
      ))
      .map(parentage => Object.freeze({
        childPersonId: parentage.childId,
        guardianPersonId: parentage.parentIds[0]
      }));
    const adjacentFosterChildPersonIds = [...new Set(
      adjacentFosterChildren.map(entry => entry.childPersonId)
    )];
    const continuingChildPersonIds = childPersonIds.filter(childPersonId => (
      (family?.parentages || []).some(parentage => parentage.parentIds?.includes(childPersonId))
    ));
    const descendantBranchPersonIds = [...new Set(childPersonIds.flatMap(childPersonId => (
      collectDescendantBranchPersonIds(family, childPersonId)
    )))];

    if (
      parentPersonIds.length !== 2
      || !parentPersonIds.every(parentId => personIds.has(parentId))
      || !childPersonIds.length
      || !childPersonIds.every(childPersonId => personIds.has(childPersonId))
    ) {
      invalidRequests.push(Object.freeze({
        kind: 'child-group-below-parent-pair',
        partnershipId: partnership.id,
        parentPersonIds: Object.freeze(parentPersonIds),
        childPersonIds: Object.freeze(childPersonIds),
        continuingChildPersonIds: Object.freeze(continuingChildPersonIds)
      }));
      return;
    }

    childGroupRoutes.push(Object.freeze({
      partnershipId: partnership.id,
      parentPersonIds: Object.freeze(parentPersonIds),
      childPersonIds: Object.freeze(childPersonIds),
      adjacentFosterChildren: Object.freeze(adjacentFosterChildren),
      adjacentFosterChildPersonIds: Object.freeze(adjacentFosterChildPersonIds),
      continuingChildPersonIds: Object.freeze(continuingChildPersonIds),
      descendantBranchPersonIds: Object.freeze(descendantBranchPersonIds)
    }));
  });

  const orderedRoutes = [...routes].sort((first, second) => (
    downstreamDepth(first, routes) - downstreamDepth(second, routes)
  ));
  const orderedChildGroupRoutes = [...childGroupRoutes].sort((first, second) => (
    childGroupDownstreamDepth(first, childGroupRoutes)
    - childGroupDownstreamDepth(second, childGroupRoutes)
  ));

  return Object.freeze({
    routes: Object.freeze(orderedRoutes),
    childGroupRoutes: Object.freeze(orderedChildGroupRoutes),
    invalidRequests: Object.freeze(invalidRequests)
  });
}

export function applyFamilyChartDescendantAlignmentPlan({
  tree,
  plan,
  orientation = 'vertical'
}) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const appliedRoutes = [];
  const appliedChildGroupRoutes = [];
  const collisionResolutions = [];
  const fosterPlacementResolutions = [];
  const leafSiblingPlacementResolutions = [];
  const stabilizationRoutes = [];

  (plan?.routes || []).forEach(route => {
    const childNode = displayedMainNode(nodes, route.childPersonId);
    const firstParentNode = displayedMainNode(nodes, route.parentPersonIds[0]);
    const secondParentNode = displayedPartnerNode(nodes, route.parentPersonIds[1])
      || displayedMainNode(nodes, route.parentPersonIds[1]);
    const childCoordinate = Number(childNode?.[axis]);
    const firstParentCoordinate = Number(firstParentNode?.[axis]);
    const secondParentCoordinate = Number(secondParentNode?.[axis]);

    if (
      !childNode
      || !firstParentNode
      || !secondParentNode
      || !Number.isFinite(childCoordinate)
      || !Number.isFinite(firstParentCoordinate)
      || !Number.isFinite(secondParentCoordinate)
    ) return;

    const parentCenter = (firstParentCoordinate + secondParentCoordinate) / 2;
    const delta = childCoordinate - parentCenter;
    const movedDescendantNodeIds = route.preserveParentPairPosition
      ? shiftDescendantBranchToParentCenter(nodes, route, axis, delta)
      : Object.freeze([]);
    if (delta && !route.preserveParentPairPosition) {
      shiftNodeAlongCrossAxis(firstParentNode, axis, delta);
      shiftNodeAlongCrossAxis(secondParentNode, axis, delta);
    }

    // Bereits in eine vorherige Generation eingebettete Eltern bleiben bei ihren
    // Geschwistern verankert. Sonst wird die verkürzte Kinderkante lediglich als
    // kilometerlange Querlinie eine Generation nach oben verschoben.
    const collisionResolution = route.preserveParentPairPosition
      ? null
      : resolveAlignedBranchCollision(nodes, route, axis);
    if (collisionResolution) collisionResolutions.push(collisionResolution);
    const leafSiblingPlacements = placeLeafSiblingBranchesBesideAlignedChild(
      nodes,
      route,
      axis
    );
    leafSiblingPlacementResolutions.push(...leafSiblingPlacements);

    appliedRoutes.push(Object.freeze({
      ...route,
      axis,
      alignmentStrategy: route.preserveParentPairPosition
        ? 'move-descendant-branch-to-anchored-parent-pair'
        : 'move-parent-pair-to-child',
      movedDescendantNodeIds,
      targetCoordinate: childCoordinate + (collisionResolution?.delta || 0),
      delta,
      leafSiblingPlacements: Object.freeze(leafSiblingPlacements),
      collisionResolution
    }));
  });

  // In Mehrpartnergruppen darf die Diagrammbibliothek einen legitimen
  // Geschwisterblock nicht unter nur einen Elternteil ziehen. Diese bewusst
  // gesetzte Route verschiebt ausschließlich blattförmige Kinder als lokalen
  // Block unter die Mitte ihres Elternpaares. Andere Zweige bleiben unberührt.
  (plan?.childGroupRoutes || []).forEach(route => {
    const firstParentNode = displayedMainNode(nodes, route.parentPersonIds[0]);
    const secondParentNode = displayedPartnerNode(nodes, route.parentPersonIds[1])
      || displayedMainNode(nodes, route.parentPersonIds[1]);
    const childNodes = route.childPersonIds
      .map(childPersonId => displayedMainNode(nodes, childPersonId))
      .filter(Boolean);
    const adjacentFosterChildNodes = (route.adjacentFosterChildPersonIds || [])
      .map(childPersonId => displayedMainNode(nodes, childPersonId))
      .filter(Boolean);
    const descendantBranchPersonIds = new Set(route.descendantBranchPersonIds || route.childPersonIds);
    const descendantBranchNodes = nodes.filter(node => (
      descendantBranchPersonIds.has(node?.data?.id)
    ));
    const movingDescendantNodes = [...new Set([
      ...descendantBranchNodes,
      ...childNodes,
      ...adjacentFosterChildNodes
    ])];
    const firstParentCoordinate = Number(firstParentNode?.[axis]);
    const secondParentCoordinate = Number(secondParentNode?.[axis]);
    const childCoordinates = childNodes
      .map(childNode => Number(childNode?.[axis]))
      .filter(Number.isFinite);

    if (
      !firstParentNode
      || !secondParentNode
      || childNodes.length !== route.childPersonIds.length
      || !Number.isFinite(firstParentCoordinate)
      || !Number.isFinite(secondParentCoordinate)
      || childCoordinates.length !== childNodes.length
    ) return;

    const parentCenter = (firstParentCoordinate + secondParentCoordinate) / 2;
    const childCenter = (Math.min(...childCoordinates) + Math.max(...childCoordinates)) / 2;
    const delta = parentCenter - childCenter;
    if (delta) {
      movingDescendantNodes
        .forEach(childNode => shiftNodeAlongCrossAxis(childNode, axis, delta));
    }

    const fosterPlacements = placeAdjacentFosterChildren(nodes, route, axis);
    fosterPlacementResolutions.push(...fosterPlacements);

    const collisionResolution = resolveAlignedChildGroupCollision(
      nodes,
      route,
      axis,
      [firstParentNode, secondParentNode, ...movingDescendantNodes]
    );
    if (collisionResolution) collisionResolutions.push(collisionResolution);

    appliedChildGroupRoutes.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate: parentCenter + (collisionResolution?.delta || 0),
      delta,
      fosterPlacements: Object.freeze(fosterPlacements),
      collisionResolution
    }));
  });

  // Kindergruppen können nach der ersten Tiefenpassage noch einen bereits
  // ausgerichteten Hauptnachkommen verschieben. Ein zweiter, ausschließlich
  // verankerter Durchgang zieht nur die betroffenen Nachkommenblöcke wieder
  // unter ihre Eltern; die Herkunftsgeneration selbst bleibt unangetastet.
  (plan?.routes || [])
    .filter(route => route.preserveParentPairPosition)
    .forEach(route => {
      const childNode = displayedMainNode(nodes, route.childPersonId);
      const firstParentNode = displayedMainNode(nodes, route.parentPersonIds[0]);
      const secondParentNode = displayedPartnerNode(nodes, route.parentPersonIds[1])
        || displayedMainNode(nodes, route.parentPersonIds[1]);
      const childCoordinate = Number(childNode?.[axis]);
      const firstParentCoordinate = Number(firstParentNode?.[axis]);
      const secondParentCoordinate = Number(secondParentNode?.[axis]);
      if (
        !Number.isFinite(childCoordinate)
        || !Number.isFinite(firstParentCoordinate)
        || !Number.isFinite(secondParentCoordinate)
      ) return;

      const parentCenter = (firstParentCoordinate + secondParentCoordinate) / 2;
      const delta = childCoordinate - parentCenter;
      const movedDescendantNodeIds = shiftDescendantBranchToParentCenter(
        nodes,
        route,
        axis,
        delta
      );
      const siblingPlacements = placeLeafSiblingBranchesBesideAlignedChild(
        nodes,
        route,
        axis
      );
      leafSiblingPlacementResolutions.push(...siblingPlacements);
      stabilizationRoutes.push(Object.freeze({
        partnershipId: route.partnershipId,
        childPersonId: route.childPersonId,
        axis,
        delta,
        movedDescendantNodeIds,
        siblingPlacements: Object.freeze(siblingPlacements)
      }));
    });

  return Object.freeze({
    appliedRoutes: Object.freeze(appliedRoutes),
    appliedChildGroupRoutes: Object.freeze(appliedChildGroupRoutes),
    collisionResolutions: Object.freeze(collisionResolutions),
    fosterPlacementResolutions: Object.freeze(fosterPlacementResolutions),
    leafSiblingPlacementResolutions: Object.freeze(leafSiblingPlacementResolutions),
    stabilizationRoutes: Object.freeze(stabilizationRoutes)
  });
}

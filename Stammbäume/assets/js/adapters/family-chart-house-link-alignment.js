import { cardStepForAxis } from './family-chart-collision-geometry.js';

const SIDE_PLACED_HOUSE_LINK_TYPES = new Set([
  'line-extinct',
  'migration-offshoot'
]);

function hasDirectPersonAnchor(branch) {
  return Boolean(branch.parentPersonId)
    && !branch.parentPartnershipId
    && !SIDE_PLACED_HOUSE_LINK_TYPES.has(branch.linkType);
}

export function createFamilyChartHouseLinkAlignmentPlan(family) {
  const personIds = new Set((family?.persons || []).map(person => person.id));
  const partnershipById = new Map((family?.partnerships || []).map(partnership => (
    [partnership.id, partnership]
  )));
  const routes = [];
  const partnershipRoutes = [];
  const invalidRequests = [];

  (family?.cadetBranches || []).forEach(branch => {
    // Einzelgebundene Zielknoten (etwa Mündel- oder Einzelgründerknoten)
    // teilen immer die senkrechte Achse ihrer Person. Nur ausdrücklich
    // seitlich gerenderte Auswüchse und Linienenden bleiben davon ausgenommen.
    if (!hasDirectPersonAnchor(branch)) return;
    const anchorPersonId = String(branch.parentPersonId || '').trim();
    if (!anchorPersonId || !personIds.has(anchorPersonId)) {
      invalidRequests.push(Object.freeze({
        branchId: branch.id,
        anchorPersonId
      }));
      return;
    }

    routes.push(Object.freeze({
      branchId: branch.id,
      linkType: branch.linkType,
      anchorPersonId,
      houseNodeId: `__cadet-${branch.id}`
    }));
  });

  (family?.cadetBranches || []).forEach(branch => {
    if (
      !branch.parentPartnershipId
      || branch.linkType === 'line-extinct'
    ) return;
    const partnership = partnershipById.get(branch.parentPartnershipId);
    const parentPersonIds = Array.isArray(partnership?.participantIds)
      ? partnership.participantIds.filter(personId => personIds.has(personId)).slice(0, 2)
      : [];
    if (parentPersonIds.length !== 2) {
      invalidRequests.push(Object.freeze({
        branchId: branch.id,
        partnershipId: branch.parentPartnershipId,
        parentPersonIds: Object.freeze([...parentPersonIds])
      }));
      return;
    }

    partnershipRoutes.push(Object.freeze({
      branchId: branch.id,
      linkType: branch.linkType,
      partnershipId: branch.parentPartnershipId,
      parentPersonIds: Object.freeze([...parentPersonIds]),
      houseNodeId: `__cadet-${branch.id}`
    }));
  });

  return Object.freeze({
    routes: Object.freeze(routes),
    partnershipRoutes: Object.freeze(partnershipRoutes),
    invalidRequests: Object.freeze(invalidRequests)
  });
}

function displayedNodeById(nodes, nodeId) {
  return nodes.find(node => node?.data?.id === nodeId && !node.spouse)
    || nodes.find(node => node?.data?.id === nodeId)
    || null;
}

function displayedPartnershipParentNodes(nodes, houseNode, route) {
  const relationshipParentIds = houseNode?.data?.data?.aleria?.relationshipParentIds;
  const renderedParentIds = Array.isArray(relationshipParentIds)
    ? relationshipParentIds.filter(Boolean).slice(0, 2)
    : Array.isArray(houseNode?.data?.rels?.parents)
      ? houseNode.data.rels.parents.filter(Boolean).slice(0, 2)
      : [];
  const renderedParentNodes = renderedParentIds
    .map(parentId => displayedNodeById(nodes, parentId))
    .filter(Boolean);

  // Bei kontrolliert wiederholten Personen verweist der Hausknoten auf die
  // tatsächlich dargestellte Partnerkarte. Die kanonischen Personen-IDs aus
  // der Akte würden dagegen die weit entfernten Hauptkarten auswählen und den
  // Knoten quer durch andere Geschwisterzweige ziehen.
  if (renderedParentNodes.length === 2) {
    return {
      parentNodes: renderedParentNodes,
      displayedParentNodeIds: renderedParentIds
    };
  }

  return {
    parentNodes: route.parentPersonIds
      .map(parentPersonId => displayedNodeById(nodes, parentPersonId))
      .filter(Boolean),
    displayedParentNodeIds: [...route.parentPersonIds]
  };
}

export function applyFamilyChartHouseLinkAlignmentPlan({ tree, plan, orientation = 'vertical' }) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const alignedRoutes = [];
  const alignedPartnershipRoutes = [];

  (plan?.routes || []).forEach(route => {
    const anchorNode = displayedNodeById(nodes, route.anchorPersonId);
    const houseNode = displayedNodeById(nodes, route.houseNodeId);
    const targetCoordinate = Number(anchorNode?.[axis]);
    if (!anchorNode || !houseNode || !Number.isFinite(targetCoordinate)) return;

    houseNode[axis] = targetCoordinate;
    houseNode.sx = targetCoordinate;
    alignedRoutes.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate
    }));
  });

  const partnershipRouteGroups = new Map();
  (plan?.partnershipRoutes || []).forEach(route => {
    const houseNode = displayedNodeById(nodes, route.houseNodeId);
    const {
      parentNodes,
      displayedParentNodeIds
    } = displayedPartnershipParentNodes(nodes, houseNode, route);
    const parentCoordinates = parentNodes
      .map(parentNode => Number(parentNode?.[axis]))
      .filter(Number.isFinite);
    if (!houseNode || parentNodes.length !== 2 || parentCoordinates.length !== 2) return;

    const groupKey = [...displayedParentNodeIds].sort().join('\u001f');
    const group = partnershipRouteGroups.get(groupKey) || [];
    group.push({
      route,
      houseNode,
      parentCoordinates,
      displayedParentNodeIds
    });
    partnershipRouteGroups.set(groupKey, group);
  });

  partnershipRouteGroups.forEach(group => {
    const pairCenter = (
      group[0].parentCoordinates[0] + group[0].parentCoordinates[1]
    ) / 2;
    const step = cardStepForAxis(axis);
    const middleIndex = (group.length - 1) / 2;

    // Mehrere Hausknoten derselben Elternschaft (etwa zwei parallel
    // entstehende Bruderhäuser) dürfen nicht dieselbe Koordinate erhalten.
    // Einzelne Wegverheiratet-Knoten bleiben weiterhin exakt senkrecht unter
    // dem Ehepaar; nur eine tatsächlich mehrfache Zielgruppe wird symmetrisch
    // und mit genau einem Kartenabstand aufgefächert.
    const sortedGroup = [...group]
      .sort((first, second) => first.route.branchId.localeCompare(second.route.branchId, 'de'));
    const straightTypePriority = new Map([
      ['married-away', 0],
      ['ward-away', 1],
      ['cadet-house', 2]
    ]);
    const straightEntry = [...sortedGroup]
      .filter(entry => straightTypePriority.has(entry.route.linkType))
      .sort((first, second) => (
        straightTypePriority.get(first.route.linkType)
        - straightTypePriority.get(second.route.linkType)
      ))[0];
    const straightRouteIndex = straightEntry ? sortedGroup.indexOf(straightEntry) : -1;
    const orderedGroup = straightRouteIndex >= 0
      ? [
          sortedGroup[straightRouteIndex],
          ...sortedGroup.filter((entry, index) => index !== straightRouteIndex)
        ]
      : sortedGroup;

    orderedGroup.forEach((entry, index) => {
        const slotOffset = straightRouteIndex >= 0
          ? index === 0
            ? 0
            : Math.ceil(index / 2) * (index % 2 === 1 ? -1 : 1)
          : index - middleIndex;
        const targetCoordinate = pairCenter + (slotOffset * step);
        entry.houseNode[axis] = targetCoordinate;
        entry.houseNode.sx = targetCoordinate;
        alignedPartnershipRoutes.push(Object.freeze({
          ...entry.route,
          axis,
          targetCoordinate,
          displayedParentNodeIds: Object.freeze(entry.displayedParentNodeIds),
          sharedParentTargetCount: group.length
        }));
      });
  });

  return Object.freeze({
    alignedRoutes: Object.freeze(alignedRoutes),
    alignedPartnershipRoutes: Object.freeze(alignedPartnershipRoutes),
    // Compatibility field for consumers that still display the old
    // diagnostics. House nodes no longer escape downward through several
    // generations; actual card collisions are handled once by the final
    // branch-aware spacing guard.
    collisionResolutions: Object.freeze([])
  });
}

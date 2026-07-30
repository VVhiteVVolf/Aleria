function configuredPartnerId(partnership) {
  const value = partnership?.extensions?.chartAlignPartnerOverChildrenPersonId;
  return typeof value === 'string' ? value.trim() : '';
}

export function createFamilyChartPartnerAlignmentPlan(family) {
  const routes = [];
  const invalidRequests = [];

  (family?.partnerships || []).forEach(partnership => {
    const partnerPersonId = configuredPartnerId(partnership);
    if (!partnerPersonId) return;

    const childIds = (family.parentages || [])
      .filter(parentage => parentage.partnershipId === partnership.id)
      .map(parentage => parentage.childId);
    if (!partnership.participantIds.includes(partnerPersonId) || !childIds.length) {
      invalidRequests.push(Object.freeze({
        partnershipId: partnership.id,
        partnerPersonId,
        childIds: Object.freeze([...childIds])
      }));
      return;
    }

    routes.push(Object.freeze({
      partnershipId: partnership.id,
      partnerPersonId,
      childIds: Object.freeze([...new Set(childIds)])
    }));
  });

  return Object.freeze({
    routes: Object.freeze(routes),
    invalidRequests: Object.freeze(invalidRequests)
  });
}

function displayedNodeById(nodes, personId, { partnerCard = false } = {}) {
  const candidates = nodes.filter(node => node?.data?.id === personId);
  if (partnerCard) return candidates.find(node => node.spouse) || null;
  return candidates.find(node => !node.spouse) || candidates[0] || null;
}

function centeredCoordinate(nodes, axis) {
  const coordinates = nodes
    .map(node => Number(node?.[axis]))
    .filter(Number.isFinite);
  if (!coordinates.length) return null;
  return (Math.min(...coordinates) + Math.max(...coordinates)) / 2;
}

export function alignFamilyChartPartnersOverChildren({ tree, plan, orientation = 'vertical' }) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const appliedRoutes = [];

  (plan?.routes || []).forEach(route => {
    const partnerNode = displayedNodeById(nodes, route.partnerPersonId, { partnerCard: true });
    const childNodes = route.childIds
      .map(childId => displayedNodeById(nodes, childId))
      .filter(Boolean);
    const targetCoordinate = centeredCoordinate(childNodes, axis);
    if (!partnerNode || targetCoordinate === null) return;

    partnerNode[axis] = targetCoordinate;
    // Family Chart verwendet `sx` als Ansatzpunkt der Nachkommenlinie – in
    // vertikaler wie horizontaler Ausrichtung entlang derselben Querachse.
    partnerNode.sx = targetCoordinate;
    appliedRoutes.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate
    }));
  });

  return Object.freeze(appliedRoutes);
}

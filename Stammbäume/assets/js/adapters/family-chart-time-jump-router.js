const SERIAL_PREDECESSOR_KINDS = new Set(['house-crest']);
const TERMINAL_ATTACHMENT_KINDS = new Set(['cadet-house', 'line-end']);

function addUnique(target, value) {
  if (value && !target.includes(value)) target.push(value);
}

function removeValue(target, value) {
  const index = target.indexOf(value);
  if (index >= 0) target.splice(index, 1);
}

function findSerialPredecessor(chartById, parentIds, sourcePartnershipId) {
  return [...chartById.values()].find(node => (
    SERIAL_PREDECESSOR_KINDS.has(node.data?.nodeKind)
    && node.data?.aleria?.sourcePartnershipId === sourcePartnershipId
    && parentIds.every(parentId => node.rels.parents.includes(parentId))
  )) || null;
}

function detachExistingBarrier(chartById, barrierNode) {
  const existing = chartById.get(barrierNode.id);
  if (!existing) return;
  const previousParents = [...existing.rels.parents];
  const previousChildren = [...existing.rels.children];
  previousParents.forEach(parentId => removeValue(chartById.get(parentId)?.rels?.children || [], existing.id));
  previousChildren.forEach(childId => {
    const child = chartById.get(childId);
    if (!child) return;
    removeValue(child.rels.parents, existing.id);
    previousParents.forEach(parentId => {
      addUnique(child.rels.parents, parentId);
      addUnique(chartById.get(parentId)?.rels?.children || [], childId);
    });
  });
  chartById.delete(existing.id);
}

function computeNodeDepths(chartById) {
  const componentParent = new Map([...chartById.keys()].map(id => [id, id]));
  function find(nodeId) {
    const parentId = componentParent.get(nodeId);
    if (!parentId || parentId === nodeId) return nodeId;
    const rootId = find(parentId);
    componentParent.set(nodeId, rootId);
    return rootId;
  }
  function union(firstId, secondId) {
    if (!componentParent.has(firstId) || !componentParent.has(secondId)) return;
    const firstRoot = find(firstId);
    const secondRoot = find(secondId);
    if (firstRoot !== secondRoot) componentParent.set(secondRoot, firstRoot);
  }
  chartById.forEach(node => node.rels.spouses.forEach(spouseId => union(node.id, spouseId)));

  const componentDepths = new Map([...chartById.keys()].map(id => find(id)).map(id => [id, 0]));
  const componentEdges = [];
  chartById.forEach(node => {
    const childComponent = find(node.id);
    node.rels.parents.forEach(parentId => {
      if (!chartById.has(parentId)) return;
      const parentComponent = find(parentId);
      if (parentComponent !== childComponent) componentEdges.push([parentComponent, childComponent]);
    });
  });
  const maximumPasses = Math.max(1, componentDepths.size);
  for (let pass = 0; pass < maximumPasses; pass += 1) {
    let changed = false;
    componentEdges.forEach(([parentComponent, childComponent]) => {
      const nextDepth = componentDepths.get(parentComponent) + 1;
      if (nextDepth > componentDepths.get(childComponent)) {
        componentDepths.set(childComponent, nextDepth);
        changed = true;
      }
    });
    if (!changed) break;
  }
  return new Map([...chartById.keys()].map(id => [id, componentDepths.get(find(id)) || 0]));
}

/**
 * Zeitsprünge sind keine parallelen Seitenäste, sondern globale serielle
 * Barrieren. Existiert bereits ein Stammwappen, beginnt der Schnitt darunter.
 * Anschließend werden sämtliche genealogischen Fortsetzungen der nächsten
 * Diagrammebene durch genau diesen Trenner geführt. Hausmedaillons und
 * Linienenden bleiben dagegen als terminale Anhänge direkt an ihrem
 * Gründerpaar; sie sind keine neue Generation.
 */
export function insertTimeJumpAsSerialBarrier({
  chartById,
  timeJumpNode,
  layoutStageNode = null,
  parentIds,
  sourcePartnershipId = '',
  declaredChildIds = []
}) {
  detachExistingBarrier(chartById, timeJumpNode);
  const predecessor = sourcePartnershipId
    ? findSerialPredecessor(chartById, parentIds, sourcePartnershipId)
    : null;
  const serialParentIds = predecessor ? [predecessor.id] : [...parentIds];
  const depths = computeNodeDepths(chartById);
  const anchorDepth = Math.max(0, ...serialParentIds.map(parentId => depths.get(parentId) || 0));
  const declaredContinuationIds = new Set(declaredChildIds);
  // Hinter einer echten Überlieferungslücke besitzen die ausdrücklich
  // benannten ersten Personen häufig absichtlich keine biologischen Eltern.
  // Ihre vorläufige Diagrammtiefe ist dann 0 und darf nicht dazu führen, dass
  // bereits korrekt verknüpfte Enkel auf die Ebene des Zeitsprungs hochgezogen
  // werden. In diesem Fall sind ausschließlich die deklarierten Wurzeln die
  // Fortsetzung; ihre späteren Generationen behalten ihre realen Elternpfade.
  const hasDetachedDeclaredRoots = declaredChildIds.length > 0 && declaredChildIds.every(childId => {
    const child = chartById.get(childId);
    return child && child.rels.parents.length === 0;
  });
  const inferredContinuationIds = hasDetachedDeclaredRoots
    ? []
    : [...chartById.values()]
      .filter(node => (
        !serialParentIds.includes(node.id)
        && depths.get(node.id) === anchorDepth + 1
        && !TERMINAL_ATTACHMENT_KINDS.has(node.data?.nodeKind)
        && (node.rels.parents.length > 0 || declaredContinuationIds.has(node.id))
      ))
      .map(node => node.id);
  const continuationIds = new Set(inferredContinuationIds);

  const terminalAttachmentIds = hasDetachedDeclaredRoots
    ? []
    : [...chartById.values()]
      .filter(node => (
        depths.get(node.id) === anchorDepth + 1
        && TERMINAL_ATTACHMENT_KINDS.has(node.data?.nodeKind)
      ))
      .map(node => node.id);

  declaredChildIds
    .filter(childId => {
      const child = chartById.get(childId);
      return child && !TERMINAL_ATTACHMENT_KINDS.has(child.data?.nodeKind);
    })
    .forEach(childId => continuationIds.add(childId));

  // Family Chart bildet eine genealogische Hierarchie ab und darf deshalb an
  // einem Knoten höchstens das deklarierte Elternpaar sehen. Weitere Paare der
  // gleichen Generation gehören zwar vor denselben globalen Trenner, werden
  // aber nicht zu zusätzlichen Eltern des Trenners: Mehrere eingehende
  // Elternpfade ließen die Bibliothek den gesamten Folgebaum je Pfad erneut
  // materialisieren.
  const usesLayoutStage = Boolean(layoutStageNode && terminalAttachmentIds.length);
  if (usesLayoutStage) {
    layoutStageNode.rels.parents = [...serialParentIds];
    layoutStageNode.rels.children = [timeJumpNode.id];
    chartById.set(layoutStageNode.id, layoutStageNode);
  }
  const barrierParentIds = new Set(usesLayoutStage ? [layoutStageNode.id] : serialParentIds);

  timeJumpNode.rels.parents = [...barrierParentIds];
  timeJumpNode.rels.children = [];
  chartById.set(timeJumpNode.id, timeJumpNode);

  continuationIds.forEach(childId => {
    const child = chartById.get(childId);
    if (!child) return;
    child.rels.parents.forEach(oldParentId => {
      removeValue(chartById.get(oldParentId)?.rels?.children || [], childId);
    });
    child.rels.parents = [timeJumpNode.id];
    addUnique(timeJumpNode.rels.children, childId);
  });

  serialParentIds.forEach(parentId => {
    const parent = chartById.get(parentId);
    if (!parent) return;
    continuationIds.forEach(childId => removeValue(parent.rels.children, childId));
    addUnique(parent.rels.children, usesLayoutStage ? layoutStageNode.id : timeJumpNode.id);
  });

  return Object.freeze({
    predecessorId: predecessor?.id || '',
    stageId: usesLayoutStage ? layoutStageNode.id : '',
    anchorDepth,
    parentIds: Object.freeze([...barrierParentIds]),
    terminalAttachmentIds: Object.freeze(terminalAttachmentIds),
    continuationIds: Object.freeze([...continuationIds])
  });
}

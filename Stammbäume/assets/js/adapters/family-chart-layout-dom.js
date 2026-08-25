export function familyChartHierarchyNodeCenter(hierarchyNode) {
  const x = Number(hierarchyNode?.x);
  const y = Number(hierarchyNode?.y);
  // Family Chart treats x/y as the visual anchor of a card. The actual card
  // artwork is centred around this point and may overflow its .card_cont
  // element. Adding half a nominal person-card size here therefore shifts
  // compact crest cards and every synthetic house link to the lower right.
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function familyChartCardPoint(cardContainer) {
  const hierarchyPoint = familyChartHierarchyNodeCenter(cardContainer?.__data__);
  if (hierarchyPoint) return hierarchyPoint;

  const match = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(cardContainer?.style?.transform || '');
  if (!match) return null;
  const parsedX = Number(match[1]);
  const parsedY = Number(match[2]);
  return Number.isFinite(parsedX) && Number.isFinite(parsedY)
    ? { x: parsedX, y: parsedY }
    : null;
}

function familyChartCardId(cardContainer) {
  const hierarchyNode = cardContainer?.__data__;
  return hierarchyNode?.data?.id
    || cardContainer?.querySelector?.('[data-id]')?.dataset.id
    || '';
}

export function collectFamilyChartCardPositions(container) {
  const positions = new Map();
  container?.querySelectorAll?.('.card_cont')?.forEach(cardContainer => {
    const cardId = familyChartCardId(cardContainer);
    const point = familyChartCardPoint(cardContainer);
    if (cardId && point) positions.set(cardId, point);
  });
  return positions;
}

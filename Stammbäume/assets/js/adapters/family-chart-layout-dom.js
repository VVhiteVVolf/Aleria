function familyChartCardPoint(cardContainer) {
  const hierarchyNode = cardContainer?.__data__;
  const x = Number(hierarchyNode?.x);
  const y = Number(hierarchyNode?.y);
  if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };

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

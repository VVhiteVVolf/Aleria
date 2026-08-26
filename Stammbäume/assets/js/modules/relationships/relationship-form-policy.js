const PARENTAGE_DIRECTIONS = new Set(['reference-is-child', 'reference-is-parent']);

export function resolveParentageSelection({
  referencePersonId,
  otherPersonId,
  direction,
  secondParentId = ''
}) {
  if (!referencePersonId || !otherPersonId) {
    throw new Error('Für eine Elternverknüpfung werden zwei Personen benötigt.');
  }
  if (!PARENTAGE_DIRECTIONS.has(direction)) {
    throw new Error('Die Richtung der Elternverknüpfung ist ungültig.');
  }

  const childId = direction === 'reference-is-child' ? referencePersonId : otherPersonId;
  const primaryParentId = direction === 'reference-is-child' ? otherPersonId : referencePersonId;
  const unavailableSecondParentIds = new Set([childId, primaryParentId]);
  const validSecondParentId = unavailableSecondParentIds.has(secondParentId) ? '' : secondParentId;

  return Object.freeze({
    childId,
    primaryParentId,
    secondParentId: validSecondParentId,
    parentIds: Object.freeze([...new Set([primaryParentId, validSecondParentId].filter(Boolean))]),
    unavailableSecondParentIds: Object.freeze([...unavailableSecondParentIds])
  });
}

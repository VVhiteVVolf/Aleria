const FAMILY_WORKSPACE_DOCUMENT = 'Stammbaum.html';

export function createFamilyViewLink(familyId = '') {
  const normalizedId = String(familyId || '').trim();
  const familyQuery = normalizedId ? `family=${encodeURIComponent(normalizedId)}&` : '';
  return `${FAMILY_WORKSPACE_DOCUMENT}?${familyQuery}mode=view`;
}

export function normalizeFamilyViewLink(_value, familyId = '') {
  // Registry links are navigation data, not trusted destinations. Even a valid
  // legacy link is reduced to the canonical local workspace route so that old
  // Firebase records cannot revive removed entry files or external protocols.
  return createFamilyViewLink(familyId);
}

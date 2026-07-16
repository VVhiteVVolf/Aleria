const FAMILY_WORKSPACE_DOCUMENT = 'Stammbaum.html';

export function createFamilyViewLink(familyId = '', personId = '') {
  const normalizedId = String(familyId || '').trim();
  const query = new URLSearchParams();
  if (normalizedId) query.set('family', normalizedId);
  query.set('mode', 'view');
  if (String(personId || '').trim()) query.set('person', String(personId).trim());
  return `${FAMILY_WORKSPACE_DOCUMENT}?${query.toString()}`;
}

export function normalizeFamilyViewLink(_value, familyId = '') {
  // Registry links are navigation data, not trusted destinations. Even a valid
  // legacy link is reduced to the canonical local workspace route so that old
  // Firebase records cannot revive removed entry files or external protocols.
  return createFamilyViewLink(familyId);
}

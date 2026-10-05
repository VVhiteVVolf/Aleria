import { queryRegister, categoryLabel } from '../item-register/item-register-model.js?v=20260928-equipment-art-v4';

// Read the shared register through its public facade, never through Firebase.
export function groupRegisterSnapshot() {
  const register = globalThis.AleriaItemRegister;
  const snapshot = register?.store?.snapshot?.();
  return snapshot || { items: register?.getItems?.() || [], status: 'loading' };
}

export function groupCatalogItems(snapshot = groupRegisterSnapshot(), filters = {}) {
  const browsing = filters.category || filters.search?.trim();
  return ['standard', 'offer'].filter(section => !filters.section || section === filters.section)
    .flatMap(section => browsing ? queryRegister(snapshot.items || [], { ...filters, section })
      : (snapshot.items || []).filter(item => item.section === section && !item.archived))
    .sort((left, right) => left.title.localeCompare(right.title, 'de'));
}

export function groupPersonalItems(members, snapshot = groupRegisterSnapshot()) {
  const owners = new Set(members.filter(member => member.assignment === 'active').map(member => member.characterId).filter(Boolean));
  return (snapshot.items || []).filter(item => item.section === 'owned' && owners.has(item.ownerCharacterId));
}

export function groupItemPrice(item) {
  return globalThis.AleriaItemRegister?.formatPrice?.(item) || 'Preis offen';
}

export { categoryLabel };

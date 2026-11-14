import { getRegisteredFamily } from '../../data/families.registry.js?v=20261104-content-lore-v1';

export function resolveProjectFamilyOrigin(familyId) {
  return getRegisteredFamily(String(familyId || ''))?.family || null;
}

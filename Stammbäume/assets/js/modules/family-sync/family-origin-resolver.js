import { getRegisteredFamily } from '../../data/families.registry.js?v=20261021-arvel-v3';

export function resolveProjectFamilyOrigin(familyId) {
  return getRegisteredFamily(String(familyId || ''))?.family || null;
}

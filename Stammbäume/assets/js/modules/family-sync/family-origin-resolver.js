import { getRegisteredFamily } from '../../data/families.registry.js?v=20261103-vennyr-warriors-v1';

export function resolveProjectFamilyOrigin(familyId) {
  return getRegisteredFamily(String(familyId || ''))?.family || null;
}

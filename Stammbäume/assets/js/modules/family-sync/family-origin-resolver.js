import { getRegisteredFamily } from '../../data/families.registry.js?v=20261014-kanne-v2';

export function resolveProjectFamilyOrigin(familyId) {
  return getRegisteredFamily(String(familyId || ''))?.family || null;
}

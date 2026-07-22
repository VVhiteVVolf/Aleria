import { getRegisteredFamily } from '../../data/families.registry.js';

export function resolveProjectFamilyOrigin(familyId) {
  return getRegisteredFamily(String(familyId || ''))?.family || null;
}

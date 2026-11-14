import { getRegisteredFamily } from '../../data/families.registry.js?v=20261114-einion-v1';

export function resolveProjectFamilyOrigin(familyId) {
  return getRegisteredFamily(String(familyId || ''))?.family || null;
}

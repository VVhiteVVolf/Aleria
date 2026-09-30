import { isDeepStrictEqual } from 'node:util';
import { getAutofilledCenyrCombatProfile } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { JUNGDRACHE_SHARED_TECHNIQUES } from '../../../AleriaAlmanach/modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js';

// Only arsenal/training fields are revised; live HP, uses, inventory and scene history are untouched.
export function planJungdracheRelease(character) {
  const before = character.combatProfile;
  if (!before) return null;
  const after = getAutofilledCenyrCombatProfile(before);
  const shared = new Set(JUNGDRACHE_SHARED_TECHNIQUES.map(t => t.id));
  if (!after.techniques?.some(t => shared.has(t.id))) return null;
  const patch = {};
  for (const field of ['techniques', 'classTraining']) {
    if (after[field] !== undefined && !isDeepStrictEqual(before[field], after[field])) patch[`combatProfile.${field}`] = after[field];
  }
  return Object.keys(patch).length ? patch : null;
}

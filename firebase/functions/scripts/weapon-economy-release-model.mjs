import { isDeepStrictEqual } from 'node:util';
import { getAutofilledCenyrCombatProfile } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { reconcileClassDamageRevisions } from '../../../AleriaAlmanach/modules/classes/class-damage-revisions.js';
import { reconcileFrekiTechniques } from '../../../AleriaAlmanach/modules/creatures/catalog/freki-actions.js';

// Field-level release only. Never persist a fully sanitized battle profile:
// that could refill actions or replace live hit points, conditions or uses.
export function planWeaponEconomyRelease(record = {}) {
  const before = record.combatProfile;
  if (!before) return null;
  const after = getAutofilledCenyrCombatProfile(reconcileFrekiTechniques(reconcileClassDamageRevisions(before)));
  const patch = {};
  for (const field of ['techniques', 'classTraining']) {
    if (after[field] !== undefined && !isDeepStrictEqual(before[field], after[field])) patch[`combatProfile.${field}`] = after[field];
  }
  return Object.keys(patch).length ? patch : null;
}

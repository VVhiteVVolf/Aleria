import { isDeepStrictEqual } from 'node:util';
import { getAutofilledCenyrCombatProfile } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { getClassSpecialCurriculum, reconcileClassSpecialManeuvers } from '../../../AleriaAlmanach/modules/classes/class-special-maneuvers.js';
import { reconcileSkjaldrCombatProfile } from '../../../AleriaAlmanach/modules/classes/aldrimar/skjaldr-combat-profile.js';
import { reconcileClassDamageRevisions } from '../../../AleriaAlmanach/modules/classes/class-damage-revisions.js';

// Deliberately returns a field patch, never a replacement character document.
// The caller must use the read document's updateTime as a write precondition.
export function planCharacterArsenalRelease(character) {
  const before = character.combatProfile;
  if (!before || !getClassSpecialCurriculum(before.templateSelections?.classId || before.identity?.archetype || before.identity?.className)) return null;
  const after = reconcileClassSpecialManeuvers(reconcileSkjaldrCombatProfile(reconcileClassDamageRevisions(getAutofilledCenyrCombatProfile(before))));
  const patch = {};
  for (const field of ['techniques', 'abilities', 'classTraining']) {
    if (after[field] !== undefined && !isDeepStrictEqual(before[field], after[field])) patch[`combatProfile.${field}`] = after[field];
  }
  return Object.keys(patch).length ? patch : null;
}

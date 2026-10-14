import { isDeepStrictEqual } from 'node:util';
import { getAutofilledCenyrCombatProfile } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { addYlvaDuelTechniques, YLVA_DUEL_OWNER_ID } from '../../../AleriaAlmanach/modules/characters/personal-techniques/ylva-duel-techniques.js';
import { addGaisDuelTechniques } from '../../../AleriaAlmanach/modules/characters/personal-techniques/gais-duel-techniques.js';
import { JUNGDRACHE_SHARED_TECHNIQUES } from '../../../AleriaAlmanach/modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js';

const sharedIds = new Set(JUNGDRACHE_SHARED_TECHNIQUES.map(t => t.id));

// Refresh only owned, affected canonical techniques. Historical result/condition
// snapshots, use counters and all live pools are outside this release's ownership.
export function planMartialControlRelease(character) {
  const before = character.combatProfile;
  if (!before || !Array.isArray(before.techniques)) return null;
  const canonical = getAutofilledCenyrCombatProfile(before);
  const replacements = new Map((canonical.techniques || []).filter(t => sharedIds.has(t.id)
    || t.cenyrTraining?.allowedClassIds?.some(id => ['cantref', 'uchelwyr'].includes(id))).map(t => [t.id, t]));
  let revised = { ...character, combatProfile: { ...before,
    techniques: (before.techniques || []).map(t => replacements.get(t.id) || t) } };
  if (character.id === YLVA_DUEL_OWNER_ID) revised = addYlvaDuelTechniques(revised);
  revised = addGaisDuelTechniques(revised);
  return isDeepStrictEqual(before.techniques, revised.combatProfile.techniques) ? null
    : { 'combatProfile.techniques': revised.combatProfile.techniques };
}

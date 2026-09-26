import { isDeepStrictEqual } from 'node:util';
import { reconcileMartialRecovery } from '../../../AleriaAlmanach/modules/classes/martial-recovery.js';
import { applyWolfshornTraining, WOLFSHORN_IDS } from '../../../AleriaAlmanach/modules/classes/aldrimar/wolfshorn-personal-training.js';
import { upgradeWolfshornEquipment } from '../../../AleriaAlmanach/modules/classes/aldrimar/wolfshorn-equipment.js';
import { getMaximumHitPoints } from '../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { preserveHitPointDeficit } from '../../../AleriaAlmanach/modules/combat/combat-hit-point-progression.js';
import { synchronizeEquipmentFromCombat } from '../../../AleriaAlmanach/modules/character-equipment/character-equipment-sync.js';

export function planWolfshornRecoveryRelease(character) {
  if (!character.combatProfile) return null;
  const before = character.combatProfile;
  let after = reconcileMartialRecovery(before);
  const kind = Object.keys(WOLFSHORN_IDS).find(key => WOLFSHORN_IDS[key] === character.id);
  let inventory = character.inventory;
  if (kind) {
    const previousMaximum = getMaximumHitPoints(before);
    const alreadyGranted = before.abilities?.some(a => a.id === `wolfshorn-${kind}-border-veteran`);
    after = upgradeWolfshornEquipment(applyWolfshornTraining(after, kind), kind);
    if (!alreadyGranted && before.hitPoints.maximumOverride != null) {
      after.hitPoints = { ...before.hitPoints, maximumOverride: before.hitPoints.maximumOverride + (kind === 'ylva' ? 20 : 14) };
    }
    after.hitPoints = { ...after.hitPoints, current: preserveHitPointDeficit(before.hitPoints.current, previousMaximum, getMaximumHitPoints(after)) };
    const synced = synchronizeEquipmentFromCombat({ inventory, combatProfile: after, characterId: character.id, characterName: character.name });
    inventory = synced.inventory;
    after = synced.combatProfile;
  }
  const patch = {};
  for (const key of ['abilities', 'techniques', 'weapons', 'armorItems', 'hitPoints', 'resources']) {
    if (after[key] !== undefined && !isDeepStrictEqual(before[key], after[key])) patch[`combatProfile.${key}`] = after[key];
  }
  if (!isDeepStrictEqual(character.inventory, inventory)) patch.inventory = inventory;
  return Object.keys(patch).length ? patch : null;
}

export function applyCharacterFieldPatch(character, patch) {
  const result = structuredClone(character);
  for (const [path, value] of Object.entries(patch || {})) {
    if (path.startsWith('combatProfile.')) result.combatProfile[path.slice(14)] = value;
    else result[path] = value;
  }
  return result;
}

import { isDeepStrictEqual } from 'node:util';
import { applyArmorBalance, balanceArmorInventoryItem } from '../../../AleriaAlmanach/modules/character-equipment/equipment-armor-rules.js';
import { reconcileMartialPositionEffects } from '../../../AleriaAlmanach/modules/combat-styles/martial-position-effects.js';
import { getAutofilledCenyrCombatProfile } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-combat-profile-autofill.js';
import { synchronizeEquipmentFromCombat } from '../../../AleriaAlmanach/modules/character-equipment/character-equipment-sync.js';
import { getMaximumHitPoints, setCharacterHitPointMaximum } from '../../../AleriaAlmanach/modules/combat/combat-profile-model.js';

// Narrow, idempotent release. Keep current HP, conditions, uses, resources and ownership intact.
export function planDefenseBalanceRelease(record = {}) {
  const before = record.combatProfile;
  if (!before) return null;
  const after = reconcileMartialPositionEffects(getAutofilledCenyrCombatProfile(structuredClone(before)));
  after.armorItems = before.armorItems?.map(applyArmorBalance);
  if (after.armorItems?.some(armor => ['ylva-leder', 'freya-padded-armor'].includes(armor.id))) {
    after.proficiencies = { ...before.proficiencies, armor: [...new Set([...(before.proficiencies?.armor || []), 'medium'])] };
  }
  if ((record.id === 'y7MBxDiAaesbWHBtmw5Q' || record.name === 'Rhiannon Draig')
      && !before.defenseBalanceVersion && getMaximumHitPoints(before) < 35) {
    setCharacterHitPointMaximum(after, 35);
  }
  const patch = {};
  for (const key of ['armorItems', 'weapons', 'abilities', 'techniques', 'classTraining', 'hitPoints', 'proficiencies']) {
    if (after[key] !== undefined && !isDeepStrictEqual(before[key], after[key])) patch[`combatProfile.${key}`] = after[key];
  }
  if (record.inventory?.items?.length) {
    const synced = synchronizeEquipmentFromCombat({ inventory: record.inventory, combatProfile: after,
      characterId: record.id, characterName: record.name }).inventory;
    // Existing owned items only. Never materialize inferred equipment as new possessions in a release.
    const items = record.inventory.items.map(item => balanceArmorInventoryItem(synced.items.find(candidate => candidate.id === item.id) || item));
    if (!isDeepStrictEqual(items, record.inventory.items)) patch.inventory = { ...record.inventory, items };
  }
  if (!Object.keys(patch).length) return null;
  patch['combatProfile.defenseBalanceVersion'] = 1;
  return patch;
}

import { applyCombatResourceCosts } from './combat-state-model.js';
import { getCombatWeaponLoadout, normalizeCombatLoadout, validateCombatLoadout, usesCharacterWeaponLoadout } from './combat-weapon-loadout.js';
import { withEquippedCombatWeapon } from './combat-equipment-state.js';

export function prepareCombatEquipment(character, requested, { free = false } = {}) {
  // A creature's named attacks are validated against its authoritative sheet.
  // They are not the character inventory's left/right hand loadout.
  if (!usesCharacterWeaponLoadout(character)) return { character, preparation: null };
  const loadout = normalizeCombatLoadout(requested);
  if (!loadout) return { character, preparation: null };
  const profile = character.combatProfile || {};
  const before = getCombatWeaponLoadout(profile);
  const error = validateCombatLoadout(profile, loadout);
  if (error) return { character, preparation: { error, costs: [] } };
  const changed = before.rightWeaponId !== loadout.rightWeaponId || before.leftWeaponId !== loadout.leftWeaponId;
  if (!changed) return { character, preparation: null };
  return {
    character: withEquippedCombatWeapon(character, loadout.rightWeaponId, loadout.leftWeaponId),
    preparation: {
      before: { rightWeaponId: before.rightWeaponId, leftWeaponId: before.leftWeaponId }, after: loadout,
      free, error: '', costs: free ? [] : [{ id: 'equipment-preparation', resourceId: 'bonus-action', name: 'Bonusaktion', amount: 1, scope: 'comment' }]
    }
  };
}

export function reserveCombatEquipment(profile, preparation) {
  if (!preparation) return profile;
  const payment = applyCombatResourceCosts(profile.resources || [], preparation.costs);
  const error = preparation.error || (!payment.sufficient ? 'Für den Waffenwechsel fehlt 1 Bonusaktion. Hebe den Wechsel auf oder passe frühere Abschnitte an.' : '');
  return { ...profile, resources: error ? profile.resources : payment.after,
    equipmentPreparation: { ...preparation, error, resourcesBefore: profile.resources || [] } };
}

export function attachCombatEquipmentPreparation(resolution, actor) {
  const preparation = actor.equipmentPreparation;
  if (!preparation || preparation.error) return resolution;
  return { ...resolution,
    equipmentPreparation: { before: preparation.before, after: preparation.after, free: preparation.free, costs: preparation.costs },
    actorResourceSnapshot: { after: actor.resources, ...resolution.actorResourceSnapshot, before: preparation.resourcesBefore },
    actorEquippedWeaponSnapshot: {
      before: preparation.before.rightWeaponId, after: preparation.after.rightWeaponId,
      offHandBefore: preparation.before.leftWeaponId, offHandAfter: preparation.after.leftWeaponId
    }
  };
}

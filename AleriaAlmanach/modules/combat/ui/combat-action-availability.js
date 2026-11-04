import { validateCombatActorProfile, getCombatActorValidationMessage } from '../combat-profile-resolver.js';
import { applyCombatAbilityUse } from '../combat-ability-uses.js';
import { getActionPaymentCosts, canUseAuraPayment, canUseManaSubstitutePayment } from '../combat-action-economy.js';
import { applyCombatResourceCosts } from '../combat-state-model.js';
import { withCombatActionWeaponAvailability } from '../combat-weapon-availability.js';

const paymentNames = { standard: 'Regulär', aura: 'Aura-Fokus', 'mana-substitute': 'Mana ersetzen', cheat: 'Spielleiter-Cheat' };

// A read-only projection of the same validators and cost bundles as the composer.
// A failed ordinary payment does not hide an available authorized alternative.
export function getCombatActionAvailability(profile = {}, storedAction = {}) {
  const action = withCombatActionWeaponAvailability(profile, storedAction);
  const selected = { ...profile, selectedAction: action, profileActionId: action.id,
    profileActionKind: action.kind, weapon: action.weapon || profile.weapon,
    weaponUnavailable: action.id === profile.profileActionId ? profile.weaponUnavailable : false };
  const validation = validateCombatActorProfile(selected);
  if (!validation.ready) return { available: false, reason: getCombatActorValidationMessage(selected, validation), action };
  const ability = applyCombatAbilityUse(profile.abilities, action.id);
  if (!ability.sufficient) return { available: false, reason: `Keine Nutzung von ${ability.missing.name} mehr übrig.`, action };
  const modes = profile.cheats?.enabled ? ['cheat'] : ['standard', ...(canUseAuraPayment(action, profile) ? ['aura'] : []),
    ...(canUseManaSubstitutePayment(action, profile) ? ['mana-substitute'] : [])];
  const payments = modes.map(mode => ({ mode, result: applyCombatResourceCosts(profile.resources, getActionPaymentCosts(action, mode, profile)) }));
  const possible = payments.find(payment => payment.result.sufficient);
  if (possible) return { available: true, reason: possible.mode === 'standard' ? 'Verfügbar' : `Verfügbar mit ${paymentNames[possible.mode]}`,
    paymentMode: possible.mode, action };
  const missing = payments[0]?.result.missing;
  const current = (profile.resources || []).find(resource => resource.id === missing?.resourceId)?.current || 0;
  return { available: false, reason: `Nicht genug ${missing?.name || 'Ressourcen'}${missing ? ` (${current}/${missing.amount})` : ''}.`, action };
}

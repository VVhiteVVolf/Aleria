import { COMBAT_ACTIVATION_TYPES, getDefaultActivationCosts } from '../../combat/combat-action-economy.js';

// Authored packages follow docs/combat/SPELL_ACTION_ECONOMY.md. Mana and
// additional usage limits remain separate from these action resources.
export const RHIANNON_SPELL_ACTION_COSTS = Object.freeze(Object.fromEntries(Object.entries({
  'rhiannon-magierhand': ['action', 'bonus-action'],
  'rhiannon-licht': ['bonus-action'],
  'rhiannon-taschenspielerei': ['bonus-action'],
  'rhiannon-telepathische-botschaft': ['bonus-action'],
  'rhiannon-kleine-illusion': ['action', 'bonus-action'],
  'rhiannon-magierruestung': ['action', 'reaction'],
  'rhiannon-schild': ['reaction'],
  'rhiannon-magisches-geschoss': ['action', 'bonus-action'],
  'rhiannon-federfall': ['reaction'],
  'rhiannon-identifizieren': ['action'],
  'rhiannon-magie-entdecken': ['action'],
  'rhiannon-windklinge': ['action'],
  'rhiannon-druckstoss': ['reaction', 'bonus-action'],
  'rhiannon-nebelschritt': ['bonus-action'],
  'rhiannon-spiegelbilder': ['action', 'reaction'],
  'rhiannon-person-festhalten': ['action', 'special-action'],
  'rhiannon-gedanken-wahrnehmen': ['action'],
  'rhiannon-sichelwind': ['action', 'reaction'],
  'rhiannon-berstende-boe': ['action', 'reaction', 'bonus-action'],
  'rhiannon-gegenzauber': ['reaction', 'bonus-action'],
  'rhiannon-magie-bannen': ['action', 'reaction'],
  'rhiannon-hundert-klingen-sturm': ['action', 'special-action', 'reaction'],
  'rhiannon-blitzfunken': ['action', 'special-action']
}).map(([id, actions]) => [id, Object.freeze(actions)])));

const ACTION_RESOURCE_IDS = new Set(COMBAT_ACTIVATION_TYPES.map(type => type.resourceId).filter(Boolean));

export function hasRhiannonSpellEconomy(spell = {}) {
  return Object.hasOwn(RHIANNON_SPELL_ACTION_COSTS, spell?.id);
}

export function reconcileRhiannonSpellEconomy(spell = {}) {
  if (!hasRhiannonSpellEconomy(spell)) return spell;
  const actions = RHIANNON_SPELL_ACTION_COSTS[spell.id];
  const additionalCosts = (Array.isArray(spell.costs) ? spell.costs : []).filter(cost => !ACTION_RESOURCE_IDS.has(cost?.resourceId || cost?.id));
  return { ...spell, activationType: actions[0], costs: [...actions.flatMap(getDefaultActivationCosts), ...additionalCosts] };
}

import { canUseAuraPayment } from './combat-action-economy.js';
import { parseDamageFormula, combineDamageFormulas } from './rules/combat-mvp-rules.js';

// Derived after grip/cast-level selection, never stored on the character.
// Temporary rage damage and follow-up attacks do not contribute another die.
export function empowerAuraAttack(action, weapon, paymentMode, profile = {}) {
  const unchanged = { action, weapon };
  if (!action || paymentMode !== 'aura' || profile.cheats?.enabled || !canUseAuraPayment(action, profile)) return unchanged;
  const focusId = action.auraBypass?.resourceId || profile.aura?.focusResourceId || 'aura-focus';
  if (action.costs?.some(cost => [focusId, 'aura-focus'].includes(cost.resourceId) && cost.amount > 0)) return unchanged;
  const effects = action.effects || [];
  const primaryIndex = effects.findIndex(effect => effect.type === 'damage' && effect.target !== 'self'
    && !['miss', 'save-success'].includes(effect.on));
  if (effects.length && primaryIndex < 0) return unchanged;
  const primary = effects[primaryIndex];
  const formula = primary?.formula || (primary?.amount > 0 ? '' : weapon?.damageFormula);
  if (!formula) return unchanged;
  const parsed = parseDamageFormula(formula);
  const bonus = `1d${Math.max(...(parsed.terms || [parsed]).map(term => term.sides))}`;
  const empoweredFormula = combineDamageFormulas([formula, bonus]);
  const empoweredWeapon = { ...weapon, damageFormula: empoweredFormula };
  return { weapon: empoweredWeapon,
    action: { ...action, weapon: empoweredWeapon, formula: empoweredFormula, auraDamageBonus: bonus,
      mechanicNotes: [...(action.mechanicNotes || []), `Aura-Verstärkung: +${bonus.toUpperCase().replace('D', 'W')} (bereits im Schadenswurf enthalten).`],
      effects: effects.map((effect, index) => index === primaryIndex ? { ...effect, formula: empoweredFormula } : effect) }
  };
}

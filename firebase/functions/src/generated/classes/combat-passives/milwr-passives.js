import { DRACHENTANZ_FORM_IDS as D } from '../../combat-styles/drachentanz/drachentanz-ids.js';
import { SIRENENTANZ_FORM_IDS as W } from '../../combat-styles/sirenentanz/sirenentanz-forms.js';
import { canUseEquippedCombatShield, hasEquippedCombatShield } from '../../combat/combat-weapon-loadout.js';
import { activeCondition, actionProvidesGuard, trainingCondition } from './class-passive-conditions.js';
import { hasStructuredTag, isEnemy, passiveRule, passiveUsedValues, withinPosition } from './class-passive-action.js';

const GUARD = 'cp-milwr-formation';
const stanceTags = ['in-formation', 'formation', 'schildwall', 'in-der-reihe'];
const meleeWeapons = ['sword', 'spear', 'polearm', 'mace', 'axe', 'dagger'];

export function milwrPassives(context) {
  const { phase, role, level, self, state, form, style, action, primary, paid, classId, target } = context;
  if (self.combat?.mounted || !canUseEquippedCombatShield(self) || !hasEquippedCombatShield(self)) return [];
  const cenyr = classId === 'cenyr-milwr';
  if (phase === 'pre-damage' && role === 'actor' && primary && paid && style === (cenyr ? 'drachentanz' : 'sirenentanz')
    && actionProvidesGuard(action, state.hit)) {
    const veteranGuard = form === (cenyr ? D.drachling : W.militia) && state.hit;
    if (action.nonDamaging || veteranGuard) return [passiveRule(context, 'prepare', action.nonDamaging ? 5 : 8, {
      once: false, resultEffects: [trainingCondition(GUARD, 'Gehaltene Reihe', 'self', {}, 'next-start')]
    })];
  }
  if (!activeCondition(self, GUARD) || role === 'actor' || !isEnemy(context)) return [];
  const joining = role === 'support' && level >= 10 && withinPosition(context, 1.5)
    && (hasEquippedCombatShield(target) || (level >= 18 && meleeWeapons.includes(target.weapon?.weaponType)));
  const inLine = role === 'target' && hasStructuredTag(self, stanceTags);
  if (!joining && !inLine) return [];
  const signature = joining && level >= 20 ? 'ally' : 'once';
  if (passiveUsedValues(context, 'formation').includes(signature)) return [];
  if (phase === 'pre-secondary-save' && (context.save.prone || (level >= 7 && context.save.movement))) {
    const feature = joining ? (level >= 20 ? 20 : 10) : level >= 14 ? 14 : context.save.prone ? 5 : 7;
    return [passiveRule(context, 'formation', feature, {
      signature, support: joining, effects: { savingThrowModifier: joining || level < 14 ? 1 : 2 }
    })];
  }
  if (phase === 'pre-hit-damage' && joining && context.melee && state.hit) {
    return [passiveRule(context, 'formation', 16, { signature, support: true, effects: { damageReduction: 1 } })];
  }
  return [];
}

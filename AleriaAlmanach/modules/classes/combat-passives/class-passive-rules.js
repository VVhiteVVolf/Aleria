import { getTechniqueTrainingLevel } from '../../combat/combat-technique-damage.js';
import { canUseCombatReaction } from '../../combat/combat-action-permission.js';
import { getPassiveActionContext, passiveRule } from './class-passive-action.js';
import { activeCondition, CLASS_PASSIVE_POSITION_RULE } from './class-passive-conditions.js';
import { getCombatPassiveClassId } from './class-passive-curriculum.js';
import { cantrefPassives, teuluPassives } from './cenyr-line-passives.js';
import { arthwyrPassives, barddwyrPassives, helwyrPassives, uchelwyrPassives } from './cenyr-specialist-passives.js';
import { ceidwynPassives, guardsOwnMount, morwyrPassives, rhiddwyrPassives, rhyfelwyrPassives, RHIDDWYR_MOUNT_RULE } from './vennyr-weapon-passives.js';
import { milwrPassives } from './milwr-passives.js';
import { derwynPassives, derwynReturnPassives } from './derwyn-passives.js';

const RULES = new Map([
  ['teulu', teuluPassives], ['cantref', cantrefPassives], ['helwyr', helwyrPassives],
  ['uchelwyr', uchelwyrPassives], ['arthwyr', arthwyrPassives], ['barddwyr', barddwyrPassives],
  ['morwyr', morwyrPassives], ['rhyfelwyr', rhyfelwyrPassives], ['ceidwyn', ceidwynPassives],
  ['rhiddwyr', rhiddwyrPassives], ['cenyr-milwr', milwrPassives], ['vennyr-milwr', milwrPassives],
  ['derwyn', context => [...derwynPassives(context), ...derwynReturnPassives(context)]]
]);

function trainingBudgetRule(context) {
  const { phase, role, paid, primary, action, state, self } = context;
  if (phase !== 'pre-hit-damage' || role !== 'actor' || !paid || state.followUp || !state.hit
    || action.nonDamaging || getTechniqueTrainingLevel(self) < 30
    || (!action.lightAttack && Number(action.maximumTargets) <= 1)) return null;
  const area = !action.lightAttack && Number(action.maximumTargets) > 1;
  if (!primary && !area) return null;
  return passiveRule({ ...context, classId: 'technique-training',
    features: [{ minimumLevel: 30, name: 'Ausbildung · Stufe 30' }] }, 'small-damage', 30, {
    effects: { damageModifier: 1 }
  });
}

export function getClassCombatPassiveRules(input) {
  const profile = input.currentProfile || input.source.profile;
  if (!profile) return [];
  const classId = getCombatPassiveClassId(profile);
  if ((!classId || Number(profile?.progression?.level) < 5)
    && (input.phase !== 'pre-hit-damage' || getTechniqueTrainingLevel(profile) < 30)) return [];
  const context = getPassiveActionContext(input, classId);
  const classRules = context.features.length ? RULES.get(context.classId)?.(context) || [] : [];
  return [...classRules, trainingBudgetRule(context)].filter(Boolean);
}

export function getClassPassiveSupportOption(source, relationToTarget, target) {
  if (relationToTarget !== 'ally' || !canUseCombatReaction(source)) return null;
  const id = getCombatPassiveClassId(source);
  const level = Number(source.progression?.level) || 1;
  if (id === 'rhiddwyr' && level >= 16 && guardsOwnMount(source, target)) return {
    ruleId: RHIDDWYR_MOUNT_RULE, ruleName: 'Gedecktes eigenes Ross', costs: [], phaseLabel: 'Passive Deckung'
  };
  const supported = id === 'cantref' && level >= 14 && activeCondition(source, 'cp-cantref-guard')
    || ['cenyr-milwr', 'vennyr-milwr'].includes(id) && level >= 10 && activeCondition(source, 'cp-milwr-formation');
  if (!supported) return null;
  return {
    ruleId: CLASS_PASSIVE_POSITION_RULE, ruleName: 'Position zur gehaltenen Linie',
    costs: [], phaseLabel: 'Passive Deckung', supportDistance: true
  };
}

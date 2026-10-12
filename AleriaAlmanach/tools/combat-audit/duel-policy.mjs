import { getCombatDamagePreview, estimateCombatHitChance, averageDamageFormula } from '../../modules/combat/combat-action-estimates.js';
import { applyCombatAbilityUse } from '../../modules/combat/combat-ability-uses.js';
import { resolveEquipmentDamageProtection } from '../../modules/character-equipment/equipment-damage-protection.js';
import { getSavingThrowTotal } from '../../modules/combat/combat-profile-model.js';
import { resolveDuelContribution } from './duel-runtime.mjs';
import { SeededCombatDice } from '../../tests/support/combat-seeded-dice.mjs';

const ordinary = new Set(['action', 'bonus-action', 'reaction']);
const probability = (actor, target) => estimateCombatHitChance(actor, target)?.probability || 0;

function actionValue(actor, target, defenseWeight) {
  const action = actor.selectedAction, preview = getCombatDamagePreview(actor);
  const chance = preview ? probability(actor, target) : 0;
  const protection = preview ? resolveEquipmentDamageProtection(target, preview.damageType, preview.average).reduction : 0;
  const follow = action.followUpAttack;
  const attacks = follow?.enabled ? 1 + (follow.repeatCount || 1) * (follow.afterMiss ? 1 : chance) : 1;
  let value = preview ? Math.max(0, preview.average - protection) * (chance + .05) * attacks : 0;
  const missing = actor.maximumHitPoints - actor.currentHitPoints;
  for (const effect of action.effects || []) {
    const condition = effect.condition;
    if (effect.type === 'healing') value += defenseWeight * Math.min(missing, actor.hitPoints.hitDie / 2 + .5 + Math.ceil(actor.maximumHitPoints / 10));
    if (effect.type === 'temporary-hit-points') value += defenseWeight * Math.max(0, averageDamageFormula(effect.formula || '0') - actor.temporaryHitPoints);
    if (!condition) continue;
    if (condition.berserk) {
      if (actor.conditions.some(entry => entry.berserk)) return -Infinity;
      // Include the continuing benefit and cost so a one-turn ranking can consider rage.
      value += 7 - defenseWeight * 6 + (actor.currentHitPoints < 25 ? defenseWeight * 7 : 0);
    }
    if (effect.target === 'self' && condition.mechanics?.armorClass > 0) {
      const current = Math.max(0, ...actor.conditions.filter(entry => entry.armorStance).map(entry => entry.mechanics?.armorClass || 0));
      value += defenseWeight * Math.max(0, condition.mechanics.armorClass - current) * 1.25;
    }
    if (condition.damageGuard) value += defenseWeight * condition.damageGuard.reduction * .8;
    if (condition.counterAttack?.enabled) value += 5.5;
    if (condition.triggerRules?.some(rule => rule.effects?.rollMode === 'disadvantage')) value += defenseWeight * 3;
    if (condition.triggerRules?.some(rule => rule.effects?.attackModifier === -1)) value += defenseWeight * .8;
    if (condition.triggerRules?.some(rule => rule.effects?.attackModifier > 0 || rule.effects?.rollMode === 'advantage')) value += 3;
  }
  const save = action.secondarySave;
  if (save?.enabled) {
    const failureChance = Math.max(.05,Math.min(.95,(Number(save.dc || 13) - 1 - getSavingThrowTotal(target,save.attributeKey))/20));
    const condition = save.failureCondition || {};
    const prevented = { action:13, 'bonus-action':4, reaction:4 }[condition.blockedResource] || 0;
    value += chance * failureChance * (defenseWeight * (prevented + Math.max(0,-Number(condition.mechanics?.attack || 0))*2)
      + Math.max(0,-Number(condition.mechanics?.armorClass || 0))*1.5);
  }
  return value;
}

export function enumerateDuelPlans({ fighters, profiles, states, index, defenseWeight = 1, allowBerserk = true }) {
  const actor = profiles[index], target = profiles[1 - index], fighter = fighters[index];
  const budget = Object.fromEntries(actor.resources.map(resource => [resource.id, resource.current]));
  const pool = actor.actions.filter(action => action.compatible !== false && !['equipment-switch', 'wait'].includes(action.kind))
    .map(action => fighter.profile(action.id, states.get(fighter.character.id)))
    .filter(profile => !profile.weaponUnavailable && applyCombatAbilityUse(profile.abilities, profile.profileActionId).sufficient
      && (allowBerserk || !profile.selectedAction.effects?.some(effect => effect.condition?.berserk)))
    .map(profile => ({ id: profile.profileActionId, costs: profile.resourceCosts,
      score: actionValue(profile, target, defenseWeight), self: !getCombatDamagePreview(profile),
      groups: profile.selectedAction.effects?.map(effect => effect.condition?.stanceGroup).filter(Boolean) || [] }))
    .filter(choice => Number.isFinite(choice.score) && choice.score > 0 && choice.costs.length
      && choice.costs.every(cost => cost.amount > 0 && cost.amount <= (budget[cost.resourceId] || 0)))
    .sort((a,b) => b.score - a.score);
  const plans = [];
  function visit(remaining, selected, score, groups) {
    if (selected.length) plans.push({ plan: [...selected].sort((a,b) => Number(b.self) - Number(a.self)).map(choice => choice.id), score,
      persistent: selected.flatMap(choice => choice.costs).filter(cost => !ordinary.has(cost.resourceId)).reduce((sum,cost)=>sum+cost.amount,0) });
    for (const choice of pool) {
      if (selected.some(previous => previous.id === choice.id) || choice.groups.some(group => groups.has(group))
        || choice.costs.some(cost => cost.amount > (remaining[cost.resourceId] || 0))) continue;
      const next = { ...remaining };
      for (const cost of choice.costs) next[cost.resourceId] -= cost.amount;
      visit(next, [...selected, choice], score + choice.score, new Set([...groups, ...choice.groups]));
    }
  }
  visit(budget, [], 0, new Set());
  return plans.sort((a,b) => b.score - a.score || a.persistent - b.persistent);
}

export function chooseHeuristicDuelPlan(context) {
  return enumerateDuelPlans(context)[0]?.plan || ['combat:wait'];
}

function stateValue(profiles, index, defenseWeight) {
  const actor = profiles[index], target = profiles[1 - index];
  if (actor.currentHitPoints <= 0) return -1000;
  if (target.currentHitPoints <= 0) return 1000;
  let value = (actor.currentHitPoints + .8 * actor.temporaryHitPoints) * defenseWeight - target.currentHitPoints - .8 * target.temporaryHitPoints;
  const recoveryReserve = profile => profile.abilities.some(ability => ability.id === 'martial-durchschnaufen' && ability.usesCurrent > 0)
    ? .7 * (profile.hitPoints.hitDie / 2 + .5 + Math.ceil(profile.maximumHitPoints / 10)) : 0;
  value += defenseWeight * recoveryReserve(actor) - recoveryReserve(target);
  // The response expires one-turn guards. Rage remains a continuing offensive
  // state; the value approximates its benefit over the remaining short duel.
  if (actor.conditions.some(condition => condition.berserk)) value += 5;
  if (target.conditions.some(condition => condition.berserk)) value -= 5;
  return value;
}

// Independent planning dice are derived from the public turn number, never the
// duel seed. Both sides see only resolved history, without future dice access.
export async function chooseSampledDuelPlan(context, { shortlist = 6, samples = 4, defenseWeight = 1, allowBerserk = true } = {}) {
  const signatures = new Set();
  const options = enumerateDuelPlans({ ...context, defenseWeight, allowBerserk }).filter(option => {
    const signature = [...option.plan].sort().join('|');
    if (signatures.has(signature)) return false;
    signatures.add(signature); return true;
  }).slice(0, shortlist);
  if (!options.length) return ['combat:wait'];
  let best = { score: -Infinity, plan: options[0].plan };
  for (const option of options) {
    let score = 0;
    for (let sample = 0; sample < samples; sample++) {
      const dice = new SeededCombatDice((Math.imul(context.comments.length + 1, 2654435761) + Math.imul(sample + 1, 2246822519)) >>> 0);
      const own = await resolveDuelContribution({ ...context, plan: option.plan, dice });
      let result = own.snapshot;
      if (result.profiles.every(profile => profile.currentHitPoints > 0)) {
        const reply = await resolveDuelContribution({ fighters: context.fighters, comments: [...context.comments, own.comment],
          index: 1 - context.index, dice, postId: `${context.postId}-lookahead`,
          plan: (profiles, states) => chooseHeuristicDuelPlan({ ...context, index: 1 - context.index, profiles, states }) });
        result = reply.snapshot;
      }
      score += stateValue(result.profiles, context.index, defenseWeight);
    }
    score = score / samples - option.persistent * .05;
    if (score > best.score) best = { score, plan: option.plan };
  }
  return best.plan;
}

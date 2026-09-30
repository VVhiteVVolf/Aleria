// Shared martial damage economy. Spell damage has its own authored budgets.
// Costs buy individual extra dice; they never multiply the whole weapon pool.
const amount = (costs, id) => costs.filter(cost => cost.resourceId === id)
  .reduce((sum, cost) => sum + Math.max(0, Math.min(6, Number(cost.amount) || 0)), 0);

export function hasWeaponTechniqueControl(spec = {}) {
  const meaningful = condition => condition && (condition.blockedResource || condition.disarm || condition.damageGuard
    || condition.triggerRules?.length || Object.entries(condition.mechanics || {}).some(([key, value]) => key !== 'movement' && value !== 0));
  return Boolean(spec.guard || spec.aim || spec.temporaryHp || spec.penalty
    || meaningful(spec.secondarySave?.failureCondition)
    || spec.effects?.some(effect => ['healing', 'temporary-hit-points'].includes(effect.type)
      || effect.type !== 'damage' && meaningful(effect.condition) && effect.type !== 'debuff'));
}

function trainingSteps(spec, light) {
  if (light || spec.maximumTargets > 1) return [];
  const milestones = spec.allowedClassIds?.includes('milwr')
    ? [[6, 4], [10, 6], [15, 8]] : [[7, 4], [9, 6], [13, 8], [17, 10]];
  // All techniques share their class's attained training. Unlocking a newer
  // technique must not silently lose the die already earned by an older one.
  return milestones.map(([level, sides]) => ({ level, formula: `1d${sides}` }));
}

export function createWeaponTechniqueDamageProfile(spec = {}, costs = []) {
  if (spec.noPrimaryDamage) return { damageFormula: '', damageModel: { mode: 'fixed', scalingSteps: [] } };
  let actions = amount(costs, 'action');
  let reactions = amount(costs, 'reaction');
  let bonuses = amount(costs, 'bonus-action');
  const light = !actions && !reactions && bonuses > 0;
  if (actions) actions--; else if (reactions) reactions--; else if (bonuses) bonuses--;
  // Control/defense uses the weakest extra ordinary point to pay for its effect.
  if (spec.damageControl && bonuses) bonuses--;
  else if (spec.damageControl && reactions) reactions--;
  const areaCap = spec.maximumTargets > 1 ? 6 : 12;
  const weaponBonuses = [
    { diceCount: actions, dieCap: areaCap },
    { diceCount: reactions, dieCap: Math.min(6, areaCap) },
    { diceCount: bonuses, dieCap: 4 },
    { diceCount: amount(costs, 'special-action'), dieCap: areaCap },
    { diceCount: 2 * amount(costs, 'aura-focus'), dieCap: 12 }
  ].filter(group => group.diceCount > 0);
  return { damageFormula: '', damageModel: {
    mode: 'weapon-dice', weaponDiceMultiplier: 1, bonusFormula: '',
    ...(light ? { baseDieCap: 4, lightAttack: true } : {}),
    weaponBonuses, bonusWeaponDice: 0, bonusWeaponDieCap: 12,
    scalingSteps: trainingSteps(spec, light)
  } };
}

export const weaponTechniqueBudgetInternals = Object.freeze({ trainingSteps });

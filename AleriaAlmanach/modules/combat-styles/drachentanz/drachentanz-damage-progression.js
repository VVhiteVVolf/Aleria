// Shared by Drachentanz, Sirenentanz and Huskarl. Each tuple is additional
// weapon dice, their side cap and a fixed technique bonus (never multiplied).
// The unlock level sets the budget; older forms gain only one replacement die.
const DAMAGE_BUDGETS = Object.freeze([
  { level: 1, response: [0, 4, 1], standard: [1, 6, 0], paired: [1, 8, 0], committed: [1, 8, 1],
    specialQuick: [1, 6, 1], specialResponse: [1, 8, 0], signature: [1, 8, 1], grand: [1, 8, 2], ultimate: [1, 8, 2], elite: [1, 8, 2] },
  { level: 7, response: [0, 4, 1], standard: [1, 8, 0], paired: [1, 8, 1], committed: [1, 10, 1],
    specialQuick: [1, 8, 1], specialResponse: [1, 10, 0], signature: [1, 10, 1], grand: [1, 10, 2], ultimate: [2, 6, 1], elite: [2, 8, 1] },
  { level: 9, response: [1, 6, 0], standard: [1, 10, 0], paired: [1, 10, 1], committed: [2, 6, 0],
    specialQuick: [2, 6, 0], specialResponse: [2, 6, 1], signature: [2, 8, 0], grand: [2, 8, 1], ultimate: [2, 10, 0], elite: [2, 10, 2] },
  { level: 13, response: [1, 6, 0], standard: [2, 6, 1], paired: [2, 8, 0], committed: [2, 8, 1],
    specialQuick: [2, 8, 0], specialResponse: [2, 8, 1], signature: [2, 8, 2], grand: [2, 10, 1], ultimate: [3, 8, 0], elite: [3, 8, 2] },
  { level: 17, response: [1, 8, 0], standard: [2, 8, 1], paired: [2, 8, 2], committed: [2, 10, 1],
    specialQuick: [3, 6, 1], specialResponse: [3, 8, 0], signature: [3, 8, 1], grand: [3, 8, 2], ultimate: [3, 10, 1], elite: [3, 10, 3] },
  { level: 20, response: [1, 8, 0], standard: [2, 8, 1], paired: [2, 8, 2], committed: [2, 10, 1],
    specialQuick: [3, 8, 0], specialResponse: [3, 10, 0], signature: [3, 10, 1], grand: [3, 10, 2], ultimate: [3, 12, 1], elite: [3, 12, 3] }
]);

function damageTier(ids) {
  if (ids.has('aura-focus')) return 'elite';
  const action = ids.has('action');
  const reaction = ids.has('reaction');
  const bonus = ids.has('bonus-action');
  if (ids.has('special-action')) {
    if (action && reaction && bonus) return 'ultimate';
    if (action && (reaction || bonus)) return 'grand';
    if (action || (reaction && bonus)) return 'signature';
    return reaction ? 'specialResponse' : 'specialQuick';
  }
  if (action && reaction && bonus) return 'committed';
  if (action && (reaction || bonus)) return 'paired';
  if (reaction && !action && !bonus) return 'response';
  return 'standard';
}

function scalingSteps(spec) {
  const level = Number(spec.minimumLevel) || 1;
  const milwr = spec.allowedClassIds?.includes('milwr');
  const milestones = milwr
    ? (level < 6 ? [[6, 4], [10, 6], [15, 8]] : (level < 10 ? [[10, 4], [15, 6]] : (level < 15 ? [[15, 4]] : [])))
    : (level < 7 ? [[7, 4], [9, 6], [13, 8], [17, 10]]
      : (level < 9 ? [[9, 4], [13, 6], [17, 8]]
        : (level < 13 ? [[13, 4], [17, 6]] : (level < 17 ? [[17, 4]] : []))));
  return milestones.map(([level, sides]) => ({ level, formula: `1d${sides}` }));
}

export function createDrachentanzDamageProfile(spec = {}, costs = []) {
  if (spec.noPrimaryDamage) return { damageFormula: '', damageModel: { mode: 'fixed', scalingSteps: [] } };
  const level = Math.max(1, Math.min(20, Number(spec.minimumLevel) || 1));
  const ids = new Set(costs.map(cost => cost.resourceId));
  const budget = DAMAGE_BUDGETS.findLast(entry => level >= entry.level);
  const light = ids.size === 1 && ids.has('bonus-action');
  const tier = damageTier(ids);
  let [dice, sides, fixed] = budget[tier];
  if (tier === 'elite') fixed += Math.min(2, costs.filter(cost => cost.resourceId === 'aura-focus')
    .reduce((sum, cost) => sum + Math.max(0, Number(cost.amount) - 1), 0));
  // An area attack trades a little per-target damage for reach and control.
  if (Number(spec.maximumTargets) > 1 && dice > 0) sides = Math.max(4, sides - 2);
  return {
    damageFormula: light ? '1d6' : '',
    damageModel: {
      mode: light ? 'fixed' : 'weapon-dice',
      weaponDiceMultiplier: 1,
      bonusFormula: '',
      ...(!light && fixed ? { bonusModifier: fixed } : {}),
      bonusWeaponDice: light ? 0 : dice,
      bonusWeaponDieCap: sides,
      scalingSteps: scalingSteps(spec)
    }
  };
}

export const drachentanzDamageProgressionInternals = Object.freeze({ DAMAGE_BUDGETS, scalingSteps, damageTier });

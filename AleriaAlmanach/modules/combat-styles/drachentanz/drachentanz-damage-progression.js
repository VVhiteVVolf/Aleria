// One damage budget for every Cenyr weapon branch. Costs determine commitment;
// the attack's unlock level determines its training stage, never the actor's level.
// Later training adds ONE replacement bonus die, not another complete damage pool.
const DAMAGE_BUDGETS = Object.freeze([
  { level: 1, standard: [1, 4], committed: [1, 6], signature: [1, 8], response: [0, 4] },
  { level: 7, standard: [1, 6], committed: [1, 8], signature: [1, 10], response: [0, 4] },
  { level: 9, standard: [1, 8], committed: [1, 10], signature: [2, 6], response: [1, 4] },
  { level: 13, standard: [2, 6], committed: [2, 8], signature: [2, 8], response: [1, 4] },
  { level: 17, standard: [2, 8], committed: [2, 8], signature: [3, 8], response: [1, 6] },
  { level: 20, standard: [2, 8], committed: [2, 8], signature: [3, 10], response: [1, 6] }
]);

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
  const level = Math.max(1, Math.min(20, Number(spec.minimumLevel) || 1));
  const ids = new Set(costs.map(cost => cost.resourceId));
  const budget = DAMAGE_BUDGETS.findLast(entry => level >= entry.level);
  const light = ids.size === 1 && ids.has('bonus-action');
  const tier = ids.has('special-action') || ids.has('aura-focus') ? 'signature'
    : (ids.size === 1 && ids.has('reaction') ? 'response' : (ids.size >= 3 ? 'committed' : 'standard'));
  let [dice, sides] = budget[tier];
  // An area attack trades a little per-target damage for reach and control.
  if (Number(spec.maximumTargets) > 1 && dice > 0) sides = Math.max(4, sides - 2);
  return {
    damageFormula: light ? '1d4' : '',
    damageModel: {
      mode: light ? 'fixed' : 'weapon-dice',
      weaponDiceMultiplier: 1,
      bonusFormula: '',
      bonusWeaponDice: light ? 0 : dice,
      bonusWeaponDieCap: sides,
      scalingSteps: scalingSteps(spec)
    }
  };
}

export const drachentanzDamageProgressionInternals = Object.freeze({ DAMAGE_BUDGETS, scalingSteps });

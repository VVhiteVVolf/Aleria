import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile } from '../../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../../modules/combat/combat-resolution-service.js';
import { overlayCombatHitPointState } from '../../modules/combat/combat-state-model.js';
import { JUNGDRACHE_SHARED_TECHNIQUES as techniques } from '../../modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js';
import { buildDamageRollPlan } from '../../modules/combat/rules/combat-mvp-rules.js';
const database = JSON.parse(await readFile(new URL('../../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const characters = database.characters;
export const fighter = (name, actionId = '') => {
  const character = characters.find(c => c.name === name);
  assert.ok(character, name);
  const profile = resolveCombatProfile(character, { actionId, includeAiSnapshot: false });
  return { ...profile, currentHitPoints: profile.maximumHitPoints,
    resources: profile.resources.map(r => ({ ...r, current: r.maximum })) };
};
export function receipts(rolls = [15], save = 1) {
  let id = 0; const calls = [];
  return { calls,
    rollAttack: async ({ modifier, rollMode }) => {
      const natural = rolls.shift() ?? 15; const dice = rollMode === 'normal' ? [natural] : [natural, natural];
      calls.push({ natural, rollMode, modifier });
      return { id: `attack-${++id}`, natural, dice, keptDice: [natural], total: natural + modifier };
    },
    rollSavingThrow: async ({ modifier }) => ({ id: `save-${++id}`, natural: save, dice: [save], keptDice: [save], total: save + modifier }),
    rollDamage: async ({ damageFormula, bonus = 0, critical }) => {
      const plan = buildDamageRollPlan(damageFormula, bonus, critical);
      const dice = plan.terms.flatMap(t => Array(t.diceCount).fill(2));
      return { id: `damage-${++id}`, notation: plan.notation, criticalDamage: plan.criticalDamage, keptDice: dice, modifier: plan.modifier, total: dice.reduce((a,b) => a+b, plan.modifier) };
    }
  };
}
export const technique = name => techniques.find(t => t.name === name);
export const actorFor = (name, ability) => fighter(name, `technique:${technique(ability)?.id || ability}`);
export async function prepare(name, ability) {
  const actor = actorFor(name, ability);
  assert.equal(actor.selectedAction.name, ability);
  const result = await new CombatResolutionService(receipts()).resolveAttack({ actor, target: actor });
  return { result, profile: overlayCombatHitPointState(fighter(name), { temporaryConditions: (result.targetConditionSnapshot || result.actorConditionSnapshot).after, resources: result.actorResourceSnapshot.after }) };
}

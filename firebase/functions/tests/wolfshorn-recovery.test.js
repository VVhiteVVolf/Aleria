import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile as browserProfile } from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { CombatResolutionService as BrowserService } from '../../../AleriaAlmanach/modules/combat/combat-resolution-service.js';
import { resolveCombatProfile as serverProfile } from '../src/generated/combat/combat-profile-resolver.js';
import { CombatResolutionService as ServerService } from '../src/generated/combat/combat-resolution-service.js';
import { ProvidedDiceAdapter } from '../src/mechanics/provided-dice-adapter.js';
import { parseDamageFormula } from '../src/generated/combat/rules/combat-mvp-rules.js';
const read = async name => JSON.parse(await readFile(new URL(`../../../Charakter%20Archiv%20Exporte/${name}-wolfshorn.json`, import.meta.url), 'utf8')).character;
const ylva = await read('ylva'), asgeir = await read('asgeir');
function equip(c, right, left = '') {
  c = structuredClone(c); c.combatProfile.weapons.forEach(w => { w.equipped = w.id === right; });
  c.combatProfile.combat.offHandWeaponId = left; return c;
}
function receipts(rolls, save) {
  let id = 0;
  return {
    rollAttack: async ({ modifier, rollMode }) => {
      const natural = rolls.shift(); const dice = rollMode === 'normal' ? [natural] : [natural, natural];
      return { id: `attack-${++id}`, natural, dice, keptDice: [natural], total: natural + modifier };
    },
    rollSavingThrow: async ({ modifier }) => ({ id: `save-${++id}`, natural: save, dice: [save], keptDice: [save], total: save + modifier }),
    rollDamage: async ({ damageFormula, bonus = 0, critical }) => {
      const parsed = parseDamageFormula(damageFormula);
      const dice = (parsed.terms || [parsed]).flatMap(t => Array(t.diceCount * (critical ? 2 : 1)).fill(2));
      const modifier = parsed.fixedModifier + bonus;
      return { id: `damage-${++id}`, notation: damageFormula, keptDice: dice, modifier, total: dice.reduce((a,b) => a+b, modifier) };
    }
  };
}
for (const [name, character, actionId, rolls, save] of [
  ['Ylva failed save', equip(ylva, 'ylva-speer'), 'technique:ylva-fallender-dorn', [15,20], 1],
  ['Ylva passed save', equip(ylva, 'ylva-speer'), 'technique:ylva-fallender-dorn', [15,15], 20],
  ['Ylva missed opener', equip(ylva, 'ylva-speer'), 'technique:ylva-fallender-dorn', [1,15], 1],
  ['Asgeir four hits', equip(asgeir, 'asgeir-axt-rechts', 'asgeir-axt-links'), 'technique:asgeir-vier-faenge', [15,15,20,15], 1],
  ['Asgeir missed opener', equip(asgeir, 'asgeir-axt-rechts', 'asgeir-axt-links'), 'technique:asgeir-vier-faenge', [1,15,20,15], 1],
  ['Durchschnaufen', ylva, 'ability:martial-durchschnaufen', [], 1]
]) test(`${name}: server validates every die and reproduces HP, costs and conditions`, async () => {
  const actor = browserProfile(character, { actionId, includeAiSnapshot: false });
  const self = actionId.startsWith('ability:');
  const target = self ? { ...actor, currentHitPoints: 30 } : { ...browserProfile(ylva), characterId: 'enemy', totalDefense: 10 };
  const client = await new BrowserService(receipts(rolls.slice(), save)).resolveAttack({ actor: self ? target : actor, target });
  const serverActor = serverProfile(character, { actionId, includeAiSnapshot: false });
  const result = await new ServerService(new ProvidedDiceAdapter(client)).resolveAttack({ actor: self ? { ...serverActor, currentHitPoints: 30 } : serverActor, target });
  assert.deepEqual(result.targetSnapshot, client.targetSnapshot);
  assert.deepEqual(result.actorResourceSnapshot, client.actorResourceSnapshot);
  assert.deepEqual(result.followUpAttacks.map(a => [a.attack.hit, a.attack.rollMode, a.damage?.total]), client.followUpAttacks.map(a => [a.attack.hit, a.attack.rollMode, a.damage?.total]));
  assert.deepEqual(result.targetConditionSnapshot, client.targetConditionSnapshot);
  if (!self) {
    const tampered = structuredClone(client); tampered.followUpAttacks[0].attack.diceResults = [];
    await assert.rejects(new ServerService(new ProvidedDiceAdapter(tampered)).resolveAttack({ actor: serverActor, target }));
  } else assert.equal(result.targetSnapshot.hitPointsAfter, 42);
});

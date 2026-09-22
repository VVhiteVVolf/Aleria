import assert from 'node:assert/strict';
import test from 'node:test';
import { isSelfTargetAction, getCombatTargetSelection } from '../modules/combat/combat-action-targeting.js';
import { CLASS_SPECIAL_IDS, getClassSpecialManeuvers } from '../modules/classes/class-special-maneuvers.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { readFile } from 'node:fs/promises';
const load = async slug => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character;
const asgeir = await load('asgeir-wolfshorn');
const ylva = await load('ylva-wolfshorn');
test('Selbstfähigkeiten ersetzen leere, fremde und beim Figurenwechsel veraltete Ziele', () => {
  const action = resolveCombatProfile(asgeir).actions.find(a => a.name.startsWith('Berserkergang'));
  assert.equal(isSelfTargetAction(action), true);
  for (const before of [[], ['enemy'], ['old-actor'], ['enemy', 'ally']]) assert.deepEqual(getCombatTargetSelection(action, asgeir.id, before), [asgeir.id]);
  assert.deepEqual(getCombatTargetSelection({ kind: 'equipment-switch' }, 'own', ['enemy']), ['own']);
});
test('Angriffe entfernen das vorherige Selbstziel, Heilung und gemischte Wirkungen behalten echte Zielwahl', () => {
  for (const action of [null, {}, { effects: [] }, { effects: [{ type: 'damage', target: 'target' }] }]) {
    assert.equal(isSelfTargetAction(action), false);
    assert.deepEqual(getCombatTargetSelection(action, 'own', ['own', 'enemy']), ['enemy']);
  }
  const healing = { effects: [{ type: 'healing', target: 'target' }] };
  assert.deepEqual(getCombatTargetSelection(healing, 'own', ['own', 'ally']), ['own', 'ally']);
  const mixed = { effects: [{ type: 'buff', target: 'self' }, { type: 'damage', target: 'target' }] };
  assert.equal(isSelfTargetAction(mixed), false);
  assert.deepEqual(getCombatTargetSelection(mixed, 'own', ['enemy']), ['enemy']);
  assert.equal(isSelfTargetAction({ effects: [{ type: 'damage', target: 'self' }] }), true);
});
for (const classId of CLASS_SPECIAL_IDS) test(`${classId}: zwei Sonderoptionen ab 5, weitere auf 8/12/16/20, keine kostenlosen oder doppelten Grants`, () => {
  const count = level => { const pool = getClassSpecialManeuvers(classId, level); return [...pool.abilities, ...pool.techniques]; };
  assert.equal(count(4).length, 0);
  for (const [level, expected] of [[5,2],[7,2],[8,3],[12,4],[16,5],[20,6]]) {
    const pool = count(level);
    assert.equal(pool.length, expected);
    for (const action of pool) {
      assert.equal(action.costs.find(c=>c.resourceId==='special-action').amount,1);
      assert.ok(action.costs.some(c=>c.resourceId!=='special-action'));
      assert.equal(action.auraBypass.allowed,false);
    }
  }
  const profile = sanitizeCharacterCombatProfile({ templateSelections:{classId}, progression:{level:7} });
  const twice = sanitizeCharacterCombatProfile(profile);
  assert.deepEqual(twice.abilities, profile.abilities);
  assert.deepEqual(twice.techniques, profile.techniques);
});
test('Ylvas Selbstvorbereitung verbraucht Sonder- und Bonusaktion, aber keinen Pfeil; Angriff verbraucht Munition', async () => {
  const base = resolveCombatProfile(ylva);
  const selfAction = base.actions.find(a=>a.id==='ability:class-special-skytte-reserve');
  const attack = base.actions.find(a=>a.id==='technique:class-special-skytte-strike');
  assert.equal(selfAction.compatible,true); assert.equal(attack.compatible,true);
  const dice={rollDamage:async()=>({natural:3,keptDice:[3],dice:[3],total:3,modifier:0}),rollAttack:async({modifier=0})=>({natural:15,dice:[15],keptDice:[15],total:15+modifier})};
  const actor=resolveCombatProfile(ylva,{actionId:selfAction.id});
  const result=await new CombatResolutionService(dice).resolveAttack({actor,target:actor});
  assert.equal(result.actorInventorySnapshot,null);
  assert.equal(result.actorResourceSnapshot.after.find(r=>r.id==='special-action').current,1);
  assert.equal(result.actorResourceSnapshot.after.find(r=>r.id==='bonus-action').current,0);
  assert.equal(result.targetSnapshot.temporaryHitPointsAfter,3);
  const shot=await new CombatResolutionService(dice).resolveAttack({actor:resolveCombatProfile(ylva,{actionId:attack.id}),target:resolveCombatProfile(asgeir)});
  assert.ok(shot.actorInventorySnapshot?.ammunitionUse);
});

test('Ylvas reguläre Bogenvorbereitung funktioniert ohne Pfeile und ohne Angriffswurf', async () => {
  const character = structuredClone(ylva);
  character.inventory.items = character.inventory.items.filter(item => item.id !== 'ylva-pfeile');
  const actor = resolveCombatProfile(character, { actionId: 'technique:combat-style-huskarl-skytte-wahl-4' });
  assert.equal(actor.selectedAction.name, 'Ziel zwischen den Zweigen');
  assert.equal(actor.actionResolutionMode, 'automatic');
  const noRoll = () => { throw Error('Eine Selbstvorbereitung würfelt nicht.'); };
  const result = await new CombatResolutionService({ rollAttack: noRoll, rollDamage: noRoll }).resolveAttack({ actor, target: actor });
  assert.equal(result.actorInventorySnapshot, null);
  assert.ok(result.targetConditionSnapshot.after.some(condition => condition.mechanics.attack === 1));
  for (const resource of ['bonus-action', 'reaction']) assert.equal(result.actorResourceSnapshot.after.find(r => r.id === resource).current, 0);
});

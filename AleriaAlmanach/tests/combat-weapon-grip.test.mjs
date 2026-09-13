import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { resolveCombatWeaponGrip } from '../modules/combat/combat-weapon-grip.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { renderCombatWeaponGrip } from '../modules/combat/ui/combat-weapon-grip-view.js';
import { getActionCostPresentation } from '../modules/combat/ui/combat-action-picker.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';
import { getActionPaymentCosts } from '../modules/combat/combat-action-economy.js';

const [gawain, gildas] = await Promise.all(['gawain-draig', 'gildas-gafyr'].map(async slug =>
  JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character));
const resolve = (weaponGrip, options = {}, character = gawain) => resolveCombatProfile(character, { weaponGrip, ...options });
const costs = actor => actor.resourceCosts.map(cost => [cost.resourceId, cost.amount]);
const attack = actor => new CombatResolutionService(new SeededCombatDice(1, 15)).resolveAttack({ actor, target: resolveCombatProfile(gildas) });

test('größerer Waffenwürfel verliert einen Angriffspunkt; Auswahl, Vorschau und Kosten stimmen überein', () => {
  const original = JSON.stringify(gawain);
  const one = resolve('one-handed'), two = resolve('two-handed');
  assert.equal(one.weapon.damageFormula, '1d8');
  assert.equal(two.weapon.damageFormula, '1d10');
  assert.deepEqual(costs(one), [['action', 1]]);
  assert.deepEqual(costs(two), costs(one));
  assert.equal(two.attackModifier, one.attackModifier - 1);
  assert.deepEqual(two.actionCosts, two.selectedAction.costs);
  assert.deepEqual(two.actions.find(action => action.id === two.profileActionId), two.selectedAction);
  assert.deepEqual(getActionCostPresentation(two, two.selectedAction).map(item => [item.resource.id, item.amount]), costs(two));
  assert.equal(two.totalDefense, one.totalDefense);
  assert.equal(JSON.stringify(gawain), original);
});

test('Waffentechniken skalieren den Waffenwürfel und behalten Ausbildungswürfel sowie Teilkosten', () => {
  const options = { actionId: 'technique:combat-style-drachentanz-jungdrache-02-drachenbiss' };
  const two = resolve('two-handed', options);
  assert.equal(two.weapon.damageFormula, '1d10+1d8');
  assert.deepEqual(costs(two), [['action', 1], ['reaction', 1]]);
  assert.equal(two.attackModifier, resolve('one-handed', options).attackModifier - 1);
  assert.match(renderCombatWeaponGrip(two), /Einhändig · 2d8/);
  assert.match(renderCombatWeaponGrip(two), /Zweihändig · 1d10\+1d8/);
});

test('bestehende Kostenpakete werden durch die Führung weder erhöht noch ermäßigt', () => {
  for (const amount of [1, 2]) {
    const action = { ...resolve('one-handed').selectedAction, costs: [{ resourceId: 'bonus-action', amount }] };
    const result = resolveCombatWeaponGrip(action, resolve('one-handed'), 'two-handed');
    assert.equal(result.action.costs.length, 1);
    assert.equal(result.action.costs[0].amount, amount);
  }
});

test('Aura ersetzt auch mit Zweihandgriff das gesamte reguläre Kostenpaket', () => {
  const two = resolve('two-handed');
  const auraCosts = getActionPaymentCosts({ ...two.selectedAction, auraBypass: { allowed: true } }, 'aura', {
    resources: [{ id: 'aura-focus', maximum: 1, current: 1 }]
  });
  assert.deepEqual(auraCosts.map(cost => [cost.resourceId, cost.amount]), [['aura-focus', 1]]);
  assert.deepEqual(two.actionCosts.map(cost => cost.resourceId), ['action']);
});

test('Treffergrenze unterscheidet die Führungen bei demselben W20-Wurf', async () => {
  const two = resolve('two-handed');
  const one = resolve('one-handed');
  const target = { ...resolveCombatProfile(gildas), totalDefense: one.attackModifier + 10, abilities: [], quirks: [], conditions: [] };
  const run = actor => new CombatResolutionService(new SeededCombatDice(1, 10)).resolveAttack({
    actor: { ...actor, abilities: [], quirks: [], conditions: [] }, target
  });
  assert.equal((await run(one)).attack.hit, true);
  assert.equal((await run(two)).attack.hit, false);
});

test('Auswertung und Szenen-Replay behalten reguläre Kosten und protokollieren den Griff', async () => {
  const result = await attack(resolve('two-handed'));
  assert.equal(result.weaponGrip, 'two-handed');
  const state = deriveCombatStateFromComments([{ commentSegments: [{ combatResolution: result }] }]).get(gawain.id);
  assert.equal(state.resources.find(resource => resource.id === 'action').current, 0);
  assert.equal(state.resources.find(resource => resource.id === 'bonus-action').current, 1);
});

test('ausgerüsteter Schild und alter Schildbonus sperren Zweihandgriff auch bei Aura', async () => {
  for (const legacy of [false, true]) {
    const character = structuredClone(gawain);
    if (legacy) character.combatProfile.armorClass.shieldBonus = 2;
    else character.combatProfile.armorItems.push({ id: 'test-shield', name: 'Prüfschild', kind: 'shield', equipped: true, armorClassBonus: 2 });
    const two = resolve('two-handed', { paymentMode: 'aura' }, character);
    assert.equal(two.selectedAction.compatible, false);
    assert.match(two.weaponGripBlockedReason, /Schild/);
    assert.match(renderCombatWeaponGrip(two), /value="two-handed" selected disabled/);
    await assert.rejects(attack(two), /Schild/);
    assert.equal(resolve('one-handed', {}, character).selectedAction.compatible, true);
  }
});

test('Zweitwaffe, reine Zweihandwaffen und andere Handlungen erhalten keinen vielseitigen Gratiswürfel', () => {
  const character = structuredClone(gawain);
  character.combatProfile.combat.offHandWeaponId = 'gawain-draig-dagger';
  assert.equal(resolve('two-handed', {}, character).weaponGrip, 'one-handed');
  assert.deepEqual(costs(resolve('two-handed', {}, character)), [['action', 1]]);
  const action = { kind: 'weapon', weapon: { damageFormula: '2d6' }, costs: [{ resourceId: 'action', amount: 1 }] };
  assert.deepEqual(resolveCombatWeaponGrip(action, {}, 'two-handed').action.costs, action.costs);
});

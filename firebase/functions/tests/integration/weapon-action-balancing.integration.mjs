import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createCombatParty } from './combat-party-context.mjs';
import { database, undo, commitAction } from './combat-test-context.mjs';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { withEquippedCombatWeapon } from '../../../../AleriaAlmanach/modules/combat/combat-equipment-state.js';

after(() => database.terminate());
const records = JSON.parse(await readFile(new URL('../../../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8')).characters;
function fighter(name, right, left, level) {
  let actor = structuredClone(records.find(record => record.name.startsWith(name)));
  assert.ok(actor, name);
  if (level) actor.combatProfile.progression.level = level;
  if (left) {
    actor.combatProfile.armorClass.shieldBonus = 0;
    actor.combatProfile.armorItems.forEach(item => { if (item.kind === 'shield') item.equipped = false; });
  }
  if (right) actor = withEquippedCombatWeapon(actor, right, left || '');
  const profile = resolveCombatProfile(actor);
  actor.combatProfile.hitPoints.current = profile.maximumHitPoints;
  actor.combatProfile.resources = profile.resources.map(resource => ({ ...resource, current: resource.maximum }));
  return actor;
}
const target = () => ({ id: 'weapon-budget-target', name: 'Pruefgegner', combatProfile: {
  hitPoints: { current: 1000, maximumOverride: 1000 }, armorClass: { override: 5 },
  weapons: [{ id: 'test-weapon', name: 'Klinge', damageFormula: '1d6', equipped: true }]
} });
const partyFor = actor => createCombatParty([{ key: 'a', actor, team: 'one' }, { key: 'b', actor: target(), team: 'two' }]);

for (const [name, right, left, formula, actionId] of [
  ['Asgeir', 'asgeir-axt-rechts', 'asgeir-axt-links', '2d6'],
  ['Fenrir', 'fenrir-handaxe-pair', 'fenrir-handaxe-pair', '2d6', 'technique:fenrir-twin-axe-flurry'],
  ['Guinevere', 'guinevere-hunting-daggers', 'guinevere-hunting-daggers', '2d4']
]) test(`${name}: joint dice, one modifier, server storage, replay and undo`, async () => {
  const actor = fighter(name, right, left);
  const party = await partyFor(actor);
  const selected = actionId || `weapon:${right}`;
  const profile = resolveCombatProfile(actor, { actionId: selected });
  const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: selected, natural: 19 }));
  const result = saved.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.weapon.damageFormula, formula);
  assert.equal(result.damage.diceResults.length, 2);
  assert.equal(result.damage.total, result.damage.diceResults.reduce((sum, die) => sum + die, 0) + profile.damageModifier);
  assert.equal(result.followUpAttacks?.length || 0, 0);
  await undo(saved.id);
  assert.equal((await party.record('b')).combatProfile.hitPoints.current, 1000);
  await party.assertConsistent();
});

test('Ylva: light shot uses W4 and halved fixed base, spends only bonus action', async () => {
  const actor = fighter('Ylva');
  const id = resolveCombatProfile(actor).actions.find(action => action.name === 'Erster Jagdpfeil').id;
  const party = await partyFor(actor);
  const before = (await party.snapshot()).profiles.get('a');
  const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: id }));
  const result = saved.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.weapon.damageFormula, '1d4');
  assert.equal(result.damage.total, 4);
  assert.deepEqual(result.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['bonus-action', 1]]);
  await undo(saved.id);
  assert.deepEqual((await party.snapshot()).profiles.get('a').resources, before.resources);
});

test('Aura adds two main-weapon dice to a joint attack and consumes focus once', async () => {
  const actor = fighter('Asgeir', 'asgeir-axt-rechts', 'asgeir-axt-links', 8);
  const party = await partyFor(actor);
  const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: 'weapon:asgeir-axt-rechts', paymentMode: 'aura' }));
  const result = saved.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.damage.diceResults.length, 4);
  assert.ok(result.damage.diceResults.every(die => die === 3));
  assert.deepEqual(result.resourceCosts.map(cost => [cost.resourceId, cost.amount]), [['aura-focus', 1]]);
  await undo(saved.id);
  await party.assertConsistent();
});

test('server rejects a forged untrained Gawain dual-wield loadout without committing damage', async () => {
  const party = await partyFor(fighter('Gawain'));
  const prepared = await party.prepare({ actor: 'a', targets: ['b'], actionId: 'weapon:gawain-draig-knightly-sword' });
  prepared.segment.combatAction.loadout = { rightWeaponId: 'gawain-draig-knightly-sword', leftWeaponId: 'gawain-draig-dagger' };
  await assert.rejects(() => commitAction(prepared.payload), /Zweiwaffentechnik/);
  assert.equal((await party.record('b')).combatProfile.hitPoints.current, 1000);
  await party.assertConsistent();
});

test('Vier Faenge remains four individually rolled single-axe attacks with one paid sequence', async () => {
  const party = await partyFor(fighter('Asgeir', 'asgeir-axt-rechts', 'asgeir-axt-links'));
  const saved = await party.commit(await party.prepare({ actor: 'a', targets: ['b'], actionId: 'technique:asgeir-vier-faenge', natural: 19 }));
  const result = saved.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.weapon.damageFormula, '1d6');
  assert.equal(result.followUpAttacks.length, 3);
  assert.ok(result.followUpAttacks.every(attack => attack.damage.diceResults.length === 1));
  assert.deepEqual(result.resourceCosts.filter(cost => ['action', 'reaction', 'bonus-action'].includes(cost.resourceId)).map(cost => cost.resourceId).sort(), ['action', 'bonus-action', 'reaction']);
  assert.ok((await party.snapshot()).profiles.get('b').temporaryConditions.some(condition => condition.blockedResource === 'action'));
  await undo(saved.id);
  assert.equal((await party.record('b')).combatProfile.hitPoints.current, 1000);
  await party.assertConsistent();
});

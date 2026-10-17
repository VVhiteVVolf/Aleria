import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { commitSkillCommentOperation } from '../src/mechanics/commit-skill-comment.js';
import { ServerCombatDiceAdapter } from '../src/mechanics/server-combat-dice.js';
import { deriveCombatStateFromComments } from '../src/generated/combat/combat-state-model.js';
import { deriveSceneItems } from '../src/generated/scene-items/scene-items-model.js';
import { getCommentCombatResolutionGroups } from '../src/generated/combat/combat-resolution-tree.js';

const auth = { uid: 'gm', token: { aleriaRole: 'admin' } };
const empty = () => ({ copper: 0, items: [], effects: [], combatEffects: [] });
const person = (id, sides) => ({ id, name: id, inventory: { items: [{ id: id + '-item', name: id + '-spear', quantity: '1' }] },
  combatProfile: { progression: { level: 3 }, hitPoints: { current: 100, maximumOverride: 100 }, armorClass: { override: id === 'ylva' ? 16 : 15 },
    attributes: [{ key: 'dexterity', score: 12 }, { key: 'strength', score: 14 }],
    weapons: [{ id: id + '-spear', inventoryItemId: id + '-item', name: id + '-spear', weaponType: 'spear', damageFormula: '1d' + sides, attackAttribute: 'strength', proficient: true, equipped: true }] } });
const maneuver = (good, { critical = false, extra = false } = {}) => ({ effectId: 'maneuver', type: 'weapon-maneuver', targetActorId: good ? 'ylva' : 'gais', amount: 0,
  maneuver: { actorId: good ? 'gais' : 'ylva', weaponId: good ? 'gais-spear' : 'ylva-spear', pickupWeapon: good, resourceId: good ? 'reaction' : '',
    extraWeaponDice: good ? critical ? 2 : 1 : extra ? 1 : 0, rollMode: critical ? 'advantage' : 'normal', damageMultiplier: !good && critical ? 2 : 1,
    save: !good && !critical ? { attribute: 'dexterity', difficulty: 15 } : null } });
const spend = resourceId => ({ effectId: resourceId, type: 'spend-resource', targetActorId: 'gais', resourceId, amount: 1 });
function event() {
  const row = (id, min, effects = [], natural = 0, success = false) => ({ id, label: id, minimumTotal: min, natural, success, text: id, benefits: { ...empty(), combatEffects: effects } });
  return { title: 'Lanzenaufnahme', publicDescription: 'Eine Lanze liegt zwischen den Kämpfern.', combatBound: true, audience: { mode: 'selected', actorIds: ['gais'] },
    targetActor: { actorId: 'ylva' }, approaches: [{ approachId: 'slide', label: 'Rutschen', preferredSkills: ['acrobatics', 'attribute:dexterity'], difficulty: 18, attemptLimit: 1,
      rewards: empty(), partialEffects: empty(), failureEffects: empty(), outcomeTable: [row('critical-success', null, [maneuver(true, { critical: true })], 20, true),
        row('success', 18, [maneuver(true)], 0, true), row('neutral', 14), row('risk', 10, [maneuver(false)]),
        row('bad', 5, [spend('bonus-action'), maneuver(false)]), row('major', null, [spend('bonus-action'), maneuver(false, { extra: true })]),
        row('critical-failure', null, [spend('reaction'), spend('bonus-action'), maneuver(false, { critical: true })], 1)] }] };
}
const history = db => [...db.data].filter(([key]) => key.startsWith('comments/')).map(([key, c]) => ({ id: key.split('/').at(-1), ...c })).sort((a, b) => Number(a.orderKey) - Number(b.orderKey));
async function fixture() {
  const start = { entryId: 'scene', orderKey: 1, serverValidatedMechanics: true, combatEncounter: { operation: 'start', encounterId: 'duel', combatType: 'training', criticalEffectsVersion: 1,
    participants: ['gais', 'ylva'].map((actorId, index) => ({ actorId, name: actorId, partyId: String(index), persistence: { kind: 'character', recordId: actorId, persistent: true } })) } };
  const drop = { entryId: 'scene', orderKey: 2, serverValidatedMechanics: true, sceneItemEvent: { operation: 'drop', sceneItemId: 'fallen-lance', sourceActorId: 'gais', weaponId: 'gais-spear', item: { id: 'gais-item', name: 'Lanze', quantity: '1' } } };
  const db = database({ 'characters/gais': person('gais', 12), 'characters/ylva': person('ylva', 8), 'comments/start': start, 'comments/drop': drop });
  const created = await commitHerausforderungOperation({ auth, data: { entryId: 'scene', text: 'Lanzenaufnahme', metadata: { herausforderung: event() } } }, { database: db, now: 100 });
  return { db, id: created.id, start, drop };
}
function attempt(id, natural, submitted = {}) {
  return { auth, data: { entryId: 'scene', charName: 'gais', text: 'Gais versucht den Rutscher.', metadata: { characterId: 'gais', commentSegments: [{
    kind: 'interact', commentKind: 'interact', mechanicMode: 'skill', skillId: 'acrobatics', skillTargetChallengeId: `herausforderung:${id}:slide`, text: 'Rutscher',
    skillResolution: { resolutionId: 'test-roll', actorId: 'gais', actorPersistence: { kind: 'character', recordId: 'gais' }, natural, diceResults: [natural], herausforderungManeuverVersion: 1, ...submitted }
  }] } } };
}
const dice = values => new ServerCombatDiceAdapter(sides => { const value = values.shift() ?? 3; assert.ok(value > 0 && value <= sides); return value; });
const resolve = async (setup, natural, values = [], submitted = {}) => (await commitSkillCommentOperation(attempt(setup.id, natural, submitted), { database: setup.db, now: 200, maneuverDice: dice(values) })).mechanics.commentSegments[0].skillResolution;
const resource = (db, id, resourceId) => deriveCombatStateFromComments(history(db)).get(id).resources.find(r => r.id === resourceId).current;

test('good success picks up the same lance and attacks for exactly one reaction, even on a miss', async () => {
  for (const attackNatural of [2, 12]) {
    const setup = await fixture(), before = structuredClone(setup.db.data.get('characters/gais').inventory);
    const r = await resolve(setup, 17, [attackNatural, 4, 4]), m = r.herausforderungCombatResults[0];
    assert.equal(r.herausforderungTier, 'success'); assert.equal(m.pickup.item.id, 'gais-item');
    assert.equal(m.resolution.attack.hit, attackNatural === 12);
    if (attackNatural === 12) { assert.equal(m.resolution.damage.diceResults.length, 2); assert.equal(m.resolution.damage.rawTotal, 10); }
    assert.equal(resource(setup.db, 'gais', 'reaction'), 0); assert.equal(resource(setup.db, 'gais', 'bonus-action'), 1); assert.equal(resource(setup.db, 'gais', 'action'), 1);
    assert.deepEqual(setup.db.data.get('characters/gais').inventory, before);
    assert.equal(deriveSceneItems(history(setup.db)).get('fallen-lance').available, false);
    assert.deepEqual(deriveCombatStateFromComments(history(setup.db)).get('gais').droppedWeapons, []);
    assert.equal(getCommentCombatResolutionGroups(history(setup.db).at(-1))[0].length, 1);
    const stored = JSON.stringify(history(setup.db).at(-1)); assert.ok(stored.length < 120000); assert.ok(!stored.includes('actorCombatProfile'));
    const snapshot = structuredClone([...setup.db.data]); await assert.rejects(resolve(setup, 17, [12, 4, 4])); assert.deepEqual([...setup.db.data], snapshot);
  }
});

test('natural 20 gives advantage and two extra actual weapon dice; it is not an automatic attack hit', async () => {
  const setup = await fixture(), r = await resolve(setup, 20, [2, 3]);
  const m = r.herausforderungCombatResults[0]; assert.equal(m.resolution.attack.rollMode, 'advantage'); assert.equal(m.resolution.attack.hit, false);
  const other = await fixture(), hit = await resolve(other, 20, [12, 11, 4, 4, 4]);
  assert.equal(hit.herausforderungCombatResults[0].resolution.damage.diceResults.length, 3);
  assert.equal(resource(other.db, 'gais', 'reaction'), 0); assert.equal(resource(other.db, 'gais', 'bonus-action'), 1);
});

test('neutral range neither picks up nor attacks nor consumes resources', async () => {
  for (const natural of [13, 16]) {
    const setup = await fixture(), r = await resolve(setup, natural);
    assert.equal(r.herausforderungTier, 'neutral'); assert.equal(r.herausforderungCombatResults?.length || 0, 0);
    assert.equal(deriveSceneItems(history(setup.db)).get('fallen-lance').available, true);
  }
});

test('below 14 uses the actual GES save; a total of 15 prevents the counter, 14 does not', async () => {
  for (const [saveNatural, succeeded] of [[14, true], [13, false]]) {
    const setup = await fixture(), r = await resolve(setup, 12, [saveNatural, 12, 4]);
    const m = r.herausforderungCombatResults[0]; assert.equal(m.save.total, saveNatural + 1); assert.equal(m.save.succeeded, succeeded);
    assert.equal(!!m.resolution, !succeeded); assert.equal(resource(setup.db, 'gais', 'bonus-action'), 1);
    assert.equal(deriveSceneItems(history(setup.db)).get('fallen-lance').available, true);
    assert.equal(setup.db.data.get('characters/gais').combatProfile.hitPoints.current, succeeded ? 100 : 94);
    assert.deepEqual(setup.db.data.get('comments/start'), setup.start); assert.deepEqual(setup.db.data.get('comments/drop'), setup.drop);
  }
});

test('below 10 always consumes the bonus action, including a successful saving throw', async () => {
  for (const saveNatural of [13, 14]) {
    const setup = await fixture(), r = await resolve(setup, 8, [saveNatural, 12, 4]);
    assert.equal(r.herausforderungTier, 'bad'); assert.equal(resource(setup.db, 'gais', 'bonus-action'), 0); assert.equal(resource(setup.db, 'gais', 'reaction'), 1);
  }
});

test('below 5 adds exactly one Ylva weapon die only when the save fails and the attack hits', async () => {
  const setup = await fixture(), r = await resolve(setup, 2, [13, 12, 4, 4]);
  const m = r.herausforderungCombatResults.find(x => x.type === 'weapon-maneuver');
  assert.equal(m.resolution.damage.diceResults.length, 2); assert.equal(m.resolution.damage.rawTotal, 10);
  assert.equal(resource(setup.db, 'gais', 'bonus-action'), 0);
  const avoided = await fixture(), noHit = await resolve(avoided, 2, [14]);
  assert.equal(noHit.herausforderungCombatResults.find(x => x.type === 'weapon-maneuver').resolution, undefined);
});

test('natural 1 skips the save, spends both resources, attacks with advantage and doubles normal damage once', async () => {
  for (const attackNatural of [12, 20]) {
    const setup = await fixture(), r = await resolve(setup, 1, [attackNatural, 11, 4, 3]);
    const m = r.herausforderungCombatResults.find(x => x.type === 'weapon-maneuver');
    assert.equal(m.save, undefined); assert.equal(m.resolution.attack.rollMode, 'advantage');
    assert.equal(m.resolution.damage.damageMultiplier, 2); assert.equal(m.resolution.damage.unmultipliedTotal, 6); assert.equal(m.resolution.damage.rawTotal, 12);
    assert.equal(m.resolution.damage.criticalDamage, undefined); assert.equal(resource(setup.db, 'gais', 'reaction'), 0); assert.equal(resource(setup.db, 'gais', 'bonus-action'), 0);
    assert.equal(setup.db.data.get('characters/gais').combatProfile.hitPoints.current, 88);
  }
});

test('fabricated client counter receipts cannot replace the server dice', async () => {
  const setup = await fixture(), r = await resolve(setup, 12, [14], { herausforderungCombatResults: [{ type: 'weapon-maneuver', resolution: { damage: { total: 9999 } } }] });
  assert.equal(r.herausforderungCombatResults[0].save.succeeded, true); assert.equal(setup.db.data.get('characters/gais').combatProfile.hitPoints.current, 100);
});

test('an older client is rejected before any claim, roll consequence or cost is stored', async () => {
  const setup = await fixture(), before = structuredClone([...setup.db.data]);
  await assert.rejects(resolve(setup, 20, [], { herausforderungManeuverVersion: 0 }), /vollständig neu laden/);
  assert.deepEqual([...setup.db.data], before);
});

test('already claimed weapons roll back the whole attempt, including its claims and costs', async () => {
  const setup = await fixture(); setup.db.data.set('comments/pickup', { entryId: 'scene', orderKey: 110, serverValidatedMechanics: true,
    sceneItemEvent: { operation: 'pickup', sceneItemId: 'fallen-lance', actorId: 'gais' } });
  const before = structuredClone([...setup.db.data]); await assert.rejects(resolve(setup, 17, [12, 4, 4]), /nicht mehr verfügbar/); assert.deepEqual([...setup.db.data], before);
});

test('old dropped weapons belonging to observers do not expand the maneuver recipients', async () => {
  const setup = await fixture(); const other = { entryId: 'scene', orderKey: 3, serverValidatedMechanics: true,
    sceneItemEvent: { operation: 'drop', sceneItemId: 'old-observer-weapon', sourceActorId: 'observer', weaponId: 'other', item: { id: 'other', name: 'Andere Waffe' } } };
  setup.db.data.set('comments/observer-drop', other);
  await resolve(setup, 17, [12, 4, 4]);
  assert.deepEqual(setup.db.data.get('comments/observer-drop'), other);
  assert.equal(deriveSceneItems(history(setup.db)).get('old-observer-weapon').available, true);
  assert.equal(setup.db.data.has('characters/observer'), false);
});

test('multiple triggered attacks share the contribution-wide critical consequence limit', async () => {
  const setup = await fixture(), authored = setup.db.data.get('comments/' + setup.id).herausforderung;
  const second = maneuver(true); second.effectId = 'second'; second.maneuver.pickupWeapon = false; second.maneuver.resourceId = '';
  authored.approaches[0].outcomeTable.find(row => row.id === 'success').benefits.combatEffects.push(second);
  const r = await resolve(setup, 17, [20, 4, 4, 3, 20, 4, 4]);
  const attacks = r.herausforderungCombatResults.filter(result => result.type === 'weapon-maneuver');
  assert.equal(attacks.length, 2); assert.equal(attacks.filter(result => result.resolution.criticalConsequence).length, 1);
  assert.ok(attacks.every(result => result.resolution.attack.criticalSuccess));
});

test('a severe counter can incapacitate Gais without negative HP, duplicating the lance or consuming Ylva resources', async () => {
  const setup = await fixture(); setup.db.data.get('characters/gais').combatProfile.hitPoints.current = 5;
  const r = await resolve(setup, 1, [12, 11, 4]);
  const m = r.herausforderungCombatResults.find(result => result.type === 'weapon-maneuver');
  assert.equal(m.resolution.targetSnapshot.defeated, true); assert.equal(setup.db.data.get('characters/gais').combatProfile.hitPoints.current, 0);
  assert.equal(deriveSceneItems(history(setup.db)).get('fallen-lance').available, true);
});

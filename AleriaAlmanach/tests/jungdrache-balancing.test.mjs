import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { JUNGDRACHE_SHARED_TECHNIQUES as techniques } from '../modules/combat-styles/drachentanz/techniques/jungdrache-shared-techniques.js';

import { fighter, receipts, technique, actorFor, prepare } from './fixtures/jungdrache-fixtures.mjs';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';
import { advanceTemporaryConditionsForComment } from '../modules/combat/combat-condition-duration.js';

for (const classId of ['teulu','cantref','uchelwyr','arthwyr','helwyr','milwr','barddwyr']) {
  test(`${classId}: every shared technique is granted at its required level, with any weapon`, () => {
    for (const t of techniques) {
      const forms = getCenyrClassProgression(classId, t.minimumLevel).styles.flatMap(s => s.forms);
      assert.ok(forms.flatMap(f => f.techniques).some(e => e.id === t.id), t.name);
      assert.deepEqual(t.weaponTypes, []);
    }
  });
}

for (const name of ['Gawain Draig', 'Gildas Gafyr']) for (const t of techniques.filter(t => t.minimumLevel <= (name === 'Gawain Draig' ? 5 : 6))) {
  test(`${name}: ${t.name} resolves and consumes its exact costs`, async () => {
    const actor = actorFor(name, t.name);
    assert.equal(actor.selectedAction.name, t.name);
    const target = actor.actionResolutionMode === 'weapon-attack' ? { ...fighter('Asgeir Wolfshorn'), totalDefense: 10 } : actor;
    const result = await new CombatResolutionService(receipts()).resolveAttack({ actor, target });
    for (const cost of result.resourceCosts) {
      const before = actor.resources.find(r => r.id === cost.resourceId);
      assert.equal(result.actorResourceSnapshot.after.find(r => r.id === cost.resourceId).current, before.current - cost.amount);
    }
    if (t.secondarySave?.enabled) assert.equal(result.secondarySaves[0].dc, 13);
  });
}

test('Geschlossene Schuppe gives +1; the stronger guard replaces it and gives +2', async () => {
  const base = fighter('Gawain Draig');
  const closed = base.techniques.find(t => t.name === 'Geschlossene Schuppe');
  assert.ok(closed);
  const actor = fighter('Gawain Draig', `technique:${closed.id}`);
  const old = await new CombatResolutionService(receipts()).resolveAttack({ actor, target: actor });
  const defended = overlayCombatHitPointState(base, { temporaryConditions: old.targetConditionSnapshot.after });
  assert.equal(defended.totalDefense - base.totalDefense, 1);
  const stronger = overlayCombatHitPointState(actorFor('Gawain Draig', 'Geschuppte Deckung'), { temporaryConditions: old.targetConditionSnapshot.after });
  const next = await new CombatResolutionService(receipts()).resolveAttack({ actor: stronger, target: stronger });
  assert.equal(next.targetConditionSnapshot.after.filter(c => c.stanceGroup === 'jungdrache-guard').length, 1);
  assert.equal(overlayCombatHitPointState(base, { temporaryConditions: next.targetConditionSnapshot.after }).totalDefense - base.totalDefense, 2);
});

test('Manual Liegend and technique Liegend share the bonus-action rule and expire after the next own contribution', () => {
  const condition = createManualCombatCondition({ presetId: 'prone', durationKind: 'actor-comments', durationAmount: 1 }, { id: 'prone-test' });
  assert.equal(condition.blockedResource, 'bonus-action');
  const base = fighter('Asgeir Wolfshorn');
  const states = new Map([[base.characterId, { temporaryConditions: [condition] }]]);
  const affected = overlayCombatHitPointState(base, states.get(base.characterId));
  assert.equal(affected.resources.find(r => r.id === 'bonus-action').current, 0);
  assert.equal(affected.movement, base.movement);
  assert.equal(affected.attackModifier, base.attackModifier);
  advanceTemporaryConditionsForComment(states, { characterId: 'someone-else' });
  assert.equal(states.get(base.characterId).temporaryConditions.length, 1);
  advanceTemporaryConditionsForComment(states, { characterId: base.characterId });
  assert.equal(states.get(base.characterId).temporaryConditions.length, 0);
});

test('A bow counter consumes its owners ammunition, not the attackers inventory', async () => {
  const { profile } = await prepare('Gildas Gafyr', 'Lauernde Klaue');
  const weapon = { ...profile.weapon, id: 'test-bow', name: 'Testbogen', weaponType: 'bow', weaponProfileId: 'longbow', damageFormula: '1d8',
    ammunition: { required: true, inventoryItemId: 'arrows', amountPerUse: 1 }, equipped: true };
  const target = { ...profile, weapon, weapons: [weapon], inventory: { items: [{ id: 'arrows', name: 'Pfeile', quantity: '2' }] } };
  const result = await new CombatResolutionService(receipts([2,19])).resolveAttack({ actor: fighter('Asgeir Wolfshorn'), target });
  assert.equal(result.targetInventorySnapshot.after.items[0].quantity, '1');
  assert.equal(result.actorInventorySnapshot, null);
  const empty = { ...target, inventory: { items: [] } };
  const skipped = await new CombatResolutionService(receipts([2])).resolveAttack({ actor: fighter('Asgeir Wolfshorn'), target: empty });
  assert.match(skipped.counterAttacks[0].skipped, /Munition/);
});

test('A prepared response never triggers a second response', async () => {
  const { profile: actor } = await prepare('Gawain Draig', 'Lauernde Klaue');
  const { profile: target } = await prepare('Gildas Gafyr', 'Lauernde Klaue');
  const d = receipts([2,2]);
  const result = await new CombatResolutionService(d).resolveAttack({ actor: { ...actor, resources: fighter('Gawain Draig').resources }, target });
  assert.equal(d.calls.length, 2);
  assert.equal(result.counterAttacks[0].resolution.attack.hit, false);
});

test('Bracing absorbs four damage once; armor protection still applies', async () => {
  const { profile } = await prepare('Gawain Draig', 'Verwurzelte Schuppe');
  const actor = fighter('Asgeir Wolfshorn');
  const normal = await new CombatResolutionService(receipts([19])).resolveAttack({ actor, target: fighter('Gawain Draig') });
  const guarded = await new CombatResolutionService(receipts([19])).resolveAttack({ actor, target: profile });
  assert.equal(guarded.targetSnapshot.hitPointsAfter - normal.targetSnapshot.hitPointsAfter, 4);
  assert.equal(guarded.targetConditionSnapshot.after.some(c => c.damageGuard), false);
});

for (const t of techniques.filter(t => t.effects?.some(e => e.condition?.counterAttack))) {
  test(`Asgeir vs Gawain: ${t.name} counter rolls with advantage, one response only`, async () => {
    const { profile } = await prepare(t.minimumLevel > 5 ? 'Gildas Gafyr' : 'Gawain Draig', t.name);
    const actor = fighter('Asgeir Wolfshorn');
    const dice = receipts([2, 19]);
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: profile });
    assert.equal(result.counterAttacks?.length, 1);
    const counter = result.counterAttacks[0].resolution;
    assert.ok(counter, JSON.stringify(result.counterAttacks));
    assert.equal(counter.attack.rollMode, 'advantage');
    assert.ok(result.actorHitPointSnapshot.after.current < actor.currentHitPoints);
    assert.equal(result.targetConditionSnapshot.after.some(c => c.counterAttack), false);
    assert.equal(counter.counterAttacks, undefined);
    if (t.name === 'Entwaffnende Klaue') assert.equal(result.sceneItemEvents?.[0]?.sourceActorId, actor.characterId);
    if (t.name === 'Erstickte Antwort') assert.ok(result.actorConditionSnapshot.after.some(c => c.blockedResource === 'reaction'));
    if (t.name === 'Brechender Widerhall') assert.ok(result.actorConditionSnapshot.after.some(c => c.blockedResource === 'action'));
  });
}

test('A hit does not trigger the counter', async () => {
  const { profile } = await prepare('Gildas Gafyr', 'Lauernde Klaue');
  const result = await new CombatResolutionService(receipts([19])).resolveAttack({ actor: fighter('Asgeir Wolfshorn'), target: profile });
  assert.equal(result.counterAttacks, undefined);
  assert.ok(result.targetConditionSnapshot?.after?.some(c => c.counterAttack) ?? profile.temporaryConditions.some(c => c.counterAttack));
});

test('Prepared +2 and advantage are consumed on the next attack, including a miss', async () => {
  for (const ability of ['Gesammelter Blick', 'Täuschende Klaue']) {
    const actor = actorFor('Gildas Gafyr', ability);
    const target = ability === 'Gesammelter Blick' ? actor : { ...fighter('Asgeir Wolfshorn'), totalDefense: 10 };
    const prepared = await new CombatResolutionService(receipts()).resolveAttack({ actor, target });
    const conditions = (ability === 'Gesammelter Blick' ? prepared.targetConditionSnapshot : prepared.actorConditionSnapshot).after;
    const ready = overlayCombatHitPointState(fighter('Gildas Gafyr'), { temporaryConditions: conditions });
    const first = await new CombatResolutionService(receipts([2])).resolveAttack({ actor: ready, target: fighter('Asgeir Wolfshorn') });
    assert.equal(first.attack.hit, false);
    const baseline = await new CombatResolutionService(receipts([2])).resolveAttack({ actor: fighter('Gildas Gafyr'), target: fighter('Asgeir Wolfshorn') });
    assert.equal(first.attack.modifier - baseline.attack.modifier, ability === 'Gesammelter Blick' ? 2 : 0);
    assert.equal(first.attack.rollMode, ability === 'Gesammelter Blick' ? 'normal' : 'advantage');
    assert.equal(first.actorConditionSnapshot.after.length, 0);
  }
});

test('Gleitende Schuppe imposes disadvantage on only the next incoming attack', async () => {
  const { profile } = await prepare('Gildas Gafyr', 'Gleitende Schuppe');
  const result = await new CombatResolutionService(receipts([2])).resolveAttack({ actor: fighter('Asgeir Wolfshorn'), target: profile });
  assert.equal(result.attack.rollMode, 'disadvantage');
  assert.equal(result.targetConditionSnapshot.after.length, 0);
});

test('A self stance does not consume the prepared attack bonus', async () => {
  const { profile } = await prepare('Gildas Gafyr', 'Gesammelter Blick');
  const actor = overlayCombatHitPointState(actorFor('Gildas Gafyr', 'Geschuppte Deckung'), { temporaryConditions: profile.temporaryConditions });
  const guarded = await new CombatResolutionService(receipts()).resolveAttack({ actor, target: actor });
  assert.ok(guarded.targetConditionSnapshot.after.some(c => c.name === 'Gesammelter Blick'));
});

for (const [ability, resource] of [['Gebundene Klaue','reaction'], ['Unruhiger Griff','bonus-action'], ['Stäubende Schwinge','bonus-action'], ['Drachenklammer','action']]) {
  test(`${ability}: save failure blocks only the named resource, successful save prevents it`, async () => {
    const actor = actorFor('Gildas Gafyr', ability), target = { ...fighter('Asgeir Wolfshorn'), totalDefense: 10 };
    const failed = await new CombatResolutionService(receipts([19],1)).resolveAttack({ actor, target });
    const affected = overlayCombatHitPointState(target, { temporaryConditions: failed.targetConditionSnapshot.after });
    if (ability === 'Stäubende Schwinge') {
      assert.equal(affected.movement, target.movement);
      assert.equal(affected.attackModifier, target.attackModifier);
      assert.equal(failed.targetConditionSnapshot.applied.mechanics.movement, 0);
      assert.equal(failed.targetConditionSnapshot.applied.mechanics.attackRollMode, 'normal');
    }
    for (const id of ['action','reaction','bonus-action']) assert.equal(affected.resources.find(r => r.id === id).current, id === resource ? 0 : 1);
    const passed = await new CombatResolutionService(receipts([19],20)).resolveAttack({ actor, target });
    assert.equal(passed.targetConditionSnapshot, null);
  });
}

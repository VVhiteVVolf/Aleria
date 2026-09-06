import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { database, commitAction, undo } from './combat-test-context.mjs';

after(() => database.terminate());
const partyDefinitions = [
  { key: 'gildas', slug: 'gildas-gafyr', level: 8, team: 'one' },
  { key: 'gawain', slug: 'gawain-draig', team: 'two' },
  { key: 'fenrir', slug: 'fenrir-varulv', team: 'two' }
];
const lesson = 'technique:combat-style-drachentanz-jungdrache-06-sechsfacher-lehrhieb';
const profile = async (party, key) => (await party.snapshot()).profiles.get(key);

test('aura empowers the highest die once, pays only focus and undo restores the complete post', async () => {
  const party = await createCombatParty(partyDefinitions);
  const before = await profile(party, 'gildas');
  const prepared = await party.prepare({ actor: 'gildas', targets: ['gawain'], actionId: lesson, paymentMode: 'aura' });
  assert.equal(prepared.segment.combatResolution.damage.diceResults.length, 4);
  const posted = await party.commit(prepared);
  const after = await profile(party, 'gildas');
  for (const id of ['action', 'reaction', 'bonus-action', 'special-action']) {
    assert.equal(after.resources.find(resource => resource.id === id).current, before.resources.find(resource => resource.id === id).current, id);
  }
  assert.equal(after.resources.find(resource => resource.id === 'aura-focus').current, 0);
  await undo(posted.id);
  assert.equal((await profile(party, 'gildas')).resources.find(resource => resource.id === 'aura-focus').current, 1);
  assert.equal((await profile(party, 'gawain')).currentHitPoints, 49);
});

test('server rejects missing aura dice and recalculates forged totals from valid dice', async () => {
  const party = await createCombatParty(partyDefinitions);
  const missing = await party.prepare({ actor: 'gildas', targets: ['gawain'], actionId: lesson, paymentMode: 'aura' });
  missing.payload.metadata.commentSegments[0].combatResolution.damage.diceResults.pop();
  await assert.rejects(() => commitAction(missing.payload), /Würfelergebnisse/);
  assert.equal((await profile(party, 'gawain')).currentHitPoints, 49);
  const forged = await party.prepare({ actor: 'gildas', targets: ['gawain'], actionId: lesson, paymentMode: 'aura' });
  const expected = forged.segment.combatResolution.damage.total;
  forged.payload.metadata.commentSegments[0].combatResolution.damage.total = 999;
  const result = await commitAction(forged.payload);
  assert.equal(result.mechanics.commentSegments[0].combatResolution.damage.total, expected);
  await party.assertConsistent();
});

test('aura area attack empowers both target rolls while focus is consumed once', async () => {
  const party = await createCombatParty(partyDefinitions);
  const result = await party.commit(await party.prepare({ actor: 'gildas', targets: ['gawain', 'fenrir'],
    actionId: 'technique:combat-style-drachentanz-jungdrache-04-schweifkreis', paymentMode: 'aura' }));
  const attacks = result.mechanics.commentSegments[0].combatResolutions;
  assert.equal(attacks.length, 2);
  assert(attacks.every(attack => attack.damage.diceResults.length === 4));
  assert.equal(attacks.flatMap(attack => attack.resourceCosts).filter(cost => cost.resourceId === 'aura-focus').length, 1);
  assert.equal((await profile(party, 'gildas')).resources.find(resource => resource.id === 'special-action').current, 3);
});

test('the new guard grants defense without damage, refreshes without stacking and expires after an own post', async () => {
  const party = await createCombatParty(partyDefinitions);
  const guard = () => party.prepare({ actor: 'gildas', targets: ['gildas'], actionId: 'technique:combat-style-drachentanz-jungdrache-geschlossene-schuppe' });
  for (let i = 0; i < 2; i++) {
    const result = await party.commit(await guard());
    assert.equal(result.mechanics.commentSegments[0].combatResolution.damage, null);
    assert.equal((await profile(party, 'gildas')).totalDefense, 18);
  }
  await party.commit(await party.prepare({ actor: 'gildas', targets: ['gildas'], actionId: 'combat:wait' }));
  assert.equal((await profile(party, 'gildas')).totalDefense, 16);
});

test('elite aura techniques keep their budget under substitute payment without another extra die', async () => {
  const party = await createCombatParty([{ key: 'duncan', slug: 'duncan-gafyr', team: 'one' }, ...partyDefinitions.slice(1)]);
  const args = { actor: 'duncan', targets: ['fenrir'], actionId: 'technique:combat-style-drachentanz-letzte-oeffnung' };
  const regular = await party.prepare(args);
  const aura = await party.prepare({ ...args, paymentMode: 'aura' });
  assert.equal(aura.segment.combatResolution.damage.total, regular.segment.combatResolution.damage.total);
  assert.equal(aura.segment.combatResolution.damage.diceResults.length, regular.segment.combatResolution.damage.diceResults.length);
  await party.commit(aura);
});

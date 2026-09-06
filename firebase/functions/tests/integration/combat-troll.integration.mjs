import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { database, undo, commitAction, threadId } from './combat-test-context.mjs';
import { prepareTrollSimulation, simulateTrollFight } from '../../../../AleriaAlmanach/tests/support/troll-simulation.mjs';

after(() => database.terminate());
const definitions = [
  { key: 'fenrir', slug: 'fenrir-varulv', team: 'heroes' },
  { key: 'freya', slug: 'freya-skald', team: 'heroes' },
  { key: 'guinevere', slug: 'guinevere-neidr', team: 'heroes' },
  { key: 'gawain', slug: 'gawain-draig', team: 'heroes' },
  { key: 'troll', creature: 'catalog-troll', team: 'trolls' }
];
const getProfile = async (party, key) => (await party.snapshot()).profiles.get(key);
const wait = (party, actor = 'troll', priorSegments = []) => party.prepare({ actor, targets: [actor], actionId: 'combat:wait', priorSegments });

test('Trollblut: authoritative healing once per post, next post, undo and unchanged template', async () => {
  const party = await createCombatParty(definitions.map(entry => entry.key === 'troll' ? { ...entry, hitPoints: 70 } : entry));
  const before = await getProfile(party, 'troll');
  const first = await wait(party);
  const second = await wait(party, 'troll', [first.segment]);
  assert.equal(first.segment.combatResolution.turnStart.restored, 16);
  assert.equal(second.segment.combatResolution.turnStart, undefined);
  const posted = await party.commit(second);
  assert.equal((await getProfile(party, 'troll')).currentHitPoints, before.currentHitPoints + 16);
  const next = await party.commit(await wait(party));
  assert.equal((await getProfile(party, 'troll')).currentHitPoints, before.currentHitPoints + 32);
  await undo(next.id);
  assert.equal((await getProfile(party, 'troll')).currentHitPoints, before.currentHitPoints + 16);
  await undo(posted.id);
  assert.equal((await getProfile(party, 'troll')).currentHitPoints, before.currentHitPoints);
  await party.assertConsistent();
});

test('Keulenbogen: four individual CON saves, pay once, stun expires after skipped own post', async () => {
  const party = await createCombatParty(definitions);
  const prepared = await party.prepare({ actor: 'troll', targets: ['fenrir', 'gawain', 'guinevere', 'freya'],
    actionId: 'technique:troll-sweeping-club', natural: 20 });
  const result = await party.commit(prepared);
  const resolutions = result.mechanics.commentSegments[0].combatResolutions;
  assert.equal(resolutions.length, 4);
  assert(resolutions.every(resolution => resolution.secondarySaves.length === 1));
  assert.equal((await getProfile(party, 'troll')).resources.find(resource => resource.id === 'special-action').current, 3);
  const stunned = ['gawain', 'guinevere', 'freya'].find(key => resolutions.some(resolution => resolution.targetId === party.byKey.get(key).id && resolution.targetConditionSnapshot?.applied));
  assert(stunned, 'At least one low-CON hero fails the fixed save');
  await assert.rejects(() => party.prepare({ actor: stunned, targets: ['troll'] }), /betäubt/);
  await party.commit(await wait(party, stunned));
  assert(!(await getProfile(party, stunned)).temporaryConditions.some(condition => condition.mechanics?.blocksActions));
  await party.prepare({ actor: stunned, targets: ['troll'] });
  await party.assertConsistent();
});

test('Fire exposure suppresses one turn, reduces defense, expires, and undo restores it', async () => {
  const party = await createCombatParty(definitions);
  const hero = await party.record('guinevere');
  const weapons = hero.combatProfile.weapons.map(weapon => ({ ...weapon, damageType: 'Feuer' }));
  await database.collection('characters').doc(hero.id).update({ 'combatProfile.weapons': weapons });
  await party.commit(await party.prepare({ actor: 'guinevere', targets: ['troll'], natural: 15 }));
  const burning = await getProfile(party, 'troll');
  assert.equal(burning.totalDefense, 12);
  assert(burning.temporaryConditions.some(condition => condition.name === 'Verbrannt'));
  const skipped = await party.commit(await wait(party));
  assert.equal(skipped.mechanics.commentSegments[0].combatResolution.turnStart.suppressed, true);
  assert.equal((await getProfile(party, 'troll')).currentHitPoints, burning.currentHitPoints);
  assert.equal((await getProfile(party, 'troll')).totalDefense, 14);
  await undo(skipped.id);
  assert.equal((await getProfile(party, 'troll')).totalDefense, 12);
});

test('Server recalculates forged regeneration amounts and snapshots from the validated die', async () => {
  const party = await createCombatParty(definitions.map(entry => entry.key === 'troll' ? { ...entry, hitPoints: 50 } : entry));
  const prepared = await wait(party);
  for (const resolution of prepared.payload.metadata.commentSegments.flatMap(segment => segment.combatResolutions || [segment.combatResolution])) {
    resolution.turnStart.restored = 999;
    resolution.actorHitPointSnapshot.after.current = 999;
  }
  const posted = await commitAction(prepared.payload);
  assert.equal(posted.mechanics.commentSegments[0].combatResolution.turnStart.restored, 16);
  assert.equal((await getProfile(party, 'troll')).currentHitPoints, 66);
});

test('Creature attacks accept stale hand metadata and use their own attack and defense costs', async () => {
  const party = await createCombatParty(definitions);
  const first = await party.prepare({ actor: 'troll', targets: ['gawain'], actionId: 'weapon:troll-boulder', natural: 15,
    loadout: { rightWeaponId: 'old-character-sword', leftWeaponId: 'old-character-dagger' } });
  const second = await party.prepare({ actor: 'troll', targets: ['troll'], actionId: 'ability:troll-hide-guard', priorSegments: [first.segment] });
  await party.commit(second);
  const troll = await getProfile(party, 'troll');
  assert.equal(troll.resources.find(resource => resource.id === 'bonus-action').current, 0);
  assert.equal(troll.resources.find(resource => resource.id === 'reaction').current, 0);
  assert.equal(troll.totalDefense, 16);
  assert.equal(troll.temporaryConditions.filter(condition => condition.sourceConditionId === 'troll-hide-guard').length, 1);
});

test('Keulenbogen rejects a fifth target without changing scene state', async () => {
  const party = await createCombatParty([...definitions, { key: 'observer', creature: 'catalog-schwarzer-zitteraal-raubritter', team: 'heroes' }]);
  const prepared = await party.prepare({ actor: 'troll', targets: ['fenrir', 'gawain', 'guinevere', 'freya', 'observer'],
    actionId: 'technique:troll-sweeping-club', natural: 15 });
  await assert.rejects(() => commitAction(prepared.payload), /höchstens 4 Ziele/);
  assert.equal((await getProfile(party, 'troll')).resources.find(resource => resource.id === 'special-action').current, 4);
  assert.equal((await getProfile(party, 'gawain')).currentHitPoints, 49);
});

test('Complete seeded group fight agrees with authoritative transactions and replay after every post', async () => {
  const party = await createCombatParty(definitions);
  const prepared = prepareTrollSimulation({}, party.actors);
  let posts = 0;
  const result = await simulateTrollFight(prepared, 81000, { onPost: async ({ actor, round, segments, state }) => {
    const committed = await commitAction({ entryId: threadId, charName: actor.name,
      text: `Testrunde ${round}: ${actor.name}.`, metadata: { characterId: actor.id, commentSegments: segments } });
    assert.equal(committed.mechanics.commentSegments.length, segments.length);
    const snapshot = await party.snapshot();
    for (const record of party.actors) {
      const expected = state.get(record.id);
      const actual = snapshot.profiles.get(record.testKey);
      assert.equal(actual.currentHitPoints, expected.current, `Runde ${round}, ${record.name}: Server-LP`);
      assert.equal(actual.temporaryHitPoints, expected.temporary, `${record.name}: temporäre LP`);
      if (record.testKey === 'guinevere') assert.equal(
        actual.inventory.items.find(item => item.id === 'guinevere-arrows-standard')?.quantity,
        expected.inventory.items.find(item => item.id === 'guinevere-arrows-standard')?.quantity,
        'Guinevere: Server-Munitionsverbrauch');
    }
    await party.assertConsistent();
    posts++;
  } });
  assert.notEqual(result.winner, 'draw');
  assert(posts > 10);
  console.log(JSON.stringify({ trollGeneralRehearsal: result, verifiedPosts: posts }));
});

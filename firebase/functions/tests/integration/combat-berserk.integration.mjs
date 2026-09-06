import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createCombatParty } from './combat-party-context.mjs';
import { database, history, request, threadId, encounter, active, undo, commitAction } from './combat-test-context.mjs';
import { commitNarrativeComment } from '../../src/comments/commit-narrative-comment.js';
import { prepareInventoryUse, applyInventoryUseAbilityEffects } from '../../../../AleriaAlmanach/modules/inventory-use/inventory-use-model.js';

after(() => database.terminate());
const definitions = [
  { key: 'fenrir', slug: 'fenrir-varulv', team: 'north' },
  { key: 'gawain', slug: 'gawain-draig', team: 'south' },
  { key: 'freya', slug: 'freya-skald', team: 'north' }
];
const profile = async (party, key) => (await party.snapshot()).profiles.get(key);
const mode = profile => profile.temporaryConditions.find(condition => condition.berserk);
const activate = party => party.prepare({ actor: 'fenrir', targets: ['fenrir'], actionId: 'ability:fenrir-berserkergang' }).then(party.commit);
async function addMushrooms(party, key = 'gawain') {
  const actor = await party.record(key);
  await database.collection('characters').doc(actor.id).update({ inventory: { ...actor.inventory,
    items: [...(actor.inventory.items || []), { id: 'test-zornkappe', name: 'Zornkappe', type: 'Pilz', quantity: '4' }] } });
}
async function consumption(party, key = 'gawain') {
  const actor = await party.record(key);
  const use = prepareInventoryUse({ character: actor, itemId: 'test-zornkappe', quantity: 1 });
  return { kind: 'consume', actorId: actor.id, characterId: actor.id, charName: actor.name,
    inventoryUse: applyInventoryUseAbilityEffects(await profile(party, key), use).inventoryUse, text: 'Zornkappe essen.' };
}
async function consume(party, key = 'gawain') {
  const segment = await consumption(party, key);
  return commitAction({ entryId: threadId, text: segment.text, charName: segment.charName,
    metadata: { characterId: segment.actorId, commentSegments: [segment] } });
}

test('authoritative berserk: attack and full quiet-post lifecycle, charges and undo', async () => {
  const party = await createCombatParty(definitions);
  const before = await profile(party, 'fenrir');
  const activation = await activate(party);
  assert.equal(mode(await profile(party, 'fenrir')).berserk.survivalCharges, 1);
  await undo(activation.id);
  assert.equal(mode(await profile(party, 'fenrir')), undefined);
  await activate(party);
  await party.commit(await party.prepare({ actor: 'fenrir', targets: ['gawain'], natural: 1 }));
  assert.ok(mode(await profile(party, 'fenrir')), 'a miss still counts as attacking');
  const actor = party.byKey.get('fenrir');
  await commitNarrativeComment.run(request({ entryId: threadId, text: 'Fenrir wartet.', charName: actor.name,
    metadata: { characterId: actor.id, commentSegments: [{ kind: 'speech', characterId: actor.id, text: 'Warten.' }] } }));
  const quiet = await profile(party, 'fenrir');
  assert.equal(mode(quiet), undefined);
  assert.equal(quiet.totalDefense, before.totalDefense);
  await assert.rejects(() => activate(party), /keine Nutzung/);
});

test('authoritative lethal hits rescue once, then defeat; undo restores the unused charge', async () => {
  const party = await createCombatParty(definitions.map(entry => entry.key === 'fenrir' ? { ...entry, hitPoints: 1 } : entry));
  await activate(party);
  const first = await party.commit(await party.prepare({ actor: 'gawain', targets: ['fenrir'], natural: 20 }));
  assert.equal((await profile(party, 'fenrir')).currentHitPoints, 1);
  assert.equal(mode(await profile(party, 'fenrir')).berserk.survivalCharges, 0);
  await undo(first.id);
  assert.equal(mode(await profile(party, 'fenrir')).berserk.survivalCharges, 1);
  await party.commit(await party.prepare({ actor: 'gawain', targets: ['fenrir'], natural: 20 }));
  await party.commit(await party.prepare({ actor: 'gawain', targets: ['fenrir'], natural: 20 }));
  assert.equal((await profile(party, 'fenrir')).currentHitPoints, 0);
});

test('inventory consumption enforces all mushroom tiers, cap, combat cleanup and undo', async () => {
  const party = await createCombatParty(definitions);
  await addMushrooms(party);
  const before = await profile(party, 'gawain');
  const first = await consume(party);
  assert.equal((await profile(party, 'gawain')).totalDefense, before.totalDefense - 2);
  await undo(first.id);
  assert.equal((await party.record('gawain')).inventory.items.find(item => item.id === 'test-zornkappe').quantity, '4');
  assert.equal((await profile(party, 'gawain')).totalDefense, before.totalDefense);
  for (const bonus of [2, 4, 8]) {
    await consume(party);
    const current = await profile(party, 'gawain');
    assert.equal(current.damageModifier, before.damageModifier + bonus);
    assert.equal(current.attackModifier, before.attackModifier);
    assert.equal(current.totalDefense, before.totalDefense - bonus);
  }
  await assert.rejects(() => consume(party), /drei/);
  const forged = prepareInventoryUse({ character: await party.record('gawain'), itemId: 'test-zornkappe' });
  forged.conditionSnapshot = { before: [], after: [] };
  await assert.rejects(() => commitAction({ entryId: threadId, text: 'Vierter Pilz', metadata: { characterId: forged.actorId,
    commentSegments: [{ kind: 'consume', actorId: forged.actorId, inventoryUse: forged, text: 'Vierter Pilz' }] } }), /drei/);
  assert.equal((await party.record('gawain')).inventory.items.find(item => item.id === 'test-zornkappe').quantity, '1');
  const fight = await active();
  await encounter({ encounterId: fight.encounterId, operation: 'end', expectedRevision: fight.revision, outcome: 'draw', endReason: 'agreement', participants: [] });
  assert.equal((await profile(party, 'gawain')).totalDefense, before.totalDefense);
});

test('a later mushroom never changes an earlier attack; prior consumption affects the next section', async () => {
  const party = await createCombatParty(definitions);
  await addMushrooms(party);
  const attack = await party.prepare({ actor: 'gawain', targets: ['fenrir'] });
  const originalDamage = attack.segment.combatResolution.damage.total;
  attack.payload.metadata.commentSegments.push(await consumption(party));
  const committed = await commitAction(attack.payload);
  assert.equal(committed.mechanics.commentSegments[0].combatResolution.damage.total, originalDamage);
  const next = await party.prepare({ actor: 'gawain', targets: ['fenrir'], priorSegments: [await consumption(party)] });
  const result = await commitAction(next.payload);
  assert.equal(result.mechanics.commentSegments[1].combatResolution.damage.total, originalDamage + 4);
});

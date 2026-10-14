import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { actors, scenarios } from '../../../../AleriaAlmanach/tests/support/herausforderung-scenarios.mjs';
import { commitHerausforderung } from '../../src/mechanics/commit-herausforderung.js';
import { commitSkillComment } from '../../src/mechanics/commit-skill-comment.js';
import { commitCombatCommentOperation } from '../../src/mechanics/commit-combat-comment.js';
import { STANDARD_ITEMS } from '../../src/generated/item-register/item-register-standard.js';
import { collectHerausforderungApproaches } from '../../../../AleriaAlmanach/modules/herausforderung/herausforderung-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { SkillResolutionService } from '../../../../AleriaAlmanach/modules/skill-checks/skill-resolution-service.js';
import { moneyTotal } from '../../../../AleriaAlmanach/modules/item-register/item-register-money.js';
import { buildOwnedItems } from '../../../../AleriaAlmanach/modules/item-register/item-register-model.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8186') throw Error('Only the dedicated local Firestore emulator at 127.0.0.1:8186 is allowed.');
initializeApp({ projectId: 'demo-aleria-herausforderung' });
const database = getFirestore();
const auth = { uid: 'isolated-challenge-tester', token: { aleriaRole: 'admin' } };
const weapon = STANDARD_ITEMS.find(item => item.category === 'waffen' && item.combatDefinition);
const supply = STANDARD_ITEMS.find(item => !['pferde', 'vieh', 'waffen', 'ruestungen'].includes(item.category));
const reports = [];
const runId = randomUUID().slice(0, 8);
let fullInventoryPassed = false, simultaneousAwardPassed = false, idempotentCreationPassed = false;
after(async () => {
  await mkdir(new URL('../../../../.codex-temp/herausforderung/', import.meta.url), { recursive: true });
  await writeFile(new URL('../../../../.codex-temp/herausforderung/rewards-integration-result.json', import.meta.url), JSON.stringify({ passed: reports.length === 8 && fullInventoryPassed && simultaneousAwardPassed && idempotentCreationPassed, environment: 'isolated Firestore emulator', fullInventoryPassed, simultaneousAwardPassed, idempotentCreationPassed, results: reports }, null, 2));
  await database.terminate();
});
const history = async thread => sortSceneHistory((await database.collection('comments').where('entryId', '==', thread).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
const effect = (id, kind, mechanics, durationKind = 'actor-comments') => ({ effectId: id, name: kind === 'buff' ? 'Torermut' : 'Verunsichert', kind, durationKind, durationAmount: 2, mechanics });

async function attempt(thread, actor, origin, scenario, natural) {
  const comments = await history(thread);
  const record = (await database.collection('characters').doc(actor.id).get()).data();
  const profile = overlayCombatHitPointState(resolveCombatProfile(record), deriveCombatStateFromComments(comments).get(actor.id));
  const challenge = collectHerausforderungApproaches([origin])[0];
  const resolution = await new SkillResolutionService({ rollSkill: async ({ modifier, rollMode }) => ({ natural, total: natural + modifier, dice: rollMode === 'normal' ? [natural] : [natural, natural], keptDice: [natural] }) }).resolve({ actor: record, actorPersistence: { kind: 'character', recordId: actor.id }, settings: { skillId: scenario.skillId }, challenge }, { actorProfile: profile, opposedDifficulty: null });
  return (scenario.id === 'runes' ? commitCombatCommentOperation : commitSkillComment.run)({ auth: { uid: 'isolated-player-' + actor.id, token: { aleriaRole: 'player' } }, data: { entryId: thread, text: `${actor.name} versucht ${scenario.label}.`, charName: actor.name, metadata: { characterId: actor.id, commentSegments: [{ kind: scenario.kind, commentKind: scenario.kind, characterId: actor.id, text: 'Ein Versuch.', skillId: scenario.skillId, skillTargetChallengeId: challenge.id, skillResolution: { ...resolution, herausforderungReward: { copper: 999 } } }] } } });
}

for (const scenario of scenarios) for (const [index, source] of actors.entries()) test(`${scenario.title} · ${source.name} · atomare Inventar- und Effektvergabe`, async () => {
  const actor = structuredClone(source);
  const thread = `isolated-rewards-${runId}-${scenario.id}-${index}`;
  const actorRef = database.collection('characters').doc(actor.id);
  await actorRef.set(actor);
  const historical = { entryId: thread, text: 'Ein früherer Beitrag bleibt unverändert.', charName: actor.name, characterId: actor.id, serverCommitted: true, createdAtClient: 1, orderKey: 1 };
  const oldRef = database.collection('comments').doc(`old-${scenario.id}-${index}`);
  await oldRef.set(historical);
  const successful = ['erfolg', 'kritischer-erfolg'].includes(scenario.tier);
  const product = scenario.id === 'runes' ? supply : weapon;
  const quantity = scenario.id === 'runes' ? 2 : 1;
  const rewards = successful ? { copper: scenario.id === 'runes' ? 7 : 2, items: [{ template: product.id, quantity }], effects: [effect('buff', 'buff', scenario.id === 'runes' ? { armorClass: 2 } : { skill: 1 }, scenario.id === 'runes' ? 'long-rest' : 'actor-comments')] } : {};
  const penalties = { effects: [effect('debuff', 'debuff', scenario.id === 'bridge' ? { skillRollMode: 'disadvantage', armorClass: -1 } : { skill: -1 })] };
  const created = await commitHerausforderung.run({ auth, data: { entryId: thread, text: scenario.title, metadata: { orderKey: 2, herausforderung: { title: scenario.title, publicDescription: scenario.description, approaches: [{ ...scenario, approachId: 'main', preferredSkills: scenario.preferredSkills || [scenario.skillId], rewards, partialEffects: scenario.tier === 'knapp' ? penalties : {}, failureEffects: scenario.tier === 'deutlich' ? penalties : {} }] } } } });
  const origin = { id: created.id, ...(await database.collection('comments').doc(created.id).get()).data() };
  const beforeMoney = moneyTotal(actor.inventory.moneyState || actor.inventory.money || {});
  const result = await attempt(thread, actor, origin, scenario, scenario.natural[index]);
  const resolution = result.mechanics.commentSegments[0].skillResolution;
  assert.equal(resolution.herausforderungTier, scenario.tier);
  assert.equal(resolution.herausforderungReward.copper, successful ? rewards.copper : 0);
  assert.equal(resolution.herausforderungReward.effects.length, 1);
  const record = (await actorRef.get()).data();
  assert.equal(record.id, source.id);
  assert.deepEqual(record.combatProfile.hitPoints, actor.combatProfile.hitPoints);
  assert.deepEqual(record.combatProfile.resources, actor.combatProfile.resources);
  assert.deepEqual(record.inventory.items.slice(0, actor.inventory.items.length), actor.inventory.items);
  assert.equal(moneyTotal(record.inventory.moneyState || record.inventory.money || {}), beforeMoney + (successful ? rewards.copper : 0));
  const states = deriveCombatStateFromComments(await history(thread));
  const active = states.get(actor.id).temporaryConditions;
  assert.equal(active.length, 1);
  assert.equal(active[0].durationModel.kind, successful && scenario.id === 'runes' ? 'long-rest' : 'actor-comments');
  if (successful) {
    assert.equal(record.inventory.items.length, actor.inventory.items.length + 1);
    const item = record.inventory.items.at(-1);
    assert.equal(item.name, product.title);
    assert.equal(Number(item.quantity), quantity);
    assert.equal(item.image, product.image);
    assert.equal(item.ownerCharacterId, actor.id);
    assert.ok(buildOwnedItems([record], STANDARD_ITEMS).some(row => row.instanceId === item.instanceId));
    await assert.rejects(attempt(thread, actor, origin, scenario, 20), /nicht mehr auflösbar|bereits aufgelöst/);
  } else {
    const retry = await attempt(thread, actor, origin, scenario, scenario.id === 'tracks' ? scenario.natural[index] + 1 : 5);
    assert.equal(retry.mechanics.commentSegments[0].skillResolution.herausforderungReward.alreadyApplied, true);
    assert.equal(deriveCombatStateFromComments(await history(thread)).get(actor.id).temporaryConditions.length, 1);
    assert.deepEqual((await actorRef.get()).data().inventory, actor.inventory);
  }
  assert.deepEqual((await oldRef.get()).data(), historical);
  reports.push({ scenario: scenario.title, actor: actor.name, tier: resolution.herausforderungTier, total: resolution.total, difficulty: resolution.difficulty, reward: resolution.herausforderungReward, historicalContributionUnchanged: true });
});

test('a real transaction rejects an item reward with a full inventory without copper, claim or result writes', async () => {
  const actor = structuredClone(actors[0]);
  actor.inventory.items = Array.from({ length: 80 }, (_, i) => ({ id: `occupied-${i}`, name: 'Vorhanden', quantity: '1' }));
  await database.collection('characters').doc(actor.id).set(actor);
  const thread = `isolated-full-inventory-${runId}`;
  const scenario = scenarios[0];
  const created = await commitHerausforderung.run({ auth, data: { entryId: thread, text: scenario.title, metadata: { herausforderung: { title: scenario.title, publicDescription: scenario.description, approaches: [{ ...scenario, approachId: 'main', preferredSkills: [scenario.skillId], rewards: { copper: 5, items: [{ template: weapon.id, quantity: 1 }] } }] } } } });
  const origin = { id: created.id, ...(await database.collection('comments').doc(created.id).get()).data() };
  await assert.rejects(attempt(thread, actor, origin, scenario, 20), /80 Einträge/);
  assert.equal((await history(thread)).length, 1);
  assert.deepEqual((await database.collection('characters').doc(actor.id).get()).data(), actor);
  actor.inventory.items.pop();
  await database.collection('characters').doc(actor.id).set(actor);
  const retried = await attempt(thread, actor, origin, scenario, 20);
  assert.equal(retried.mechanics.commentSegments[0].skillResolution.herausforderungReward.copper, 5);
  fullInventoryPassed = true;
});

test('simultaneous successful attempts by Gawain and Guinevere award the same approach exactly once', async () => {
  for (const actor of actors) await database.collection('characters').doc(actor.id).set(structuredClone(actor));
  const thread = `isolated-race-${runId}`;
  const scenario = scenarios[0];
  const created = await commitHerausforderung.run({ auth, data: { entryId: thread, text: scenario.title, metadata: { herausforderung: { title: scenario.title, publicDescription: scenario.description,
    approaches: [{ ...scenario, approachId: 'main', preferredSkills: [scenario.skillId], rewards: { copper: 3, items: [{ template: weapon.id, quantity: 1 }] } }] } } } });
  const origin = { id: created.id, ...(await database.collection('comments').doc(created.id).get()).data() };
  const attempts = await Promise.allSettled(actors.map(actor => attempt(thread, actor, origin, scenario, 20)));
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(attempts.filter(result => result.status === 'rejected').length, 1);
  const winner = attempts.find(result => result.status === 'fulfilled').value.mechanics.commentSegments[0].skillResolution.actorId;
  for (const actor of actors) {
    const record = (await database.collection('characters').doc(actor.id).get()).data();
    const isWinner = actor.id === winner;
    assert.equal(record.inventory.items.length, actor.inventory.items.length + (isWinner ? 1 : 0));
    assert.equal(moneyTotal(record.inventory.moneyState || record.inventory.money || {}), moneyTotal(actor.inventory.moneyState || actor.inventory.money || {}) + (isWinner ? 3 : 0));
  }
  assert.equal((await history(thread)).filter(comment => comment.skillTransaction).length, 1);
  simultaneousAwardPassed = true;
});

test('retrying challenge creation uses the same identity and rejects altered content for that operation', async () => {
  const thread = `isolated-create-retry-${runId}`;
  const input = { entryId: thread, text: 'Belohnung', metadata: { operationId: randomUUID(), herausforderung: { publicDescription: 'Eine Aufgabe.', approaches: [{ approachId: 'retry', preferredSkills: ['insight'], insight: 'Lösung', rewards: { copper: 1 } }] } } };
  const first = await commitHerausforderung.run({ auth, data: input });
  const second = await commitHerausforderung.run({ auth, data: input });
  assert.equal(first.id, second.id);
  assert.equal((await history(thread)).length, 1);
  const changed = structuredClone(input);
  changed.metadata.herausforderung.approaches[0].rewards.copper = 2;
  await assert.rejects(commitHerausforderung.run({ auth, data: changed }), /anderem Inhalt/);
  idempotentCreationPassed = true;
});

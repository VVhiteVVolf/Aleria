import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitHerausforderung } from '../../src/mechanics/commit-herausforderung.js';
import { commitSkillComment } from '../../src/mechanics/commit-skill-comment.js';
import { commitCombatCommentOperation } from '../../src/mechanics/commit-combat-comment.js';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';
import { resolveCombatProfile } from '../../src/generated/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../src/generated/combat/combat-state-model.js';
import { getActiveCombatEncounter } from '../../src/generated/combat/combat-encounter-model.js';
import { collectHerausforderungApproaches } from '../../src/generated/herausforderung/herausforderung-model.js';
import { SkillResolutionService } from '../../src/generated/skill-checks/skill-resolution-service.js';
import { previewChallengeCombatBenefits } from '../../../../AleriaAlmanach/modules/herausforderung/herausforderung-combat-preview.js';
import { prepareTestAction, CheckupDice } from './combat-test-actions.mjs';
import { moneyTotal } from '../../src/generated/item-register/item-register-money.js';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8186') throw Error('Only the dedicated local demo Firestore emulator is allowed.');
initializeApp({ projectId: 'demo-aleria-herausforderung' });
const db = getFirestore(), run = randomUUID().slice(0, 8), admin = { uid: 'challenge-combat-narrator', token: { aleriaRole: 'admin' } };
const source = JSON.parse(await readFile(new URL('../../../../.codex-temp/herausforderung/active-duel-readonly.json', import.meta.url), 'utf8'));
const actors = JSON.parse(await readFile(new URL('../../../../.codex-temp/herausforderung/duel-profiles-readonly.json', import.meta.url), 'utf8'));
const ylva = actors.find(actor => actor.name === 'Ylva Wolfshorn'), gais = actors.find(actor => actor.name === 'Gais Wyrm'), observer = actors.find(actor => actor.name === 'Gawain Draig');
assert.ok(ylva && gais && observer);
assert.ok(getActiveCombatEncounter(source.comments)?.participants.has(ylva.id));
const passed = [];
const effect = (type, amount, extra = {}) => ({ effectId: type, type, amount, formula: '', damageType: 'Feuer', targetActorId: '', ...extra });
const status = (name, mechanics, targetActorId = '', durationKind = 'combat') => ({ effectId: name, name, kind: 'buff', mechanics, targetActorId, durationKind, durationAmount: 1 });
const history = async thread => sortSceneHistory((await db.collection('comments').where('entryId', '==', thread).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function seed(name) {
  const thread = `isolated-duel-${run}-${name}`, batch = db.batch();
  for (const actor of actors) batch.set(db.collection('characters').doc(actor.id), structuredClone(actor));
  const copied = source.comments.map(comment => ({ ...structuredClone(comment), entryId: thread }));
  for (const comment of copied) { const { id, ...data } = comment; batch.set(db.collection('comments').doc(`${run}-${name}-${id}`), data); }
  await batch.commit();
  return thread;
}
async function create(thread, config = {}) {
  const challenge = { title: 'Die offene Deckung', publicDescription: 'Gais bietet eine scheinbare Öffnung an.', audience: { mode: 'combatants', actorIds: [] }, combatBound: true,
    approaches: [{ approachId: 'trap', label: 'Die Einladung lesen', preferredSkills: ['insight'], difficulty: 15, insight: 'Gais wartet auf einen Fehlangriff.', rewards: {}, partialEffects: {}, failureEffects: {} }], ...config };
  const result = await commitHerausforderung.run({ auth: admin, data: { entryId: thread, text: challenge.title, metadata: { herausforderung: challenge, operationId: randomUUID() } } });
  const origin = { id: result.id, ...(await db.collection('comments').doc(result.id).get()).data() };
  return { origin, challenge: collectHerausforderungApproaches([origin])[0] };
}
const approachConfig = bundle => ({ approaches: [{ approachId: 'trap', label: 'Die Einladung lesen', preferredSkills: ['insight'], difficulty: 15, insight: 'Gais wartet auf einen Fehlangriff.', ...bundle }] });
async function skill(thread, challenge, actor = ylva, natural = 20) {
  const comments = await history(thread), states = deriveCombatStateFromComments(comments);
  const record = { ...(await db.collection('characters').doc(actor.id).get()).data(), id: actor.id };
  const profile = overlayCombatHitPointState(resolveCombatProfile(record), states.get(actor.id));
  const dice = new CheckupDice(10);
  let resolution = await new SkillResolutionService({ rollSkill: ({ modifier, rollMode }) => dice.rollD20(modifier, rollMode, natural) }).resolve({ actor: record,
    actorPersistence: { kind: 'character', recordId: actor.id }, settings: { skillId: 'insight' }, challenge }, { actorProfile: profile, opposedDifficulty: null });
  resolution = await previewChallengeCombatBenefits({ challenge, resolution, actors, comments, dice,
    profileResolver: { resolve: sourceActor => overlayCombatHitPointState(resolveCombatProfile(sourceActor), states.get(sourceActor.id)) } });
  return { kind: 'thought', commentKind: 'thought', characterId: actor.id, text: 'Sie prüft Gais’ Haltung.', mechanicMode: 'skill', skillId: 'insight', skillTargetChallengeId: challenge.id, skillResolution: resolution };
}
async function commit(thread, segments, actor = ylva, combined = false) {
  const request = { auth: { uid: 'challenge-combat-player-' + actor.id, token: { aleriaRole: 'player' } }, data: { entryId: thread, text: 'Ein isolierter Prüfbeitrag.', charName: actor.name, metadata: { characterId: actor.id, commentSegments: segments } } };
  return combined ? commitCombatCommentOperation(request, { database: db, rollCritical: () => 1 }) : commitSkillComment.run(request);
}

test('the real duel copy receives a combat-bound RK buff and preserves Gais’ prepared counter and past posts', async () => {
  const thread = await seed('guard'), before = await history(thread), oldHash = hash(before);
  const { origin, challenge } = await create(thread, approachConfig({ rewards: { effects: [status('Durchschaut', { armorClass: 1 })] } }));
  assert.equal(origin.herausforderung.combatContext.encounterId, getActiveCombatEncounter(before).encounterId);
  const result = await commit(thread, [await skill(thread, challenge)]);
  const current = await history(thread), state = deriveCombatStateFromComments(current), profile = overlayCombatHitPointState(resolveCombatProfile(ylva), state.get(ylva.id));
  assert.equal(profile.totalDefense, overlayCombatHitPointState(resolveCombatProfile(ylva), deriveCombatStateFromComments(before).get(ylva.id)).totalDefense + 1);
  assert.ok(state.get(gais.id).temporaryConditions.some(condition => condition.name === 'Lauernde Klaue'));
  assert.equal(hash(current.filter(comment => before.some(old => old.id === comment.id))), oldHash);
  assert.equal(result.mechanics.commentSegments[0].skillResolution.herausforderungCombatResults.length, 1);
  passed.push('live-duel-copy-buff-counter-history');
});

for (const order of ['before', 'after']) test(`a challenge buff ${order} an attack applies exactly at its segment position`, async () => {
  const thread = await seed('order-' + order);
  const { challenge } = await create(thread, approachConfig({ rewards: { effects: [status('Fokus', { attack: 2 })] } }));
  const attempt = await skill(thread, challenge);
  const prepared = await prepareTestAction({ entryId: thread, actorRecord: ylva, targetRecords: [gais], comments: await history(thread), natural: 16 });
  const baseline = prepared.segment.combatResolution.attack.modifier;
  const segments = order === 'before' ? [attempt, prepared.segment] : [prepared.segment, attempt];
  const result = await commit(thread, segments, ylva, true);
  const attack = result.mechanics.commentSegments.find(segment => segment.combatResolution).combatResolution;
  assert.equal(attack.attack.modifier, baseline + (order === 'before' ? 2 : 0));
  const replay = deriveCombatStateFromComments(await history(thread));
  assert.ok(replay.get(ylva.id).temporaryConditions.some(condition => condition.name === 'Fokus'));
  passed.push('segment-order-' + order);
});

test('fixed damage, formula healing, temp HP and mana changes persist atomically and replay identically', async () => {
  const thread = await seed('health');
  const record = { ...(await db.collection('characters').doc(ylva.id).get()).data(), id: ylva.id };
  const profile = resolveCombatProfile(record), resource = profile.resources.find(resource => resource.scope !== 'comment' && resource.maximum > 0);
  const combatEffects = [effect('damage', 7), effect('healing', 0, { formula: '1W4+2' }), effect('temporary-hit-points', 6)];
  if (resource) combatEffects.push(effect('spend-resource', 1, { resourceId: resource.id }));
  const { challenge } = await create(thread, approachConfig({ rewards: { copper: 2.5, combatEffects } }));
  const attempt = await skill(thread, challenge);
  const before = deriveCombatStateFromComments(await history(thread)).get(ylva.id)?.current ?? profile.currentHitPoints;
  attempt.skillResolution.herausforderungCombatSnapshots = [{ actorId: gais.id, after: { current: 0 } }];
  const result = await commit(thread, [attempt]);
  const resolution = result.mechanics.commentSegments[0].skillResolution;
  const saved = (await db.collection('characters').doc(ylva.id).get()).data(), replay = deriveCombatStateFromComments(await history(thread)).get(ylva.id);
  assert.equal(saved.combatProfile.hitPoints.current, before - 3); // 7 fire damage, 1W4+2 = 4 healing.
  assert.equal(saved.combatProfile.hitPoints.temporary, 6);
  assert.equal(replay.current, saved.combatProfile.hitPoints.current);
  assert.equal(replay.temporary, 6);
  assert.equal(moneyTotal(saved.inventory.moneyState), moneyTotal(record.inventory.moneyState || record.inventory.money || {}) + 2.5);
  assert.equal(resolution.herausforderungCombatResults[1].amount, 4);
  assert.notEqual((await db.collection('characters').doc(gais.id).get()).data().combatProfile.hitPoints.current, 0);
  passed.push('damage-healing-temp-resources-tamper');
});

test('an explicitly selected opponent receives a debuff and direct damage, while the actor remains unchanged', async () => {
  const thread = await seed('recipient');
  const before = deriveCombatStateFromComments(await history(thread));
  const { challenge } = await create(thread, approachConfig({ rewards: { effects: [{ ...status('Ablenkung', { attack: -1 }, gais.id), kind: 'debuff' }], combatEffects: [effect('damage', 5, { targetActorId: gais.id })] } }));
  await commit(thread, [await skill(thread, challenge)]);
  const state = deriveCombatStateFromComments(await history(thread));
  assert.equal(state.get(gais.id).current, before.get(gais.id).current - 5);
  assert.ok(state.get(gais.id).temporaryConditions.some(c => c.name === 'Ablenkung' && c.statusKind === 'debuff'));
  assert.ok(!state.get(ylva.id)?.temporaryConditions?.some(c => c.name === 'Ablenkung'));
  passed.push('opponent-debuff-damage');
});

test('explicit removal of a prepared counter takes effect before the following attack', async () => {
  const thread = await seed('remove');
  const counter = deriveCombatStateFromComments(await history(thread)).get(gais.id).temporaryConditions.find(c => c.name === 'Lauernde Klaue');
  const { challenge } = await create(thread, approachConfig({ rewards: { combatEffects: [effect('remove-condition', 0, { targetActorId: gais.id, conditionId: counter.id })] } }));
  const attempt = await skill(thread, challenge), prepared = await prepareTestAction({ entryId: thread, actorRecord: ylva, targetRecords: [gais], comments: await history(thread), natural: 1 });
  const result = await commit(thread, [attempt, prepared.segment], ylva, true);
  assert.equal(result.mechanics.commentSegments[1].combatResolution.counterAttacks?.length || 0, 0);
  assert.ok(!deriveCombatStateFromComments(await history(thread)).get(gais.id).temporaryConditions.some(c => c.id === counter.id));
  passed.push('explicit-counter-removal');
});

test('all scene participants can attempt, combatants exclude observers, and selected people exclude other fighters', async () => {
  const thread = await seed('audience');
  let created = await create(thread, { audience: { mode: 'all', actorIds: [] } });
  await commit(thread, [await skill(thread, created.challenge, observer)], observer);
  created = await create(thread, { audience: { mode: 'combatants', actorIds: [] } });
  const outsider = await skill(thread, { ...created.challenge, audience: { mode: 'all' } }, observer);
  await assert.rejects(commit(thread, [outsider], observer), /aktive Teilnehmer/);
  created = await create(thread, { audience: { mode: 'selected', actorIds: [ylva.id] } });
  const wrong = await skill(thread, { ...created.challenge, audience: { mode: 'all' } }, gais);
  await assert.rejects(commit(thread, [wrong], gais), /andere Figuren/);
  await commit(thread, [await skill(thread, created.challenge)]);
  passed.push('all-combatants-selected');
});

test('a bound challenge cannot be used after its fight ends or in a subsequent fight', async () => {
  const thread = await seed('binding');
  const { challenge } = await create(thread), attempt = await skill(thread, challenge);
  const encounter = getActiveCombatEncounter(await history(thread));
  await db.collection('comments').doc().set({ entryId: thread, orderKey: Date.now() + 1000, serverValidatedMechanics: true, combatEncounter: { operation: 'end', encounterId: encounter.encounterId, participants: [] } });
  await assert.rejects(commit(thread, [attempt]), /beendeten Kampf/);
  await db.collection('comments').doc().set({ entryId: thread, orderKey: Date.now() + 2000, serverValidatedMechanics: true, combatEncounter: { operation: 'start', encounterId: 'new-duel', participants: [...encounter.participants.values()] } });
  await assert.rejects(commit(thread, [attempt]), /anderen/);
  passed.push('closed-and-new-fight-binding');
});

test('a failure penalty is applied once even when the actor repeats the same failing attempt', async () => {
  const thread = await seed('failure');
  const { challenge } = await create(thread, approachConfig({ failureEffects: { combatEffects: [effect('damage', 5)] } }));
  const first = await commit(thread, [await skill(thread, challenge, ylva, 1)]);
  const hp = (await db.collection('characters').doc(ylva.id).get()).data().combatProfile.hitPoints.current;
  const second = await commit(thread, [await skill(thread, challenge, ylva, 1)]);
  assert.equal(first.mechanics.commentSegments[0].skillResolution.herausforderungCombatResults[0].type, 'damage');
  assert.equal(second.mechanics.commentSegments[0].skillResolution.herausforderungReward.alreadyApplied, true);
  assert.equal((await db.collection('characters').doc(ylva.id).get()).data().combatProfile.hitPoints.current, hp);
  passed.push('failure-once');
});

test('a forged effect die rejects the whole transaction including money, HP and the success claim', async () => {
  const thread = await seed('invalid-die');
  const { challenge } = await create(thread, approachConfig({ rewards: { copper: 10, combatEffects: [effect('damage', 0, { formula: '1W4' })] } }));
  const attempt = await skill(thread, challenge), before = (await db.collection('characters').doc(ylva.id).get()).data(), length = (await history(thread)).length;
  attempt.skillResolution.herausforderungCombatResults[0].roll.diceResults = [99];
  await assert.rejects(commit(thread, [attempt]), /Würfelergebnis/);
  assert.deepEqual((await db.collection('characters').doc(ylva.id).get()).data(), before);
  assert.equal((await history(thread)).length, length);
  await commit(thread, [await skill(thread, challenge)]);
  passed.push('invalid-die-rollback-retry');
});

test('unknown people, foreign recipients, unsupported actions and invalid formulas reject creation', async () => {
  const thread = await seed('bad-config');
  for (const config of [{ audience: { mode: 'selected', actorIds: ['missing-person'] } }, approachConfig({ rewards: { combatEffects: [effect('damage', 1, { targetActorId: observer.id })] } }), approachConfig({ rewards: { combatEffects: [effect('summon', 1)] } }), approachConfig({ rewards: { combatEffects: [effect('damage', 0, { formula: '1W100' })] } })]) await assert.rejects(create(thread, config));
  const count = (await history(thread)).length;
  assert.equal(count, source.comments.length);
  passed.push('invalid-configuration');
});

test('resource restoration uses the existing cap, combat-end buffs expire, and the final summary records challenge damage separately', async () => {
  const thread = await seed('end-summary');
  const profile = resolveCombatProfile(ylva), resource = profile.resources.find(item => item.scope !== 'comment' && item.maximum > 0);
  assert.ok(resource);
  const { challenge } = await create(thread, approachConfig({ rewards: { effects: [status('Durchschaut', { armorClass: 1 })], combatEffects: [
    effect('spend-resource', 1, { resourceId: resource.id }), effect('restore-resource', 10000, { resourceId: resource.id }), effect('damage', 5, { targetActorId: gais.id })
  ] } }));
  const result = await commit(thread, [await skill(thread, challenge)]);
  const effects = result.mechanics.commentSegments[0].skillResolution.herausforderungCombatResults;
  assert.equal(effects.find(effect => effect.type === 'restore-resource').applied.after, resource.maximum);
  const encounter = getActiveCombatEncounter(await history(thread));
  const ended = await commitCombatEncounter.run({ auth: admin, data: { entryId: thread, text: 'Isolierter Kampfabschluss', metadata: { combatEncounter: {
    operation: 'end', encounterId: encounter.encounterId, expectedRevision: encounter.revision, outcome: 'draw', endReason: 'agreement', participants: []
  } } } });
  const comment = (await db.collection('comments').doc(ended.id).get()).data();
  assert.equal(comment.combatEncounter.summary.challengeEffects.damage, 5);
  assert.equal(comment.combatEncounter.summary.challengeEffects.attempts, 1);
  assert.ok(!deriveCombatStateFromComments(await history(thread)).get(ylva.id).temporaryConditions.some(condition => condition.name === 'Durchschaut'));
  passed.push('resource-cap-combat-end-final-summary');
});

test('challenge damage validates concentration saves and breaks linked effects on other participants', async () => {
  const thread = await seed('concentration'), states = deriveCombatStateFromComments(await history(thread));
  await db.collection('comments').doc().set({ entryId: thread, orderKey: Date.now(), serverValidatedMechanics: true,
    combatStatus: { operation: 'add', actorId: gais.id, after: { ...states.get(gais.id), concentration: { instanceId: 'local-focus' } } } });
  await db.collection('comments').doc().set({ entryId: thread, orderKey: Date.now() + 1, serverValidatedMechanics: true,
    combatStatus: { operation: 'add', actorId: observer.id, after: { temporaryConditions: [{ id: 'linked-focus', name: 'Gehalten', active: true,
      concentrationOwnerId: gais.id, concentrationInstanceId: 'local-focus', durationModel: { kind: 'concentration' } }] } } });
  const { challenge } = await create(thread, approachConfig({ rewards: { combatEffects: [effect('damage', 5, { targetActorId: gais.id })] } }));
  const attempt = await skill(thread, challenge);
  assert.equal(attempt.skillResolution.herausforderungCombatSaves.length, 1);
  Object.assign(attempt.skillResolution.herausforderungCombatSaves[0], { diceResults: [1], naturalRoll: 1 });
  const result = await commit(thread, [attempt]);
  assert.equal(result.mechanics.commentSegments[0].skillResolution.herausforderungCombatSaves[0].succeeded, false);
  const replay = deriveCombatStateFromComments(await history(thread));
  assert.equal(replay.get(gais.id).concentration, null);
  assert.ok(!replay.get(observer.id).temporaryConditions.some(condition => condition.id === 'linked-focus'));
  passed.push('concentration-save-and-linked-effects');
});

after(async () => {
  await writeFile(new URL('../../../../.codex-temp/herausforderung/combat-integration-result.json', import.meta.url), JSON.stringify({ passed: passed.length === 13,
    environment: 'isolated Firestore emulator at 127.0.0.1:8186', project: 'demo-aleria-herausforderung', sourceSceneReadAt: source.readAt,
    sourceCommentCount: source.comments.length, liveSceneWrites: 0, checks: passed }, null, 2));
  await db.terminate();
});

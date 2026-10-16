import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { commitSkillCommentOperation } from '../src/mechanics/commit-skill-comment.js';
import { person, encounterComment } from '../../../AleriaAlmanach/tests/fixtures/graded-challenge-fixtures.mjs';

const gm = { uid: 'gm', token: { aleriaRole: 'admin' } }, player = { uid: 'player', token: { aleriaRole: 'player' } };
const event = (skills = ['insight']) => ({ title: 'Die verschwiegene Wache', publicDescription: 'Die Wache weicht deiner Frage aus.',
  approaches: [{ approachId: 'question', label: 'Die Aussage prüfen', preferredSkills: skills, difficulty: 18, insight: 'Sie verschweigt den Namen.' }] });
const create = (db, draft) => commitHerausforderungOperation({ auth: gm, data: { entryId: 'scene', text: draft.title, metadata: { herausforderung: draft } } }, { database: db, now: 100 });
function attempt(commentId, skillId, { natural = 18, kind = 'thought' } = {}) {
  return { auth: player, data: { entryId: 'scene', charName: 'Ylva', text: 'Ich beobachte die Wache.', metadata: { characterId: 'reader', commentSegments: [{
    kind, commentKind: kind, mechanicMode: 'skill', skillId, skillCustomModifier: 99,
    skillTargetChallengeId: `herausforderung:${commentId}:question`, text: 'Ich beobachte die Wache.',
    skillResolution: { resolutionId: 'untrusted', actorId: 'reader', actorPersistence: { kind: 'character', recordId: 'reader' },
      natural, diceResults: [natural], total: 999, challengeModifier: 99, challengeModifierReason: 'Kein Malus', customModifier: 99 }
  }] } } };
}

for (const skillId of ['arcane-kunde', 'nature']) test(`blocked ${skillId} rejects the whole attempt without claims or inventory changes`, async () => {
  const db = database({ 'characters/reader': person('reader') });
  const created = await create(db, event()); const before = structuredClone([...db.data]);
  await assert.rejects(commitSkillCommentOperation(attempt(created.id, skillId), { database: db, now: 200 }), /gesperrt/);
  assert.deepEqual([...db.data], before);
});

test('server loads the author penalty and ignores fabricated bonuses and reasons', async () => {
  const figure = person('reader'); figure.combatProfile.attributes = [{ key: 'charisma', score: 16 }];
  const db = database({ 'characters/reader': figure }); const draft = event(['seduction']);
  draft.approaches[0].checkPenalties = [{ checkId: 'seduction', modifier: -10, reason: 'Unempfänglich für Flirten' }];
  const created = await create(db, draft);
  const result = await commitSkillCommentOperation(attempt(created.id, 'seduction', { kind: 'flirt' }), { database: db, now: 200 });
  const resolution = result.mechanics.commentSegments[0].skillResolution;
  assert.equal(resolution.total, 11); assert.equal(resolution.profileModifier, 3);
  assert.equal(resolution.challengeModifier, -10); assert.equal(resolution.customModifier, 0);
  assert.equal(resolution.challengeModifierReason, 'Unempfänglich für Flirten');
  assert.equal(resolution.outcome, 'failure');
});

test('fixed target is canonical, selected automatically at resolution, and its passive rules apply', async () => {
  const opponent = person('opponent');
  opponent.combatProfile.quirks = [{ id: 'presence', name: 'Undurchschaubar', active: true, triggerRules: [{ id: 'confuse', phase: 'pre-roll', activation: 'passive', sourceRelation: 'enemy', recipient: 'actor', actionKinds: ['skill'], effects: { skillModifier: -2 } }] }];
  const db = database({ 'characters/reader': person('reader'), 'characters/opponent': opponent }); const draft = event();
  draft.targetActor = { actorId: 'opponent', name: 'Erfundener Name', persistence: { kind: 'character', recordId: 'opponent' } };
  const created = await create(db, draft);
  assert.equal(db.data.get('comments/' + created.id).herausforderung.targetActor.name, 'Gais Wyrm');
  const before = structuredClone(db.data.get('characters/opponent'));
  const result = await commitSkillCommentOperation(attempt(created.id, 'insight'), { database: db, now: 200 });
  const resolution = result.mechanics.commentSegments[0].skillResolution;
  assert.equal(resolution.targetActorId, 'opponent'); assert.equal(resolution.targetChallengeAuthor, 'Gais Wyrm');
  assert.equal(resolution.total, 16); assert.equal(resolution.ruleModifier, -2);
  assert.deepEqual(db.data.get('characters/opponent'), before);
});

test('legacy duel infers the same single opponent on the server, without changing the authored challenge', async () => {
  const db = database({ 'comments/start': encounterComment(), 'characters/reader': person('reader'), 'characters/opponent': person('opponent') });
  const draft = event(); draft.combatBound = true; draft.audience = { mode: 'selected', actorIds: ['reader'] };
  const created = await create(db, draft); const before = structuredClone(db.data.get('comments/' + created.id));
  const result = await commitSkillCommentOperation(attempt(created.id, 'insight'), { database: db, now: 200 });
  assert.equal(result.mechanics.commentSegments[0].skillResolution.targetActorId, 'opponent');
  assert.deepEqual(db.data.get('comments/' + created.id), before);
});

test('environment mode suppresses opponent inference during an active duel', async () => {
  const db = database({ 'comments/start': encounterComment(), 'characters/reader': person('reader'), 'characters/opponent': person('opponent') });
  const draft = event(); draft.combatBound = true; draft.targetActor = { mode: 'none' };
  const created = await create(db, draft);
  const result = await commitSkillCommentOperation(attempt(created.id, 'insight'), { database: db, now: 200 });
  assert.equal(result.mechanics.commentSegments[0].skillResolution.targetActorId, '');
});

test('the author can attempt a standalone self-targeted challenge; own rules apply once', async () => {
  const figure = person('reader');
  figure.combatProfile.quirks = [{ id: 'focus', name: 'Fokus', active: true, triggerRules: [{ id: 'focus-check', phase: 'pre-roll', activation: 'passive', sourceRelation: 'self', recipient: 'actor', actionKinds: ['skill'], effects: { skillModifier: 2 } }] }];
  const db = database({ 'characters/reader': figure }); const draft = event();
  draft.targetActor = { actorId: 'reader' }; const created = await create(db, draft);
  const payload = attempt(created.id, 'insight'); payload.auth = gm;
  const result = await commitSkillCommentOperation(payload, { database: db, now: 200 });
  const resolved = result.mechanics.commentSegments[0].skillResolution;
  assert.equal(resolved.targetActorId, 'reader'); assert.equal(resolved.total, 20); assert.equal(resolved.ruleModifier, 2);
});

for (const inferred of [false, true]) test(`scene creature target resolves its real source (${inferred ? 'inferred' : 'explicit'})`, async () => {
  const creature = person('owl-source'); creature.name = 'Der Rabenzeuge';
  const start = encounterComment(); start.combatEncounter.participants[1] = { actorId: 'scene-owl', name: 'Der Rabenzeuge', status: 'active', partyId: 'b', sourceId: 'owl-source', persistence: { kind: 'creature', recordId: 'owl-source', persistent: false } };
  const db = database({ 'characters/reader': person('reader'), 'creatures/owl-source': creature, ...(inferred ? { 'comments/start': start } : {}) });
  const draft = event(); draft.combatBound = inferred;
  if (!inferred) draft.targetActor = { actorId: 'scene-owl', persistence: { kind: 'scene-creature', sourceCreatureId: 'owl-source' } };
  const created = await create(db, draft); const before = structuredClone(db.data.get('creatures/owl-source'));
  const result = await commitSkillCommentOperation(attempt(created.id, 'insight'), { database: db, now: 200 });
  assert.equal(result.mechanics.commentSegments[0].skillResolution.targetActorId, 'scene-owl');
  assert.deepEqual(db.data.get('creatures/owl-source'), before);
});

for (const change of [draft => { draft.approaches[0].checkPenalties = [{ checkId: 'insight', modifier: 10 }]; },
  draft => { draft.targetActor = { actorId: 'opponent', persistence: { kind: 'character', recordId: 'reader' } }; },
  draft => { draft.targetActor = { actorId: 'missing' }; }]) {
  test('invalid author penalty or target aborts creation without writes', async () => {
    const db = database({ 'characters/reader': person('reader') }); const draft = event(); change(draft);
    const before = structuredClone([...db.data]); await assert.rejects(create(db, draft)); assert.deepEqual([...db.data], before);
  });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from './fixtures/combat-transaction-database.js';
import { person } from '../../../AleriaAlmanach/tests/fixtures/graded-challenge-fixtures.mjs';
import { commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { commitSkillCommentOperation } from '../src/mechanics/commit-skill-comment.js';
import { commitSceneElementOperation, evaluateCreatedSceneComment } from '../src/scene-elements/commit-scene-element.js';
import { evaluateSceneElements } from '../src/scene-elements/scene-element-evaluation.js';

const auth = { uid: 'author', token: { aleriaRole: 'editor' } };
const actor = id => ({ ...person(id), biography: 'Original biography', inventory: { items: [], copper: 19 } });
const hazard = patch => ({ elementType: 'danger', title: 'Die verborgene Nadel', publicDescription: 'Eine Nadel schnellt aus dem Schloss.',
  approaches: [{ approachId: 'dodge', label: 'Ausweichen', preferredSkills: ['save:dexterity'], difficulty: 15,
    insight: 'Du weichst aus.', failureConsequence: 'Die Nadel trifft.' }],
  activation: { enabled: true, mode: 'any', conditions: [{ type: 'comments', minimum: 6 }],
    target: { mode: 'random', actorId: '' }, detection: { enabled: true, skillId: 'perception', difficulty: 15,
      detectedText: 'Ein feines Klicken warnt dich.', missedText: 'Das Klicken bleibt unbemerkt.' } }, ...patch });
let sequence = 0;
async function prepare(db, event = hazard(), now = 100) {
  return commitHerausforderungOperation({ auth, data: { entryId: 'scene', text: event.title,
    metadata: { operationId: `scene-element-test-${++sequence}`, herausforderung: event } } }, { database: db, now });
}
function post(db, index, id = 'reader') {
  db.data.set('comments/post-' + index, { entryId: 'scene', characterId: id, charName: id, text: 'Ich gehe weiter.',
    serverCommitted: true, createdAtClient: 100 + index, orderKey: 100 + index,
    commentSegments: [{ actorId: id, kind: 'speech', text: 'Ich gehe weiter.' }] });
}
const evaluate = (db, roll = 17, options = {}) => evaluateSceneElements(db, 'scene', { now: 200, rollDie: () => roll, selectIndex: () => 0, ...options });
const revealed = db => [...db.data.values()].find(value => value.herausforderung?.sceneElementId);

test('an empty narrative is a valid event and preserves all character data', async () => {
  const before = actor('reader'), db = database({ 'characters/reader': before });
  const result = await prepare(db, { elementType: 'narration', title: 'Runenwand', publicDescription: 'Das Licht fällt auf die Runen.', approaches: [] });
  assert.equal(db.data.get('comments/' + result.id).herausforderung.approaches.length, 0);
  assert.deepEqual(db.data.get('characters/reader'), before);
  assert.equal([...db.data.keys()].filter(key => key.startsWith('scene_elements/')).length, 0);
});

test('an armed danger keeps description, image, solution and trigger out of public comments', async () => {
  const db = database({ 'characters/reader': actor('reader') });
  const event = hazard({ sceneImage: { url: 'https://example.org/secret-trap.png', format: '16:9', fit: 'contain' } });
  const created = await prepare(db, event);
  const publicData = JSON.stringify([...db.data].filter(([key]) => key.startsWith('comments/')));
  assert.doesNotMatch(publicData, /Nadel|secret-trap|weichst|minimum|detectedText/);
  assert.equal(db.data.get('comments/' + created.id).sceneElementSignal.visible, false);
  assert.equal(db.data.get('scene_elements/' + created.sceneElementId).event.title, event.title);
});

test('the sixth new actor contribution reveals once, with server-rolled detection and advantage', async () => {
  const db = database({ 'characters/reader': actor('reader') });
  post(db, 0);
  const created = await prepare(db);
  for (let i = 1; i < 6; i++) post(db, i);
  await evaluate(db);
  assert.equal(revealed(db), undefined);
  post(db, 6);
  let rolls = 0;
  const results = await evaluate(db, 17, { rollDie: () => { rolls++; return 17; } });
  const event = revealed(db);
  assert.equal(event.herausforderung.reaction.rollMode, 'advantage');
  assert.equal(event.sceneElementDetection.natural, 17);
  assert.deepEqual(event.herausforderung.audience.actorIds, ['reader']);
  assert.equal(event.herausforderung.approaches[0].attemptLimit, 1);
  assert.equal(results[0].challengeId, 'reveal-' + created.sceneElementId);
  await evaluate(db, 1, { rollDie: () => { throw Error('must not reroll'); } });
  assert.equal(rolls, 1);
  assert.equal([...db.data.values()].filter(value => value.herausforderung?.sceneElementId).length, 1);
});

test('a missed detection chooses only a scene participant and gives disadvantage', async () => {
  const db = database({ 'characters/reader': actor('reader'), 'characters/outsider': actor('outsider') });
  await prepare(db, hazard({ activation: { ...hazard().activation, conditions: [{ type: 'comments', minimum: 1 }] } }));
  post(db, 1);
  await evaluate(db, 2);
  assert.equal(revealed(db).herausforderung.reaction.actorId, 'reader');
  assert.equal(revealed(db).herausforderung.reaction.rollMode, 'disadvantage');
  assert.equal(revealed(db).herausforderung.reaction.description, 'Das Klicken bleibt unbemerkt.');
});

test('passive perception uses the explicit sheet bonus and can reveal before the comment threshold', async () => {
  const record = actor('reader');
  record.combatProfile.combat = { passivePerceptionBonus: 11 };
  const db = database({ 'characters/reader': record });
  await prepare(db, hazard({ activation: { ...hazard().activation, conditions: [
    { type: 'comments', minimum: 6 }, { type: 'passive', skillId: 'perception', minimum: 21 }
  ] } }));
  post(db, 1);
  await evaluate(db, 1, { rollDie: () => { throw Error('passive discovery must not roll'); } });
  const reaction = revealed(db).herausforderung.reaction;
  assert.equal(reaction.detected, true);
  assert.equal(reaction.detection.total, 21);
  assert.equal(reaction.detection.kind, 'passive');
});

test('AND retains a real item interaction until its contribution threshold is met', async () => {
  const db = database({ 'characters/reader': actor('reader') });
  const item = await prepare(db, { elementType: 'item', title: 'Truhe', publicDescription: 'Ein altes Schloss.',
    approaches: hazard().approaches });
  await prepare(db, hazard({ activation: { ...hazard().activation, mode: 'all', conditions: [
    { type: 'comments', minimum: 2 }, { type: 'interaction', sourceId: item.id }
  ] } }));
  post(db, 1);
  await commitSceneElementOperation({ auth, data: { action: 'interact', entryId: 'scene', sourceId: item.id, actorId: 'reader', operationId: 'real-item-interaction' } }, { database: db });
  assert.equal(revealed(db), undefined);
  post(db, 2); await evaluate(db);
  assert.equal(revealed(db).herausforderung.reaction.detected, true);
});

test('unknown or hidden interaction sources and absent actors cannot trigger an armed danger', async () => {
  const db = database({ 'characters/reader': actor('reader') });
  await prepare(db, hazard()); post(db, 1);
  await assert.rejects(commitSceneElementOperation({ auth, data: { action: 'interact', entryId: 'scene', sourceId: 'forged', actorId: 'reader', operationId: 'forged-item-interaction' } }, { database: db }), /Interaktionsquelle/);
  assert.equal(revealed(db), undefined);
});

test('parallel evaluations produce exactly one immutable reveal', async () => {
  const db = database({ 'characters/reader': actor('reader') });
  await prepare(db); for (let i = 1; i <= 6; i++) post(db, i);
  await Promise.all([evaluate(db), evaluate(db), evaluate(db)]);
  assert.equal([...db.data.values()].filter(value => value.herausforderung?.sceneElementId).length, 1);
});

test('a delayed delivery of an interaction from before arming cannot activate a new danger', async () => {
  const db = database({ 'characters/reader': actor('reader') }); post(db, 0);
  const item = await prepare(db, { elementType: 'item', title: 'Truhe', publicDescription: 'Ein altes Schloss.', approaches: hazard().approaches });
  const touch = await commitSceneElementOperation({ auth, data: { action: 'interact', entryId: 'scene', sourceId: item.id,
    actorId: 'reader', operationId: 'interaction-before-arming' } }, { database: db });
  await prepare(db, hazard({ activation: { ...hazard().activation, conditions: [{ type: 'interaction', sourceId: item.id }] } }));
  await evaluateCreatedSceneComment({ data: { id: touch.id, data: () => db.data.get('comments/' + touch.id) } }, { database: db, rollDie: () => 17 });
  assert.equal(revealed(db), undefined);
});

test('a latched interaction still chooses its real interactor when a later post completes AND', async () => {
  const db = database({ 'characters/reader': actor('reader'), 'characters/other': actor('other') }); post(db, 0); post(db, 99, 'other');
  const item = await prepare(db, { elementType: 'item', title: 'Truhe', publicDescription: 'Ein altes Schloss.', approaches: hazard().approaches });
  await prepare(db, hazard({ activation: { ...hazard().activation, mode: 'all', conditions: [{ type: 'comments', minimum: 1 }, { type: 'interaction', sourceId: item.id }] } }));
  await commitSceneElementOperation({ auth, data: { action: 'interact', entryId: 'scene', sourceId: item.id,
    actorId: 'reader', operationId: 'latched-real-interactor' } }, { database: db });
  post(db, 1, 'other'); await evaluate(db, 17, { selectIndex: () => 0 });
  assert.equal(revealed(db).herausforderung.reaction.actorId, 'reader');
});

test('hidden checks consume a passive scene frequency only once across two dangers', async () => {
  const record = actor('reader'); record.combatProfile.quirks = [{ id: 'keen', name: 'Einmaliger Scharfblick', active: true,
    triggerRules: [{ id: 'once', name: 'Einmaliger Scharfblick', phase: 'pre-roll', activation: 'passive', frequency: 'scene',
      actionKinds: ['skill'], skillIds: ['perception'], effects: { skillModifier: 2 } }] }];
  const db = database({ 'characters/reader': record });
  const activation = { ...hazard().activation, conditions: [{ type: 'comments', minimum: 1 }], detection: { enabled: true, skillId: 'perception', difficulty: 18 } };
  await prepare(db, hazard({ activation })); await prepare(db, hazard({ activation })); post(db, 1);
  await evaluate(db, 17);
  const events = [...db.data.values()].filter(value => value.sceneElementDetection);
  assert.deepEqual(events.map(event => event.sceneElementDetection.total).sort(), [17, 19]);
  assert.deepEqual(events.map(event => event.herausforderung.reaction.detected).sort(), [false, true]);
});

test('a hidden detection uses the real natural-one replacement and retains its audit', async () => {
  const record = actor('reader'); record.combatProfile.quirks = [{ id: 'lucky', name: 'Glück', active: true, mechanics: { naturalOneReroll: true } }];
  const db = database({ 'characters/reader': record });
  await prepare(db, hazard({ activation: { ...hazard().activation, conditions: [{ type: 'comments', minimum: 1 }] } })); post(db, 1);
  const dice = [1, 17]; await evaluate(db, 17, { rollDie: () => dice.shift() });
  assert.equal(revealed(db).sceneElementDetection.rerolls[0].original, 1);
  assert.equal(revealed(db).sceneElementDetection.rerolls[0].replacement, 17);
  assert.equal(revealed(db).herausforderung.reaction.detected, true);
});

test('the selected trap save goes through the existing transaction and applies failure damage only once', async () => {
  const record = actor('reader'), db = database({ 'characters/reader': record });
  const event = hazard();
  event.approaches[0].failureEffects = { combatEffects: [{ effectId: 'needle', type: 'damage', amount: 7, damageType: 'stich' }] };
  await prepare(db, event); for (let i = 1; i <= 6; i++) post(db, i);
  await evaluate(db, 2);
  const challenge = [...db.data].find(([, value]) => value.herausforderung?.sceneElementId)[0].split('/')[1];
  const request = { auth, data: { entryId: 'scene', charName: 'reader', text: 'Ich springe zurück.', metadata: { characterId: 'reader',
    commentSegments: [{ actorId: 'reader', kind: 'interact', commentKind: 'interact', mechanicMode: 'skill', skillId: 'save:dexterity',
      skillTargetChallengeId: `herausforderung:${challenge}:dodge`, text: 'Ich springe zurück.',
      skillResolution: { resolutionId: 'trap-reaction', actorId: 'reader', actorPersistence: { kind: 'character', recordId: 'reader' },
        natural: 2, diceResults: [2, 6], rollMode: 'disadvantage' } }] } } };
  const response = await commitSkillCommentOperation(request, { database: db, now: 300 });
  const resolution = response.mechanics.commentSegments[0].skillResolution;
  assert.equal(resolution.rollMode, 'disadvantage');
  assert.equal(resolution.outcome, 'failure');
  assert.equal(db.data.get('characters/reader').combatProfile.hitPoints.current, 33);
  const after = structuredClone(db.data.get('characters/reader'));
  await assert.rejects(commitSkillCommentOperation(request, { database: db, now: 301 }));
  assert.deepEqual(db.data.get('characters/reader'), after);
  assert.equal(after.biography, record.biography);
  assert.deepEqual(after.inventory, record.inventory);
});

test('ordinary players cannot author mechanical rewards on a delayed element', async () => {
  const db = database({}), event = hazard();
  event.approaches[0].rewards = { copper: 5 };
  await assert.rejects(commitHerausforderungOperation({ auth: { uid: 'player', token: {} }, data: { entryId: 'scene', text: 'trap',
    metadata: { operationId: 'unauthorized-test', herausforderung: event } } }, { database: db }), /Spielleitung/);
  assert.equal(db.data.size, 0);
});

test('deactivation, stale revision protection and explicit rearming preserve the definition', async () => {
  const db = database({ 'characters/reader': actor('reader') }), prepared = await prepare(db);
  const call = (action, expectedRevision) => commitSceneElementOperation({ auth, data: { entryId: 'scene', id: prepared.sceneElementId, action, expectedRevision } }, { database: db, now: 300 });
  await call('disable', 1);
  for (let i = 1; i <= 6; i++) post(db, i);
  await evaluate(db); assert.equal(revealed(db), undefined);
  await assert.rejects(call('arm', 1), /inzwischen geändert/);
  await call('arm', 2); await evaluate(db); assert.equal(revealed(db), undefined);
  for (let i = 7; i <= 12; i++) post(db, i);
  await evaluate(db); assert.ok(revealed(db));
  await assert.rejects(call('arm', 3), /erneut scharfgeschaltet/);
});

test('rearming evaluates already participating passive observers immediately', async () => {
  const db = database({ 'characters/reader': actor('reader') });
  const prepared = await prepare(db, hazard({ activation: { ...hazard().activation,
    conditions: [{ type: 'passive', skillId: 'perception', minimum: 10 }] } }));
  const call = (action, expectedRevision) => commitSceneElementOperation({ auth, data: { entryId: 'scene', id: prepared.sceneElementId,
    action, expectedRevision } }, { database: db, now: 300 });
  await call('disable', 1); post(db, 1);
  const result = await call('arm', 2);
  assert.equal(result.state, 'revealed');
  assert.equal(revealed(db).herausforderung.reaction.detection.kind, 'passive');
});

test('the background trigger ignores narrator, system cards and edits; it evaluates real new actor comments', async () => {
  const db = database({ 'characters/reader': actor('reader') });
  await prepare(db); for (let i = 1; i <= 6; i++) post(db, i);
  await evaluateCreatedSceneComment({ data: { data: () => ({ entryId: 'scene', serverValidatedMechanics: true, narrator: true }) } }, { database: db });
  assert.equal(revealed(db), undefined);
  await evaluateCreatedSceneComment({ data: { data: () => db.data.get('comments/post-6') } }, { database: db, rollDie: () => 17, selectIndex: () => 0 });
  assert.ok(revealed(db));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitNarrativeCommentOperation } from '../src/comments/commit-narrative-comment.js';
import { commitSkillCommentOperation } from '../src/mechanics/commit-skill-comment.js';
import { commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { person, actorId } from '../../../AleriaAlmanach/tests/fixtures/graded-challenge-fixtures.mjs';
import { assertCommentAnimalSpeech } from '../src/comments/comment-animal-speech.js';
import { DEVELOPMENT_TRAITS } from '../src/generated/character-development/development-traits.js';
import { ANIMAL_SPEECH_TRAIT_ID } from '../src/generated/character-development/development-animal-speech.js';

const trait = DEVELOPMENT_TRAITS.find(item => item.id === ANIMAL_SPEECH_TRAIT_ID);
const request = (kind = 'animal') => ({ auth: { uid: 'local-player', token: {} }, data: {
  entryId: 'local-scene', charName: 'Lokale Testfigur', text: 'Ruhig, mein Freund.',
  metadata: { characterId: 'speaker', commentKind: kind,
    commentSegments: [{ characterId: 'speaker', kind, text: 'Ruhig, mein Freund.' }] }
} });
const dbFor = quirks => database({ 'characters/speaker': { name: 'Lokale Testfigur', combatProfile: { quirks } } });

test('ordinary speech does not require the animal speech trait', async () => {
  const db = dbFor([]);
  const result = await commitNarrativeCommentOperation(request('speech'), { database: db, now: 100 });
  assert(db.data.has(`comments/${result.id}`));
});

test('narrative Tiersprache rejects a missing or inactive trait without any writes', async () => {
  for (const quirks of [[], [{ ...trait, active: false }]]) {
    const db = dbFor(quirks), before = structuredClone([...db.data]);
    await assert.rejects(commitNarrativeCommentOperation(request(), { database: db, now: 100 }), /Merkmal/);
    assert.deepEqual([...db.data], before);
  }
});

test('the server reads the actual speaker and ignores a forged trait in the request', async () => {
  const db = dbFor([]), input = request();
  input.data.metadata.commentSegments[0].combatProfile = { quirks: [trait] };
  await assert.rejects(commitNarrativeCommentOperation(input, { database: db, now: 100 }), /Merkmal/);
  const alias = request('tiersprache');
  await assert.rejects(commitNarrativeCommentOperation(alias, { database: db, now: 100 }), /Merkmal/);
});

test('a valid animal speech comment retains its text and leaves the speaker profile unchanged', async () => {
  const db = dbFor([trait]), before = structuredClone(db.data.get('characters/speaker'));
  const result = await commitNarrativeCommentOperation(request(), { database: db, now: 100 });
  assert.equal(db.data.get(`comments/${result.id}`).commentKind, 'animal');
  assert.deepEqual(db.data.get('characters/speaker'), before);
  assert.equal(db.data.size, 2);
});

test('the mechanical skill endpoint also rejects Tiersprache without its actual trait', async () => {
  const db = dbFor([]), input = request();
  input.data.metadata.commentSegments[0].skillResolution = { resolutionId: 'local-skill', actorId: 'speaker', skillId: 'animal-handling' };
  await assert.rejects(commitSkillCommentOperation(input, { database: db, now: 100 }), /Merkmal/);
  assert.equal(db.data.size, 1);
});

test('mixed speakers are checked separately and repeated valid references are read only once', async () => {
  const db = dbFor([trait]);
  db.data.set('characters/other', { combatProfile: { quirks: [] } });
  await assert.rejects(db.runTransaction(transaction => assertCommentAnimalSpeech({ database: db, transaction, metadata: {
    commentSegments: [{ kind: 'animal', characterId: 'speaker' }, { kind: 'animal', characterId: 'other' }]
  } })), /Merkmal/);
  assert.equal(db.data.size, 2);
});

test('a failed challenge remains open and the server verifies Tiersprache advantage and reply presentation separately', async () => {
  const figure = person(actorId);
  figure.combatProfile.attributes = [{ key: 'wisdom', score: 14 }];
  figure.combatProfile.skills = [{ id: 'animal-handling', name: 'Mit Tieren umgehen', attributeKey: 'wisdom', proficiency: 'trained' }];
  figure.combatProfile.quirks = [trait];
  const db = database({ [`characters/${actorId}`]: figure });
  const original = structuredClone(figure);
  const event = { title: 'Lokaler Tierumgang', publicDescription: 'Das Tier bleibt unruhig.', approaches: [{
    approachId: 'calm', preferredSkills: ['animal-handling'], difficulty: 40, insight: 'Es beruhigt sich.', actionIconId: 'animal-handling'
  }] };
  const created = await commitHerausforderungOperation({ auth: { uid:'gm', token:{ aleriaRole:'admin' } }, data:{
    entryId:'local-scene', text:event.title, metadata:{ herausforderung:event }
  } }, { database:db, now:100 });
  assert.equal(db.data.get(`comments/${created.id}`).herausforderung.approaches[0].actionIconId, 'animal-handling');
  const makeAttempt = (kind, diceResults, extra = {}) => ({ auth:{ uid:'player', token:{} }, data:{
    entryId:'local-scene', charName:figure.name, text:'Ruhig, mein Freund.', metadata:{ characterId:actorId, orderKey:101,
      commentSegments:[{ kind, commentKind:kind, mechanicMode:'skill', characterId:actorId, text:'Ruhig, mein Freund.',
        skillId:'animal-handling', skillTargetChallengeId:`herausforderung:${created.id}:calm`, actionIconId:'animal-handling', ...extra,
        skillResolution:{ resolutionId:'local-roll', actorId, actorPersistence:{ kind:'character', recordId:actorId }, natural:diceResults.at(-1), diceResults, total:999 }
      }] }
  } });
  const failed = await commitSkillCommentOperation(makeAttempt('speech', [2]), { database:db, now:200 });
  assert.equal(failed.mechanics.commentSegments[0].skillResolution.outcome, 'failure');
  const middle = await commitNarrativeCommentOperation({ auth:{ uid:'player', token:{} }, data:{
    entryId:'local-scene', charName:figure.name, text:'Ein späterer normaler Beitrag.', metadata:{ characterId:actorId }
  } }, { database:db, now:300 });
  const secondRequest = makeAttempt('animal', [4,17], { challengeReplyToCommentId:failed.id });
  secondRequest.data.metadata.orderKey = 1000; // The composer appends mechanics; grouping is a separate display field.
  const second = await commitSkillCommentOperation(secondRequest, { database:db, now:400 });
  const result = second.mechanics.commentSegments[0].skillResolution;
  assert.equal(result.rollMode, 'advantage'); assert.equal(result.natural, 17);
  assert.equal(result.animalSpeechAdvantage, true); assert.deepEqual(result.diceResults, [4,17]);
  const stored = db.data.get(`comments/${second.id}`);
  assert.equal(stored.commentSegments[0].challengeReplyToCommentId, failed.id);
  assert.equal(stored.commentSegments[0].actionIconId, 'animal-handling');
  assert(stored.orderKey > db.data.get(`comments/${middle.id}`).orderKey, 'mechanical history stays chronological');
  assert.deepEqual(db.data.get(`characters/${actorId}`), original);
});

for (const kind of ['speech', 'whisper', 'shout']) test(`server accepts ordinary animal handling with ${kind} without the speech trait`, async () => {
  const figure = person(actorId); figure.combatProfile.quirks = [];
  figure.combatProfile.skills = [{ name:'Mit Tieren umgehen', attributeKey:'wisdom', proficiency:'trained' }];
  const db = database({ [`characters/${actorId}`]:figure });
  const event = { title:'Tierumgang', publicDescription:'Eine lokale Testprobe.', approaches:[{
    approachId:'calm', preferredSkills:['animal-handling'], difficulty:40, insight:'Es wird ruhig.'
  }] };
  const created = await commitHerausforderungOperation({ auth:{ uid:'gm', token:{ aleriaRole:'admin' } }, data:{
    entryId:'local-scene', text:event.title, metadata:{ herausforderung:event }
  } }, { database:db, now:100 });
  const response = await commitSkillCommentOperation({ auth:{ uid:'player', token:{} }, data:{
    entryId:'local-scene', charName:figure.name, text:'Eine ruhige Stimme.', metadata:{ characterId:actorId,
      commentSegments:[{ kind, commentKind:kind, characterId:actorId, mechanicMode:'skill', skillId:'animal-handling', text:'Eine ruhige Stimme.',
        skillTargetChallengeId:`herausforderung:${created.id}:calm`,
        skillResolution:{ resolutionId:'local-roll', actorId, actorPersistence:{ kind:'character', recordId:actorId }, natural:10, diceResults:[10] }
      }]
    }
  } }, { database:db, now:200 });
  assert.equal(response.mechanics.commentSegments[0].skillResolution.rollMode, 'normal');
});

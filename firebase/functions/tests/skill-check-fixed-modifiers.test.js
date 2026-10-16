import assert from 'node:assert/strict';
import test from 'node:test';
import { database } from './fixtures/combat-transaction-database.js';
import { commitHerausforderungOperation } from '../src/mechanics/commit-herausforderung.js';
import { commitSkillCommentOperation } from '../src/mechanics/commit-skill-comment.js';
import { person, actorId } from '../../../AleriaAlmanach/tests/fixtures/graded-challenge-fixtures.mjs';

for (const injected of [-99, 99]) for (const skillId of ['perception', 'save:wisdom']) {
  test(`server ignores injected free modifier ${injected} for ${skillId}`, async () => {
    const figure = person(actorId);
    figure.combatProfile.attributes = [{ key: 'wisdom', score: 14 }];
    figure.combatProfile.skills = [{ id: 'perception', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained' }];
    const db = database({ ['characters/' + actorId]: figure });
    const event = { title: 'Prüfung', publicDescription: 'Achte auf die Bewegung.', approaches: [
      { approachId: 'observe', preferredSkills: [skillId], difficulty: 18, insight: 'Du erkennst die Vorbereitung.' }
    ] };
    const created = await commitHerausforderungOperation({ auth: { uid: 'gm', token: { aleriaRole: 'admin' } },
      data: { entryId: 'scene', text: event.title, metadata: { herausforderung: event } } }, { database: db, now: 100 });
    const kind = skillId.startsWith('save:') ? 'interact' : 'thought';
    const response = await commitSkillCommentOperation({ auth: { uid: 'player', token: { aleriaRole: 'player' } }, data: {
      entryId: 'scene', charName: 'Ylva', text: 'Ich beobachte ihn.', metadata: { characterId: actorId, commentSegments: [{
        kind, commentKind: kind, mechanicMode: 'skill', skillId, skillCustomModifier: injected,
        skillTargetChallengeId: `herausforderung:${created.id}:observe`, text: 'Ich beobachte ihn.',
        skillResolution: { resolutionId: 'forged', actorId, actorPersistence: { kind: 'character', recordId: actorId },
          natural: 10, diceResults: [10], customModifier: injected, total: 999, profileModifier: 999 }
      }] }
    } }, { database: db, now: 200 });
    const result = response.mechanics.commentSegments[0].skillResolution;
    assert.equal(result.customModifier, 0);
    assert.equal(result.customModifierDeclared, false);
    assert.equal(result.profileModifier, skillId === 'perception' ? 4 : 2);
    assert.equal(result.total, 10 + result.profileModifier);
    assert.equal(result.outcome, 'failure');
    assert.equal(db.data.get('characters/' + actorId).combatProfile.hitPoints.current, 40);
  });
}

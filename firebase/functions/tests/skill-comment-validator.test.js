import assert from 'node:assert/strict';
import test from 'node:test';

import { skillCommentValidatorInternals } from '../src/mechanics/skill-comment-validator.js';

test('eine verdeckte Herausforderung besitzt über alle Auflösungsbeiträge denselben atomaren Anspruch', () => {
  const challenge = { id: 'challenge-a', commentId: 'origin-comment', segmentIndex: 1 };
  const first = skillCommentValidatorInternals.challengeClaimId(challenge);
  const retry = skillCommentValidatorInternals.challengeClaimId({ ...challenge });
  const other = skillCommentValidatorInternals.challengeClaimId({ ...challenge, commentId: 'other-origin' });
  assert.equal(first, retry);
  assert.notEqual(first, other);
});

test('Fertigkeitsregeln verwenden Tagesressourcen des aktuellen Szenentags', () => {
  const profile = skillCommentValidatorInternals.applySkillRuntimeState({
    resources: [{
      id: 'aura-focus', name: 'Aura-Fokuspunkt', current: 0, maximum: 2,
      recovery: 'day', recoveryDayKey: 'scene:test:day-1'
    }]
  }, null, 'scene:test:day-2');
  const aura = profile.resources.find(resource => resource.id === 'aura-focus');
  assert.equal(aura.current, 2);
  assert.equal(aura.recoveryDayKey, 'scene:test:day-2');
});

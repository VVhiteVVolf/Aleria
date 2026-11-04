import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCharacterCombatProfile, getMaximumHitPoints } from '../modules/combat/combat-profile-model.js';
import { getSuggestedHitPointGain, previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';

function constitutionProfile(mechanics, attribute = {}) {
  return sanitizeCharacterCombatProfile({
    progression: { level: 1 }, attributes: [{ key: 'constitution', score: 10, ...attribute }],
    hitPoints: { hitDie: 10, current: 25, maximumOverride: 50 },
    quirks: [{ id: 'constitution-training', name: 'Konstitutionsprägung', active: true, mechanics }]
  });
}

test('recommended hit-point gain uses active effective constitution while preserving stored base values', () => {
  const profile = constitutionProfile({ attributeModifiers: [{ attributeKey: 'constitution', bonus: 4 }] });
  const before = structuredClone(profile);
  assert.equal(getSuggestedHitPointGain(profile), 8);
  const result = previewCharacterLevelUp(profile, { targetLevel: 2, hitPointMode: 'recommended' });
  assert.equal(result.ready, true);
  assert.equal(getMaximumHitPoints(result.profile), 58);
  assert.equal(result.profile.hitPoints.current, 33);
  assert.deepEqual(profile, before);
  assert.equal(result.profile.attributes.find(attribute => attribute.key === 'constitution').score, 10);
  profile.quirks[0].active = false;
  assert.equal(getSuggestedHitPointGain(profile), 6);
});

test('constitution caps apply after bonuses and constrain free modifier overrides in hit-point recommendations', () => {
  const profile = constitutionProfile({
    attributeModifiers: [{ attributeKey: 'constitution', bonus: 4 }],
    attributeCaps: [{ attributeKey: 'constitution', maximum: 12 }]
  }, { score: 14, modifierOverride: 7 });
  assert.equal(getSuggestedHitPointGain(profile), 7);
  profile.quirks[0].mechanics.attributeCaps[0].maximum = 2;
  assert.equal(getSuggestedHitPointGain(profile), 2);
  profile.quirks[0].mechanics.attributeCaps[0].maximum = 1;
  assert.equal(getSuggestedHitPointGain(profile), 1);
});

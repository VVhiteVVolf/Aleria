import assert from 'node:assert/strict';
import test from 'node:test';

import { compactMechanicalSegmentsForStorage } from '../src/mechanics/mechanical-resolution-storage.js';

test('stored combat resolutions keep audit facts but omit repeated full profile snapshots', () => {
  const hugeProfile = { schemaVersion: 9, progression: { level: 7 }, notes: 'x'.repeat(100000) };
  const [segment] = compactMechanicalSegmentsForStorage([{
    combatResolution: {
      resolutionId: 'resolution', actorId: 'a', actorName: 'A', targetId: 'b', targetName: 'B',
      actorPersistence: { kind: 'character', recordId: 'a' },
      targetPersistence: { kind: 'character', recordId: 'b' },
      actorCombatProfile: hugeProfile, targetCombatProfile: hugeProfile,
      attack: { hit: true }, targetSnapshot: { hitPointsAfter: 4 }
    }
  }]);
  assert.equal(segment.combatResolution.actorCombatProfile, undefined);
  assert.equal(segment.combatResolution.targetCombatProfile, undefined);
  assert.equal(segment.combatResolution.attack.hit, true);
  assert.equal(segment.combatResolution.profileReferences.actor.effectiveLevel, 7);
  assert.ok(JSON.stringify(segment).length < 2000);
});

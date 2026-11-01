import assert from 'node:assert/strict';
import test from 'node:test';
import { backupImportInternals } from '../src/backup/import-backup-records.js';
import { isTrustedMechanicalComment, isTrustedSceneContributionComment } from '../src/mechanics/trusted-scene-history.js';

test('mechanical backup comments become immutable history but not live trusted state', () => {
  const normalized = backupImportInternals.normalizeImportedComment({
    serverValidatedMechanics: true,
    commentSegments: [{ combatResolution: { resolutionId: 'resolution-1' } }]
  }, { auth: { uid: 'moderator-1' } }, '2026-08-03T10:00:00.000Z');

  assert.equal(normalized.serverValidatedMechanics, false);
  assert.equal(normalized.sourceServerValidatedMechanics, true);
  assert.equal(normalized.importedHistoricalMechanics, true);
  assert.equal(normalized.importStateAuthority, 'profile-snapshot');
  assert.equal(normalized.importedBy, 'moderator-1');
});

test('ordinary backup comments do not receive mechanical trust flags', () => {
  const normalized = backupImportInternals.normalizeImportedComment({ text: 'Nur ErzÃ¤hlung.' }, { auth: { uid: 'moderator-1' } }, 'now');
  assert.equal(Object.hasOwn(normalized, 'serverValidatedMechanics'), false);
  assert.equal(Object.hasOwn(normalized, 'importedHistoricalMechanics'), false);
});

test('all imported mechanical receipt kinds lose live replay authority', () => {
  const payloads = [
    { combatEncounter: { operation: 'start', encounterId: 'archived-fight' } },
    { combatEncounter: { operation: 'end', encounterId: 'archived-fight' } },
    { combatStatus: { operation: 'defeated', actorId: 'archived-enemy' } },
    { lootClaim: { actorId: 'archived-enemy', items: [] } },
    { skillResolution: { actorId: 'archived-hero' } },
    { commentSegments: [{ skillChallenge: { id: 'archived-challenge', enabled: true } }] },
    { commentSegments: [{ combatResolutions: [{ resolutionId: 'legacy-resolution' }] }] },
    { serverValidatedMechanics: true },
    { mechanicalAudit: true }
  ];
  for (const payload of payloads) {
    const original = { serverCommitted: true, ...payload };
    const normalized = backupImportInternals.normalizeImportedComment(original, { auth: { uid: 'moderator-1' } }, 'now');
    assert.equal(normalized.importedHistoricalMechanics, true, JSON.stringify(payload));
    assert.equal(isTrustedMechanicalComment(normalized), false);
    assert.equal(isTrustedSceneContributionComment(normalized), false);
    for (const key of Object.keys(payload).filter(key => key !== 'serverValidatedMechanics')) {
      assert.deepEqual(normalized[key], original[key], 'historical receipt content remains intact');
    }
  }
});

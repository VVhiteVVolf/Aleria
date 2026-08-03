import assert from 'node:assert/strict';
import test from 'node:test';
import { backupImportInternals } from '../src/backup/import-backup-records.js';

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

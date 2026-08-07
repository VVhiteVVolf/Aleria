import assert from 'node:assert/strict';
import test from 'node:test';
import { narrativeCommentInternals, buildNarrativeCommentDocument } from '../src/comments/commit-narrative-comment.js';

test('narrative comments reject nested state-changing mechanics', () => {
  assert.equal(narrativeCommentInternals.containsPersistentMechanics({
    commentSegments: [{ combatResolution: { resolutionId: 'forged' } }]
  }), true);
  assert.equal(narrativeCommentInternals.containsPersistentMechanics({
    commentSegments: [{ inventoryUse: { usageId: 'forged' } }]
  }), true);
});

test('skill results require their validator while ordinary dice events remain narrative audit data', () => {
  const metadata = {
    commentSegments: [{ skillResolution: { resolutionId: 'skill-1' } }],
    sceneDiceRoll: { total: 12 }
  };
  assert.equal(narrativeCommentInternals.containsPersistentMechanics(metadata), true);
  assert.equal(narrativeCommentInternals.containsImmutableAuditMechanics(metadata), true);
});

test('hidden skill challenges are immutable audit mechanics before resolution', () => {
  assert.equal(narrativeCommentInternals.containsImmutableAuditMechanics({
    commentSegments: [{ skillChallenge: { id: 'challenge-1', difficulty: 14 } }]
  }), true);
  assert.equal(narrativeCommentInternals.containsImmutableAuditMechanics({
    commentSegments: [{ text: 'Nur erzÃ¤hlerischer Text.' }]
  }), false);
});

test('scene time requires a bounded integer day', () => {
  const metadata = { sceneTimeEvent: { anchorDay: 3 } };
  assert.equal(narrativeCommentInternals.hasValidSceneDay(metadata), true);
  assert.equal(narrativeCommentInternals.hasValidSceneDay({ sceneTimeEvent: { anchorDay: 1.5 } }), false);
});

test('das gespeicherte Kommentar-Dokument enthaelt das Fazit-Objekt (Regression: fehlte bislang komplett)', () => {
  const fazit = { title: 'Fazit', lines: [{ id: 'line-1', kind: 'tokens', tokens: [{ id: 'token-1', kind: 'symbol', icon: '../IconOrdner/Plus.png', label: 'Test' }], text: '' }] };
  const request = { auth: { uid: 'user-1', token: { aleriaRole: 'player' } } };
  const document = buildNarrativeCommentDocument(
    { charName: 'Erzähler', text: 'Fazit', narrator: true, metadata: { commentMode: 'fazit', commentKind: 'narrator', fazit } },
    'entry-1',
    request,
    12345
  );
  assert.deepEqual(document.fazit, fazit);
});

test('ein fehlendes oder ungueltiges Fazit-Feld wird zu null statt zu einem Absturz', () => {
  const request = { auth: { uid: 'user-1', token: { aleriaRole: 'player' } } };
  const withoutFazit = buildNarrativeCommentDocument({ text: 'Text', metadata: {} }, 'entry-1', request, 1);
  assert.equal(withoutFazit.fazit, null);
  const withInvalidFazit = buildNarrativeCommentDocument({ text: 'Text', metadata: { fazit: 'not-an-object' } }, 'entry-1', request, 1);
  assert.equal(withInvalidFazit.fazit, null);
});

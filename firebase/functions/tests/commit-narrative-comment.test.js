import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { narrativeCommentInternals, buildNarrativeCommentDocument, commitNarrativeCommentOperation } from '../src/comments/commit-narrative-comment.js';
import { normalizeCommentSceneStartDate } from '../src/comments/comment-scene-date.js';
import { database } from './fixtures/combat-transaction-database.js';

test('trade receipts cannot be forged through narrative comments, even as a nested segment', async () => {
  for (const metadata of [{ sceneTrade: { lines: [] } }, { commentSegments: [{ sceneTrade: { lines: [] } }] }]) {
    assert.equal(narrativeCommentInternals.containsPersistentMechanics(metadata), true);
    await assert.rejects(commitNarrativeCommentOperation({ auth: { uid: 'owner', token: {} }, data: { entryId: 'scene', text: 'Handel', metadata } }, { database: {} }), /Transaktion/);
  }
});

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

test('valid scene dates use the same calendar as the browser and retain only normalized date fields', () => {
  const browser = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../../../AleriaAlmanach/modules/world-date/world-date-model.js', import.meta.url), 'utf8'), browser);
  for (const year of [1, 1740, 99999]) for (let month = 1; month <= 13; month++) for (const day of [1, 36]) {
    const date = { year, month, day };
    const normalized = normalizeCommentSceneStartDate({ ...date, unrelated: 'discard' });
    assert.deepEqual(normalized, date);
    assert.equal(browser.AleriaWorldDateModel.isValid(normalized), true);
    assert.deepEqual({ ...browser.AleriaWorldDateModel.normalize(normalized) }, normalized);
  }
});

test('the shared narrative document preserves a valid scene start date and drops invalid optional dates', () => {
  const request = { auth: { uid: 'player', token: {} } };
  const date = { year: 1740, month: 13, day: 36 };
  const document = buildNarrativeCommentDocument({ text: 'Wartet.', metadata: { sceneStartDateAleria: { ...date, unwanted: true } } }, 'scene', request, 1);
  assert.deepEqual(document.sceneStartDateAleria, date);
  for (const invalid of [undefined, null, '1740-3-9', [], {}, { year: '1740', month: 3, day: 9 },
    { year: 0, month: 3, day: 9 }, { year: 1740.5, month: 3, day: 9 },
    { year: Number.MAX_SAFE_INTEGER + 1, month: 3, day: 9 }, { year: Infinity, month: 3, day: 9 },
    { year: 1740, month: 14, day: 9 }, { year: 1740, month: 0, day: 9 },
    { year: 1740, month: 3.5, day: 9 }, { year: 1740, month: 3, day: 0 },
    { year: 1740, month: 3, day: 37 }, { year: 1740, month: 3, day: 9.5 }]) {
    const result = buildNarrativeCommentDocument({ text: 'Wartet.', metadata: { sceneStartDateAleria: invalid } }, 'scene', request, 1);
    assert.equal(result.sceneStartDateAleria, null);
  }
});

test('a committed scene comment restores its start date after reload without a module date', async () => {
  const db = database({});
  const date = { year: 1740, month: 3, day: 9 };
  const result = await commitNarrativeCommentOperation({ auth: { uid: 'player', token: {} },
    data: { entryId: 'scene', charName: 'Rianna Wyrm', text: 'Liest die Anzeigetafel.', metadata: { sceneStartDateAleria: date } }
  }, { database: db, now: 100 });
  const saved = db.data.get(`comments/${result.id}`);
  assert.deepEqual(saved.sceneStartDateAleria, date);
  assert.deepEqual([...db.data.keys()], [`comments/${result.id}`]);

  const browser = vm.createContext({});
  for (const filename of ['world-date-model.js', 'world-date-scene-default.js']) {
    vm.runInContext(readFileSync(new URL(`../../../AleriaAlmanach/modules/world-date/${filename}`, import.meta.url), 'utf8'), browser);
  }
  const restored = browser.AleriaSceneDateDefaults.resolve({ page: {}, threadId: 'scene' }, [JSON.parse(JSON.stringify(saved))]);
  assert.deepEqual({ ...restored }, date);
});

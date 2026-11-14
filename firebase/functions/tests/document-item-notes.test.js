import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { database } from './fixtures/combat-transaction-database.js';
import { documentItemNotesOperation } from '../src/document-notes/document-item-notes.js';
const context = { documentId: 'test-book', kind: 'characters', holderId: 'owner-character', instanceId: 'physical-book' };
const auth = { uid: 'owner', token: { aleriaRole: 'player' } };
const character = () => ({ ownerUid: 'owner', inventory: { items: [{ id: 'book', instanceId: context.instanceId, documentRef: { id: context.documentId }, quantity: '1' }], moneyState: { copper: 17 }, revision: 7 }, combatProfile: { retained: true } });
const request = (data = {}, session = auth) => ({ auth: session, data: { ...context, action: 'load', ...data } });
const save = (text, expectedRevision = 0, mutationId = 'test-save-0001') => request({ action: 'save', text, expectedRevision, mutationId });
const options = db => ({ db, now: () => '2026-11-14T12:00:00Z' });
test('saved notes persist with the book, while all inventory and game fields remain byte-equivalent', async () => {
  const before = character(), db = database({ 'characters/owner-character': before });
  assert.equal((await documentItemNotesOperation(request(), options(db))).notes.revision, 0);
  const first = await documentItemNotesOperation(save('Lleians Wegzeit nachfragen.'), options(db));
  assert.equal(first.notes.revision, 1);
  assert.equal((await documentItemNotesOperation(request(), options(db))).notes.text, 'Lleians Wegzeit nachfragen.');
  assert.deepEqual(db.data.get('characters/owner-character'), before);
  assert.equal(db.data.size, 2);
  assert.deepEqual(await documentItemNotesOperation(save('Lleians Wegzeit nachfragen.'), options(db)), first);
});
test('concurrent edits use CAS, and replay cannot change text or borrow another account', async () => {
  const db = database({ 'characters/owner-character': character() });
  const results = await Promise.allSettled([
    documentItemNotesOperation(save('Erster Text', 0, 'concurrent-0001'), options(db)),
    documentItemNotesOperation(save('Zweiter Text', 0, 'concurrent-0002'), options(db))
  ]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'aborted');
  await assert.rejects(documentItemNotesOperation(save('Anderer Inhalt', 0, 'concurrent-0001'), options(db)), { code: 'already-exists' });
  await assert.rejects(documentItemNotesOperation(request({}, { uid: 'stranger', token: {} }), options(db)), { code: 'permission-denied' });
});
test('notes follow the same physical book after a transfer; old holder links stop working', async () => {
  const db = database({ 'characters/owner-character': character() });
  await documentItemNotesOperation(save('Bleibt im Buch.'), options(db));
  const moved = structuredClone(db.data.get('characters/owner-character'));
  db.data.set('characters/new-character', { ...moved, ownerUid: 'new-owner' });
  db.data.set('characters/owner-character', { ...character(), inventory: { ...character().inventory, items: [] } });
  await assert.rejects(documentItemNotesOperation(request(), options(db)), { code: 'failed-precondition' });
  const result = await documentItemNotesOperation(request({ holderId: 'new-character' }, { uid: 'new-owner', token: {} }), options(db));
  assert.equal(result.notes.text, 'Bleibt im Buch.');
});
test('only the current valid book, bounded plain text and authorized editors can reach notes', async () => {
  const db = database({ 'characters/owner-character': character() });
  await assert.rejects(documentItemNotesOperation(request({}, null), options(db)), { code: 'unauthenticated' });
  for (const patch of [{ documentId: '../bad' }, { holderId: '../bad' }, { instanceId: '' }, { kind: 'users' }]) await assert.rejects(documentItemNotesOperation(request(patch), options(db)), { code: 'invalid-argument' });
  await assert.rejects(documentItemNotesOperation(request({ documentId: 'another-book' }), options(db)), { code: 'failed-precondition' });
  await assert.rejects(documentItemNotesOperation(save('x'.repeat(10001)), options(db)), { code: 'invalid-argument' });
  await assert.rejects(documentItemNotesOperation(save('text', -1), options(db)), { code: 'invalid-argument' });
  const admin = { uid: 'moderator', token: { aleriaRole: 'moderator' } };
  assert.equal((await documentItemNotesOperation(request({}, admin), options(db))).notes.text, '');
  await documentItemNotesOperation(save('<script>Kein HTML, nur Text.</script>'), options(db));
  const key = createHash('sha256').update('test-book:physical-book').digest('hex');
  assert.equal(db.data.get(`item_document_notes/${key}`).text, '<script>Kein HTML, nur Text.</script>');
});

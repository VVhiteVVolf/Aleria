import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogPurchaseSubmission } from '../modules/catalog-purchase/catalog-purchase-submission.js';
import { createCatalogPurchasePreferences } from '../modules/catalog-purchase/catalog-purchase-preferences.js';
import { safeImage } from '../modules/item-register/item-register-markup.js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const request = () => ({ action: 'catalog-checkout', entryId: 'shop', merchantId: 'module:shop', actorCharacterId: 'gawain',
  expectedRevisions: { 'character:gawain': 3, 'character:ylva': 2 },
  lines: [{ id: 'purchase', direction: 'buy', priceMode: 'standard', productId: 'one', quantity: 1,
    payerKey: 'character:gawain', recipientKey: 'character:ylva', expectedTotalMinor: 101 }] });

test('Ein unklarer Direktkauf bleibt über Dialog- und Instanzwechsel genau derselbe Auftrag', async () => {
  const cache = storage(), sent = [];
  const first = createCatalogPurchaseSubmission(async value => { sent.push(value); throw Object.assign(Error('Antwort verloren'), { code: 'functions/unavailable' }); }, () => 'original');
  first.bindPersistence({ storage: cache, uid: 'user', threadId: 'shop' });
  const input = request();
  await assert.rejects(first.submit(input), /Antwort verloren/);
  input.lines[0].expectedTotalMinor = 9000;
  assert.equal(first.pending().lines[0].expectedTotalMinor, 101);
  assert.throws(() => first.submit(request()), /zuerst/);
  const reopened = createCatalogPurchaseSubmission(async value => { sent.push(value); return { committed: true }; }, () => 'must-not-run');
  reopened.bindPersistence({ storage: cache, uid: 'user', threadId: 'shop' });
  await reopened.retry();
  assert.deepEqual(sent[1], sent[0]);
  assert.equal(sent[1].operationId, 'original');
  assert.equal(reopened.pending(), null);
});

test('Ein definitiver Preis-/Revisionskonflikt bucht nicht weiter und gibt die bearbeitbare Auswahl frei', async () => {
  const submission = createCatalogPurchaseSubmission(async () => { throw Object.assign(Error('Preis geändert'), { code: 'functions/aborted' }); });
  submission.bindPersistence({ storage: storage(), uid: 'user', threadId: 'shop' });
  await assert.rejects(submission.submit(request()), /Preis geändert/);
  assert.equal(submission.pending(), null);
});

test('Fehlender Sitzungsspeicher blockiert den Kauf vor dem Netzaufruf; Anmeldung und Laden bleiben getrennt', async () => {
  let calls = 0;
  const submission = createCatalogPurchaseSubmission(async () => { calls++; });
  assert.throws(() => submission.bindPersistence({ storage: null, uid: 'user', threadId: 'shop' }), /Sitzungsspeicher/);
  assert.throws(() => submission.submit(request()), /Sitzungsspeicher/);
  assert.equal(calls, 0);
  const cache = storage(), first = createCatalogPurchaseSubmission(async () => { throw Error('offline'); });
  first.bindPersistence({ storage: cache, uid: 'user', threadId: 'shop' });
  await assert.rejects(first.submit(request()));
  assert.throws(() => first.bindPersistence({ storage: cache, uid: 'other', threadId: 'shop' }), /anderen Anmeldung/);
  const otherShop = createCatalogPurchaseSubmission(async () => {});
  otherShop.bindPersistence({ storage: cache, uid: 'user', threadId: 'other-shop' });
  assert.equal(otherShop.pending(), null);
});

test('Gemerkte Zahler/Empfänger enthalten nur Identitäten und gelten pro Anmeldung und Modul', () => {
  const cache = storage(), preferences = createCatalogPurchasePreferences(cache, 'user', 'shop');
  preferences.save({ payerKey: 'group:party', recipientKey: 'character:ylva', actorCharacterId: 'gawain', money: 'secret balance' });
  assert.deepEqual(preferences.read(), { payerKey: 'group:party', recipientKey: 'character:ylva', actorCharacterId: 'gawain' });
  assert.deepEqual(createCatalogPurchasePreferences(cache, 'other', 'shop').read(), {});
  assert.deepEqual(createCatalogPurchasePreferences(cache, 'user', 'other').read(), {});
  const unavailable = createCatalogPurchasePreferences(null, 'user', 'shop');
  unavailable.save({}); assert.deepEqual(unavailable.read(), {});
});

test('Lokale kanonische Item-/Avatarbilder sind erlaubt, ausführbare und protokollrelative Quellen bleiben gesperrt', () => {
  assert.equal(safeImage('/AleriaAlmanach/assets/ring.png'), '/AleriaAlmanach/assets/ring.png');
  assert.equal(safeImage('./public/assets/portrait.png'), './public/assets/portrait.png');
  assert.equal(safeImage('//unknown.invalid/image.png'), '');
  assert.equal(safeImage('/' + String.fromCharCode(92) + 'unknown.invalid/image.png'), '');
  assert.equal(safeImage('javascript:alert(1)'), '');
  assert.equal(safeImage('data:text/html,unsafe'), '');
});
